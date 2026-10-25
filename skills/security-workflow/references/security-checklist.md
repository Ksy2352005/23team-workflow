# 23 Team — Security Verification Checklist (A–H)

Use for every security review, launch and "final verification". Perform the checks the
tools and permissions allow; do not stop at a plan.

## Rules for the audit

1. Inspect the actual implementation and configuration wherever access exists.
2. A feature existing or a config file looking right is not evidence.
3. No PASS without evidence; a check you could not perform is never PASS.
4. Tag every result with its method: **[Code]** source inspection · **[Auto]** automated
   tool · **[Live]** request/browser test against production · **[Config]** settings read
   via dashboard/API · **[External]** third-party scanner · **[Owner]** stated by the client
   (not independently verified).
5. Never claim complete security. State that no audit can guarantee the absence of all
   vulnerabilities.
6. Never expose secrets or personal data in the report.
7. No destructive tests, production data changes or risky changes without approval.
8. Missing access → name exactly what is missing and how the client provides or checks it.
9. Prioritize: customer data exposure, account compromise, unauthorized access,
   compromise of the site or integrations.
10. Irrelevant checks → NOT APPLICABLE with the reason, never FAIL.

Statuses: PASS · FAIL · NOT RUN · NEEDS VERIFICATION · NEEDS LEGAL REVIEW · NOT APPLICABLE.
Every FAIL: issue · severity · realistic impact · location · fix · fixed? · retested?

## A. Code and dependencies

- [ ] No hardcoded passwords, API keys, bot tokens, private keys or other secrets in code or public files
- [ ] Secrets stored in environment variables / secret managers (including every old version of serverless functions)
- [ ] Secrets not exposed via frontend JS, responses, source maps, logs or repository history
- [ ] Dependencies inventoried (packages + CDN scripts/fonts + runtime/CMS versions)
- [ ] Outdated or vulnerable dependencies identified and assessed
- [ ] Input validation wherever user input enters (including `null`, arrays, wrong types, oversize)
- [ ] Output escaped or sanitized (no DOM XSS sinks with user data)
- [ ] Database queries protected against injection
- [ ] File uploads restricted and validated
- [ ] Errors expose no secrets, paths, stack traces or internals
- [ ] No debug features or development endpoints in production
- [ ] Authentication and authorization correct where required
- [ ] Access control enforced on the server
- [ ] Admin functions unreachable without authorization
- [ ] CSRF protection where cookies authenticate
- [ ] Open redirect, SSRF, path traversal, unsafe deserialization assessed
- [ ] Rate limits / abuse protection on sensitive operations — **proven live**
- [ ] Randomness, password hashing, sessions and crypto use established methods

## B. Website, server and network

- [ ] HTTPS on every hostname (apex, www, subdomains)
- [ ] HTTP → HTTPS redirects
- [ ] TLS configuration (external scanner grade, protocols, chain, renewal)
- [ ] No sensitive data over insecure connections (no mixed content)
- [ ] Security headers fit the application — on normal pages **and** error pages
- [ ] CSP tested in a browser (zero violations; `'unsafe-inline'` noted)
- [ ] Clickjacking protection (header + live iframe test)
- [ ] MIME sniffing protection
- [ ] Referrer-Policy
- [ ] Permissions-Policy
- [ ] CORS limited to needed origins
- [ ] Unnecessary services, ports, endpoints, admin interfaces not exposed
- [ ] Sensitive files, backups, env files, VCS metadata, configs not public
- [ ] Production errors and logs reveal nothing sensitive
- [ ] Hosting permissions and isolation (no shared account/user across clients)
- [ ] DNS, domain, CDN/Cloudflare settings reviewed (live NS, CAA, DNSSEC, SPF/DKIM/DMARC, registrar lock)
- [ ] CDN/caching do not expose private or user-specific responses
- [ ] Redirects, custom domains, subdomains (no dangling records, www works)

## C. Forms, APIs and data handling — for every form and endpoint

- [ ] Required and optional fields validated on the server
- [ ] Malformed / unexpected input handled safely
- [ ] Spam, automation and flooding addressed (bot challenge + honeypot + live-proven limit)
- [ ] No unnecessary sensitive data collected
- [ ] Submissions transmitted securely end to end
- [ ] API does not trust frontend validation (test by bypassing the browser)
- [ ] Restricted endpoints authenticated and authorized
- [ ] Rate limiting and abuse controls appropriate
- [ ] No secrets in client-side requests
- [ ] API errors disclose nothing sensitive
- [ ] Personal data not written to public logs or analytics
- [ ] Data only reaches intended recipients (caller cannot change recipient)
- [ ] Third-party integrations use appropriate authentication and permissions
- [ ] Webhooks validate authenticity (signatures) where supported
- [ ] Retries, failures and duplicate submissions handled; owner alerted on failure
- [ ] Retention and deletion work as intended (scheduled or documented + reminded)
- [ ] Data flow documented: browser → backend → each service → final recipient

