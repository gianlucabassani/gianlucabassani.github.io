# Windows XP Activation CTF Writeup


## Description

"It is the year 2079. JavaScript has become so absurdly strong that Microslop is rebooting Windows XP through the web. You have been given access to a Microslop employee PC, and your task is to activate Windows XP. Are you skilled enough ?"

---
## Prerequisites

This challenge revolves around reverse-engineering client-side JavaScript, abusing a custom Web RPC bridge, and reconstructing legacy Windows XP activation database (`wpa.dbl`) records.

Useful stuff to know:
* HTTP requests to `/_vti_bin/_vti_rpc`
* SHA1 request signing (`X-Shell-Bridge`)
* PBKDF2-HMAC-SHA1 key derivation
* Basic Python scripting for automation

---
## Usage of LLMs in Reversing

Reversing complex client-side obfuscation and debugging cryptographic mismatches manually is highly time-consuming. During this challenge, Gemini 3.5 Flash was used as an assistant during the reversing process to speed up experimentation and script generation.

1. **De-obfuscating `shellGhost`**: By feeding the raw obfuscated snippet from `app.js` to the LLM, it immediately identified the character translation logic, mapping the target file paths to their opaque IDs.
2. **Drafting Verification Scripts**: Instead of manually implementing the reversed Base64 transport layer and SHA1 headers, the LLM generated Python verification templates in seconds, allowing immediate testing of backend endpoints.
3. **Debugging Cryptographic Mismatches**: When the database decryption initially failed due to an unknown step parameter and order of operations, the LLM suggested writing a permutations brute-forcer. This automated testing of all possible execution paths (rotations, XORs, nibble swaps, and endianness) against the target SHA1 hash.

---
# Challenge Analysis

## The Desktop & Activation Wizard

The web desktop loads a simulated Windows XP environment. Opening the activation wizard reveals the telephone activation screen prompting for a Confirmation ID.

