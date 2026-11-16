"""Cache official machine icons referenced by public HTB achievement pages."""
import html
import json
import re
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
from urllib.request import Request, urlopen

MACHINES = {
    "devhub": ("DevHub", 903, 2786533), "reactor": ("Reactor", 900, 670935),
    "airtouch": ("AirTouch", 823, 1069235), "environment": ("Environment", 659, 4935),
    "editor": ("Editor", 684, 1517372), "soulmate": ("Soulmate", 721, 1984684),
    "puppy": ("Puppy", 661, 1655119), "darkzero": ("DarkZero", 754, 392375),
    "touch": ("Touch", 987, 2786533),
    "layover": ("Layover", 984, 2123326),
    "autopilot": ("Autopilot", 993, 2123326), "stream": ("Stream", 990, 2123326),
}
DESTINATION = Path(__file__).resolve().parents[1] / "public/assets/htb"

def fetch(url):
    request = Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urlopen(request, timeout=30) as response:
        return response.read()

def machine_icon(item):
    slug, (name, machine_id, member_id) = item
    source = f"https://labs.hackthebox.com/achievement/machine/{member_id}/{machine_id}"
    page = fetch(source).decode()
    if f"{name} has been Pwned" not in page:
        raise ValueError(f"Unexpected machine page for {name}")
    match = re.search(r'src="(https://cdn[^\"]+/content/machines/avatar/[^\"]+)"', page)
    if not match:
        raise ValueError(f"No official icon found for {name}")
    url = html.unescape(match.group(1))
    data = fetch(url)
    if not data.startswith(b"\x89PNG\r\n\x1a\n"):
        raise ValueError(f"Unexpected image format for {name}")
    (DESTINATION / f"{slug}.png").write_bytes(data)
    print(f"{name}: {len(data)} bytes")
    return slug, {"name": name, "machineId": machine_id, "sourcePage": source, "sourceImage": url}

if __name__ == "__main__":
    DESTINATION.mkdir(parents=True, exist_ok=True)
    with ThreadPoolExecutor(max_workers=3) as pool:
        sources = dict(pool.map(machine_icon, MACHINES.items()))
    (DESTINATION / "sources.json").write_text(json.dumps(sources, indent=2) + "\n")