## D. Serverless functions and messaging integrations (Workers, Lambdas, bots, email relays)

- [ ] Tokens stored as secrets (not plain-text bindings, not code), in every version
- [ ] Token not exposed in frontend, repository, logs, traces or responses
- [ ] Any previously exposed token rotated (confirmed in the provider's console)
- [ ] Unexpected methods and content types rejected
- [ ] Origin checks used as a filter only, not as authentication
- [ ] Size and format of input limited
- [ ] Rate limiting / bot challenge in place and proven live
- [ ] Caller cannot set destinations or routing (chat IDs, email "to", URLs)
- [ ] Errors reveal no token, config or upstream error text
- [ ] Recipient receives only data required for the purpose
- [ ] Secrets and personal data not logged unnecessarily; log retention known and disclosed
- [ ] Failures not silently lost (visitor told + owner alerted)
- [ ] Function account and bot/app permissions restricted (2FA, members, bot group settings)
- [ ] Old versions/preview URLs cannot be invoked with weaker code
- [ ] Behaviour tested end to end with dummy data marked TEST

## E. Privacy and personal data security (technical; legal conclusions go to the legal summary)

- [ ] Every category of personal data identified (form fields, IPs, logs, cookies, device data)
- [ ] Every collection point and recipient identified
- [ ] Privacy disclosures match measured behaviour
- [ ] Data collected only for identified purposes
- [ ] Access to personal data restricted (inboxes, chats, dashboards, 2FA)
- [ ] Retention and deletion defined and realistic
- [ ] Backups, logs, messages and third-party copies considered
- [ ] No exposure via public files, URLs, browser storage, logs or API responses
- [ ] Third parties receive only necessary data
- [ ] International transfers and safeguards documented → NEEDS LEGAL REVIEW where unclear
- [ ] Cookies and trackers measured in a real browser (before and after consent)
- [ ] Privacy settings work as described
- [ ] Access and deletion request procedure exists

## F. Accessibility, configuration and deployment

- [ ] Accessibility assessed against WCAG 2.2 AA (`accessibility.md`, automated + manual)
- [ ] Alt text audit complete (every image, icon, SVG, video, text-in-media)
- [ ] Forms: labels, error messages, status announcements
- [ ] Keyboard navigation and focus tested
- [ ] Production and development separated (staging or local preview)
- [ ] Deployment permissions restricted
- [ ] CI/CD does not expose secrets
- [ ] No production secrets in source files or committed config
- [ ] Branch protection and code review where a repository exists
- [ ] Backups exist for code, data and config
- [ ] Backup restoration tested (or NOT RUN with reason)
- [ ] Dependency and secret scanning enabled where supported
- [ ] Monitoring and alerting for important failures and security events
- [ ] Rollback / recovery procedure written and possible

## G. Testing

- [ ] Build and deployment checks pass; deployed files match tested build
- [ ] Automated tests pass (and are not the only evidence for security controls)
- [ ] Form validation and error handling tested
- [ ] Access-control tests where authentication exists
- [ ] Security headers checked on the deployed site
- [ ] Dependency and secret scans run
- [ ] SAST run on all first-party code (including inline scripts and functions)
- [ ] DAST in a safe, authorized environment (or NOT RUN with reason)
- [ ] OWASP Top 10 used as reference (map each category to findings)
- [ ] OWASP WSTG used to pick deeper tests
- [ ] No real customer data used in tests
- [ ] Results checked for false positives and false negatives

## H. Accounts and access (new in v2)

- [ ] Registrar: 2FA, transfer lock, auto-renew, expiry date, contact email owned by client
- [ ] DNS provider: 2FA, members, live zone = managed zone
- [ ] Hosting: 2FA, members, FTP/SFTP/SSH users, one client per account/user
- [ ] CDN / Cloudflare: 2FA on every member, roles least privilege, API tokens scoped
- [ ] Email / privacy-contact mailbox: 2FA, forwarding rules reviewed
- [ ] Git hosting / CI: 2FA, branch protection, secrets in CI vault
- [ ] CMS admins: 2FA, no shared logins, unused admins removed
- [ ] Messaging / form recipients (Telegram, WhatsApp, Slack, email): account 2FA, chat/group members, bot settings
- [ ] Payment / analytics / ads accounts: 2FA, members
- [ ] Tokens given to agencies or AI tools revoked or narrowed after work
- [ ] Account ownership recorded (client vs agency) for handover

## Required final output

1. Overall security readiness: NOT READY · READY WITH ACCEPTED RISKS · READY FOR FINAL REVIEW
2. Critical and High findings
3. Medium and Low findings
4. Checks that could not be completed
5. Access/configuration the client must verify manually (with exact steps)
6. Fixes in priority order
7. Tests to repeat after fixes
8. Separate privacy and legal summary
9. Clear statement whether the site is suitable for production on the evidence available
10. "No audit can guarantee the absence of all vulnerabilities." Never "fully secure".
