# 23 Team — Tools, Commands and Fallbacks

Put downloaded or fetched material in its own directory; keep scripts elsewhere. Never
print secrets: mask token-like strings in any output (`sed -E 's/[0-9]{6,}:[A-Za-z0-9_-]{30,}/[REDACTED]/g'`).

## Inspection

| Task | How |
|---|---|
| Fetch page + headers | `curl -sS -D headers.txt -o page.html -L https://SITE/` |
| Strip huge base64 for reading | `python3 -c "import re;s=open('page.html').read();print(re.sub(r'\"[A-Za-z0-9+/=]{5000,}\"','\"<B64>\"',s))"` |
| Hosting files | Hostinger: `hosting_files_list-website-and-directories` (dotfiles may be hidden; check `.htaccess` with `hosting_files_website-content`) |
| Live DNS | DNS-over-HTTPS: `curl -s -H 'accept: application/dns-json' "https://cloudflare-dns.com/dns-query?name=SITE&type=NS"` (NS, A, AAAA, CNAME www, MX, TXT, _dmarc, CAA, DS, DNSKEY) |
| Subdomains | crt.sh `?q=%25.SITE&output=json` (may time out) + common-name loop via DoH |
| Cloudflare | `/accounts`, `/accounts/{id}/members` (roles, 2FA), `/workers/scripts`, `/workers/scripts/{s}/settings` (binding types — never values), `/versions`, `/subdomain` (previews), `/zones` |

## Testing

| Area | Tool / command |
|---|---|
| TLS | Qualys SSL Labs API `https://api.ssllabs.com/api/v3/analyze?host=SITE&all=done` (poll until READY) |
| Headers | `curl -sI` on every template + a 404 URL |
| Sensitive paths | Probe list: `.env .env.local .env.production .git/HEAD .git/config .gitignore .htaccess .htpasswd .user.ini php.ini .DS_Store README.md *.md backup.zip site.zip db.sql dump.sql wp-config.php wp-login.php wp-admin/ admin/ phpmyadmin/ cpanel server-status server-info phpinfo.php info.php test.php cgi-bin/ logs/ error_log access_log *.map package.json composer.json .vscode/ .idea/ sftp-config.json .ftpconfig` plus any setup/worker/backup names seen on the server |
| Methods / traversal | `curl -X TRACE/PUT/DELETE/PROPFIND`; `/%2e%2e/%2e%2e/etc/passwd`, `/..%2f..%2f`, `//evil.example`, `?next=https://evil.example` |
| Browser behaviour | Playwright (preinstalled Chromium): cookies, local/session storage, request hosts, console + CSP errors, iframe embed test, form paths with the endpoint mocked via `context.route` |
| Accessibility | axe-core in Playwright (`runOnly: wcag2a, wcag2aa, wcag21aa, wcag22aa`), reveal animated elements and wait before contrast checks; keyboard Tab sequence; alt-text snippet from `accessibility.md` |
| Secrets | detect-secrets (`pip install detect-secrets`), gitleaks or trufflehog on repos, plus targeted regex; investigate every hit |
| SAST | semgrep (`pip install semgrep`; packs p/javascript p/xss p/secrets p/owasp-top-ten; add p/php, p/python etc. per stack) |
| Dependencies | npm/pnpm/yarn audit · pip-audit · composer audit · WP: plugin/theme/core versions vs. vendor advisories |
| DAST | OWASP ZAP baseline (Docker `zaproxy/zap-stable zap-baseline.py -t URL`) — passive, authorized targets only |
| Performance / SEO | Lighthouse CLI · page weight from Playwright `transferSize` · broken links (linkinator or crawl script) |
| Exposure | Shodan InternetDB `https://internetdb.shodan.io/IP` (passive) |
| Serverless input tests | `curl -X POST` with bodies: `null`, `[]`, `"x"`, `{bad`, empty, objects in fields, 9 KB+, wrong content types, no/foreign Origin, extra routing fields |

## Rate-limit testing (lessons learned)

* Use requests that are rejected **before** any side effect (e.g. foreign Origin) if the
  limiter runs first, so no real messages are sent.
* Check egress IP stability first: `for i in $(seq 1 20); do curl -s https://cloudflare.com/cdn-cgi/trace | grep ^ip=; done | sort | uniq -c`.
  With N rotating IPs, send well over N × limit requests in parallel (`xargs -P 20`).
* No 429 after that → FAIL. A local mocked test never counts.

## Fallbacks when something is blocked

| Blocked | Fallback | Tell the client |
|---|---|---|
| TLS inspection (proxy re-signs certs) | SSL Labs + crt.sh | — |
| Port scan not possible | Shodan InternetDB; list as NOT RUN | Host's security panel or an authorized external scan |
| GitHub repo can't be created | Locked server-side backup folder (`Require all denied`, verify 403) + local copy | Connect GitHub (claude.ai/connect-github), start a session with the repo |
| Hostinger file read limit | Fetch the live file over HTTPS | — |
| Hostinger API has no delete | File-manager REST from the upload URL: `DELETE {base}/api/resources/public_html/<path>` with the same auth headers; or `.htaccess` deny rule | Or delete in hPanel File Manager |
| Hostinger backups/FTP/2FA not in API | NEEDS VERIFICATION | hPanel → Files → Backups / FTP Accounts; account security |
| Legislation site won't load | Try alternative official mirror (e.g. net.jogtar.hu for HU); else record "source not read" | Legal review |
| Old serverless versions' code not retrievable | Check binding types per version; NEEDS VERIFICATION | Provider dashboard |
| Telegram / WhatsApp settings | NEEDS VERIFICATION | BotFather `/mybots` (token, Allow Groups, webhook); app 2-step verification; chat members |
| Registrar (non-API) | NEEDS VERIFICATION | Registrar panel: 2FA, lock, renew, DNS records |

## Deploy helpers (Hostinger + Cloudflare)

* Hostinger upload: `hosting_files_generate-upload-url` → TUS `POST` (create) then `PATCH`
  (bytes) per file; store the short-lived auth in a 0600 temp file, delete after.
  Upload protective `.htaccess` before protected files. Byte-compare live vs. build.
* Cloudflare Worker deploy keeping secrets: multipart `PUT /workers/scripts/{s}` with
  metadata `keep_bindings: ["secret_text","plain_text"]` + new bindings; then confirm
  bindings and versions. Rollback: Deployments → previous version.