![product activation](https://gianlucabassani.github.io/assets/ctf/product_activation.png)

## Reconnaissance & Intercepting Traffic

By inspecting the network traffic while navigating the web desktop (such as accessing the Recycle Bin and retrieving the deleted notes), we can intercept the backend communication.

![deleted note request](https://gianlucabassani.github.io/assets/ctf/deleted_note_request.png)

Using CyberChef to reverse and decode the base64-encoded response, we reveal the contents of the deleted support notes. These notes contain critical details for rebuilding the database (including file offsets, rotation step profiles, and validation hashes) and reveal the custom reversed-base64 transport layout used throughout the application.

![CyberChef deleted note](https://gianlucabassani.github.io/assets/ctf/cyber_chef_deleted_note.png)

## app.js (RPC Transport & shellGhost Mapping)

Rather than exposing filesystem paths directly, the application referenced every protected file using a six-character opaque identifier derived from an obfuscated lookup table.
Communication with the backend occurs through a custom RPC system:

```javascript
const LEGACY_TRANSPORT = {
  endpoint: "/_vti_bin/_vti_rpc",
  bridgeHeader: "X-Windows-XP",
  bridgeValue: "5.1",
  eventCodes: {
    activationStatus: "NQ",
    activationSubmit: "QK",
    fileRead: "R7",
  },
};
```

All payloads sent to this endpoint are stringified JSONs that are base64-encoded and reversed:
```javascript
const body = reverse(btoa(JSON.stringify(payload)));
```

---
### shellGhost Obfuscation

You cannot list directory contents or read files by their raw paths. Instead, the application maps files using a custom de-obfuscation logic called `shellGhost`:

```javascript
const shellGhost = {
  g(index) {
    const bins = [
      [90, 59, 70, 60, 74, 59],
      [67, 51, 64, 56, 93, 61],
      [70, 59, 70, 56, 90, 59],
    ];
    const order = [2, 0, 1];
    const pad = 11;
    const fog = [17, 4, 22, 9, 1, 30];

    return String.fromCharCode(
      ...bins[order[index]].map(
        (value, slot) => (value ^ pad) - ((fog[slot] % 2) ? 0 : 0)
      )
    );
  },
};
```

By computing `shellGhost.g(index)`:
- `index = 0` (Recycle Bin Note) $\to$ **`M0M3Q0`**
- `index = 1` (`WINDOWS\system32\oobe.log`) $\to$ **`Q0M7A0`**
- `index = 2` (`WINDOWS\system32\wpa.dbl`) $\to$ **`H8K3V6`**

Here is a simple script to resolve the file IDs:

```python
# shell_ghost_resolver.py
bins = [
    [90, 59, 70, 60, 74, 59],
    [67, 51, 64, 56, 93, 61],
    [70, 59, 70, 56, 90, 59],
]
order = [2, 0, 1]
pad = 11

for idx in range(3):
    s_id = "".join(chr(val ^ pad) for val in bins[order[idx]])
    print(f"Index {idx}: {s_id}")
```

**Output:**
```
Index 0: M0M3Q0
Index 1: Q0M7A0
Index 2: H8K3V6
```

---

# Exploitation Path

High-level idea:
1. Initialize session and grab credentials (`installationId`, `productId`, `shellBridge`) via `NQ`.
2. Extract the Recycle Bin notes (`M0M3Q0`) to obtain the verification SHA1 hash.
3. Download `wpa.dbl` (`H8K3V6`) and extract the 32-bit records.
4. Compute the SHA256 mask windows and decrypt the database slots.
5. Reorder the slots to rebuild the raw license buffer.
6. Generate the Confirmation ID using PBKDF2-HMAC-SHA1 and activate the OS.
7. Grab the flag.

*(Note: The custom encoding helper functions used below are defined in the Appendix).*

---
## 1. Enumeration & Handshake

To interact with the backend API, we must first establish a dynamic session state. We send an empty `NQ` status handshake request to trigger session creation.

```python
# handshake.py
import requests
from utils import encode_rpc_packet, decode_rpc_packet

BASE_URL = "https://windows-experience-fcb591fed802.c.mntcrl.it"
ENDPOINT = BASE_URL + "/_vti_bin/_vti_rpc"

s = requests.Session()
payload = encode_rpc_packet("NQ", {})
resp = s.post(ENDPOINT, data=payload, headers={"Content-Type": "text/plain;charset=UTF-8", "X-Windows-XP": "5.1"})

print("Handshake Response (Decoded):")
print(json.dumps(decode_rpc_packet(resp.text), indent=2))
```

**Handshake Response (Decoded):**
```json
{
  "ok": true,
  "installationId": "473282-406875-813865-724382-218375-055588-305925-550443-92",
  "productId": "55274-640-2673064-23917",
  "shellBridge": "SzAcBn4Q0pFMNxMkhOj7UhtR",
  "machineGuid": "CE4E4312F3F2AF016229EEFC5FEDD700"
}
```
*(The raw encoded response is omitted for readability).*

---
## 2. Reading wpa.dbl

The activation backend only accepts authenticated requests. After obtaining the session-specific `shellBridge` token during the handshake, every subsequent request must be signed using a custom SHA1 scheme:

$$\text{Signature} = \text{SHA1}(\text{eventCode} + \text{"|"} + \text{body} + \text{"|"} + \text{shellBridge} + \text{"|"} + \text{installation\_id\_digits\_first\_18})$$

Using this signature header, we fetch the hex dump of `wpa.dbl` (`H8K3V6`):

```python
# read_file.py
import requests
from utils import encode_rpc_packet, build_rpc_auth

BASE_URL = "https://windows-experience-fcb591fed802.c.mntcrl.it"
ENDPOINT = BASE_URL + "/_vti_bin/_vti_rpc"

SB = "SzAcBn4Q0pFMNxMkhOj7UhtR"
IID = "473282-406875-813865-724382-218375-055588-305925-550443-92"
COOKIE = "SzAcBn4Q0pFMNxMkhOj7UhtR"

s = requests.Session()
s.cookies.set("XPSESSION", COOKIE)

payload = {"s": "H8K3V6"}
body = encode_rpc_packet("R7", payload)
sig = build_rpc_auth("R7", body, SB, IID)

resp = s.post(ENDPOINT, data=body, headers={
    "Content-Type": "text/plain;charset=UTF-8",
    "X-Windows-XP": "5.1",
    "X-Shell-Bridge": sig
})

print("wpa.dbl hex dump fetched successfully.")
```

**Parsed Hex Dump Offsets:**
```
Offset    Value
0x0130    b772a404
0x01A8    fd383582
0x0220    5ac706af
0x0298    9ff4aee5
0x0310    327914c8
0x0388    38dbde11
```
*(The raw encoded response payload is omitted for readability).*

---
## 3. Database Decryption & Permutation Brute-Force

No single note contained the complete algorithm. Instead, multiple partial hints had to be combined and validated experimentally.

Each decrypted 4-byte database slot is XORed against consecutive 4-byte windows of $\text{SHA256}(\text{ProductID} + \text{"|"} + \text{InstallationID50})$. 

However, the deleted support notes contained ambiguous instructions regarding the step sizes, rotation directions, and slot arrangements. To resolve this, a permutation brute-forcer was built. Each permutation of rotation order, nibble swapping, XOR ordering, and slot arrangement was tested against the SHA1 validation hash extracted from the deleted Recycle Bin support notes.

Only one permutation successfully matched the target hash, revealing the missing rotation step (`2`) and the target slot mapping layout:

```python
# decrypt_database.py
import hashlib
from utils import ror32, swap_nibbles_32

PID = "55274-640-2673064-23917"
IID = "473282-406875-813865-724382-218375-055588-305925-550443-92"

records_hex = ["b772a404", "fd383582", "5ac706af", "9ff4aee5", "327914c8", "38dbde11"]
records_bytes = [bytes.fromhex(h) for h in records_hex]

steps = [3, 1, 2, 1, 3, 2]
db_order = [6, 3, 1, 5, 2, 4]
inst_id50 = "".join(filter(str.isdigit, IID))
seed = f"{PID}|{inst_id50}"
sha = hashlib.sha256(seed.encode()).digest()
masks = [sha[i:i+4] for i in range(0, 24, 4)]

processed = []
for i in range(6):
    rec = int.from_bytes(records_bytes[i], 'little')
    mask_val = int.from_bytes(masks[i], 'little')
    
    rotated = ror32(rec, steps[i] * 8)
    xored = rotated ^ mask_val
    swapped = swap_nibbles_32(xored)
    processed.append(swapped)

reordered = [None] * 6
for slot_idx, pos in enumerate(db_order):
    reordered[pos-1] = processed[slot_idx]

raw_buffer = b"".join([r.to_bytes(4, 'little') for r in reordered])
print("Reconstructed Buffer (Hex):", raw_buffer.hex().upper())
```

**Output:**
```
Reconstructed Buffer (Hex): DB074BE20816A19F2FA3755A43EF08035AFE7A79CBA6D9FE
```

---
## 4. Keygen & Activation

Using the reconstructed 24-byte buffer as the PBKDF2 salt and the 50-digit Installation ID as the password, the PBKDF2 seed was derived to generate the 7 groups of the Activation Confirmation ID:

```python
# keygen.py
import hashlib

IID = "473282-406875-813865-724382-218375-055588-305925-550443-92"
RAW_BUFFER_HEX = "DB074BE20816A19F2FA3755A43EF08035AFE7A79CBA6D9FE"

def compute_confirmation_id(inst_id, raw_rebuild_buffer):
    inst = "".join(filter(str.isdigit, inst_id))
    seed = hashlib.pbkdf2_hmac('sha1', inst.encode('ascii'), raw_rebuild_buffer, 1600, dklen=28)
    
    carry = 0
    groups = []
    for n in range(7):
        seed_block = seed[n*4:(n+1)*4]
        seed_val = int.from_bytes(seed_block, 'big')
        chunk = inst[n*7:n*7+7]
        install_chunk = int(chunk) if chunk else 0
        value = (seed_val ^ install_chunk ^ (carry << 5)) % 1000000
        carry = value % 97
        groups.append(f"{value:06d}")
    return "-".join(groups)

raw_buffer = bytes.fromhex(RAW_BUFFER_HEX)
print("Confirmation ID:", compute_confirmation_id(IID, raw_buffer))
```

**Output:**
```
Confirmation ID: 954848-181163-906536-121516-791720-642055-667798
```

The Confirmation ID is submitted via the `QK` event.

---
# Get the Flag

Once the Confirmation ID is submitted and the system is activated, we make a final signed GET request to `/flag` using the active session credentials:

```bash
curl -i https://windows-experience-fcb591fed802.c.mntcrl.it/flag \
  -H "X-Shell-Bridge: <LATEST_SHELL_BRIDGE>" \
  -H "Cookie: XPSESSION=<YOUR_COOKIE>"
```

**Output:**
```html
<h1>localhost</h1>
<pre>mntcrl{1_st1ll_h4t3_m1cr0sl0p_4ft3r_4ll!!!_c70b4d7d3a1a6397}</pre>
```

---
## Key Takeaways  
  
- Reverse engineering the JavaScript transport revealed several undocumented RPC operations.  
- The application relied on client-side obfuscation rather than access control.  
- Session-specific signing prevented replay attacks but could be reproduced once the algorithm was understood.  
- The Windows XP activation database was reconstructed by reversing its custom storage format instead of attacking the activation algorithm directly.

---
## Appendix: Helper Utilities

To avoid code duplication across the walkthrough phase scripts, the following shared functions were moved to a utility file (`utils.py`):

```python
# utils.py
import json
import base64
import hashlib

def encode_rpc_packet(event_code, payload):
    json_str = json.dumps({"v": 1, "e": event_code, "d": payload}, separators=(",", ":"))
    b64 = base64.b64encode(json_str.encode()).decode()
    return b64[::-1]

def decode_rpc_packet(encoded):
    if not encoded:
        return None
    try:
        rev = encoded[::-1]
        while len(rev) % 4:
            rev += "="
        json_str = base64.b64decode(rev).decode("utf-8")
        return json.loads(json_str)
    except:
        return None

def build_rpc_auth(event_code, encoded_body, shell_bridge, installation_id):
    inst_digits = "".join(filter(str.isdigit, installation_id))[:18]
    seed = f"{event_code}|{encoded_body}|{shell_bridge}|{inst_digits}"
    return hashlib.sha1(seed.encode()).hexdigest().upper()

def ror32(value, bits):
    return ((value >> bits) | (value << (32 - bits))) & 0xFFFFFFFF

def swap_nibbles_byte(b):
    return ((b & 0x0F) << 4) | ((b & 0xF0) >> 4)

def swap_nibbles_32(x):
    res = 0
    for i in range(4):
        b = (x >> (8*i)) & 0xFF
        nb = swap_nibbles_byte(b)
        res |= (nb << (8*i))
    return res
```

