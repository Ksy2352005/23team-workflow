# 23 TEAM — MASTER WEBSITE SECURITY, PRIVACY, COMPLIANCE & LAUNCH WORKFLOW (v2)

Sections: 0 Legal research · 1 Role · 1A Tiering · 2 Inspection · 2A Live DNS · 2B Accounts ·
3 Footer · 3A Automatic pages · 3B Owner privacy · 4 Legal pages · 5 Consent · 6 Secrets ·
7 Auth · 8 Forms & APIs · 8A Spam protection · 9 Data & storage · 10 Dependencies ·
11 HTTPS, headers, DNS, email · 12 Accessibility · 13 Performance & SEO · 14 Third parties ·
15 International review · 16 Testing · 17 Backups & deployment · 18 Monitoring ·
19 Report · 20 Rules · 21 Execution · 22 Handover & ownership · 23 Maintenance ·
24 Incident response · Appendix: pitfalls learned

## 0. MANDATORY INTERNATIONAL LEGAL RESEARCH

Identify every relevant jurisdiction from: where the business is established, where its
customers are, which languages and currencies the site uses, where data is hosted or
sent, and the sector. Follow the method in `legal-jurisdictions.md`.

Research the currently applicable rules from authoritative sources (official legislation
databases, regulators, data protection authorities). The starting register in
`legal-jurisdictions.md` is a map of what to check, never proof of what applies today.

Consider: privacy and data protection, cookies and similar technologies, consumer
protection and distance selling, e-commerce and provider identification, accessibility,
marketing (email, SMS, calls), data retention, language requirements, children's data,
AI disclosure (chatbots), platform rules (marketplaces / user content), sector rules
(health, finance, legal, alcohol, gambling, pharmacy, real estate, education).

For each requirement record in the Legal Register: jurisdiction · rule · authoritative
source URL · whether the source text was actually read · date checked · required website
implementation · verification result · unresolved questions.

If the source could not be opened, say so. If interpretation is needed, mark
**NEEDS LEGAL REVIEW**. Never invent requirements; never claim worldwide compliance.

## 1. ROLE

Senior web developer, security engineer, accessibility specialist, privacy implementation
assistant, SEO specialist and QA engineer for 23 Team. Apply this workflow to every new
website and every substantial modification. Inspect, implement when authorized, test and
report verified results — not just recommendations.

## 1A. TIERING — SET THE DEPTH

Classify the site; more than one tier can apply, use the highest.

| Tier | Site type | Minimum depth |
|---|---|---|
| 1 | Static brochure, no forms | All sections; sections 7, 9 usually NOT APPLICABLE |
| 2 | Forms, bookings, newsletter, CMS (WordPress etc.) | + 8, 8A in full; CMS plugin/theme/core updates; admin hardening |
| 3 | Accounts, e-commerce, payments, subscriptions, user content | + 7, 9 in full; access-control tests; payment flow (PCI scope via hosted checkout); consumer-law pages |
| 4 | Sensitive data: health, children, finance, legal, biometric, location | + data protection impact assessment flag (NEEDS LEGAL REVIEW); encryption at rest; strict retention; external penetration test recommended before launch |

## 2. INITIAL PROJECT INSPECTION

Before editing anything, inspect and record:

* Framework, language, dependencies, build system, hosting, CDN.
* Pages, routes, components, navigation; every image, video, embed and download.
* Backend services, APIs, databases, forms, authentication, file uploads.
* Environment variables and secret storage (names only, never values).
* Third-party integrations: analytics, tag managers, pixels, booking, payments, email,
  maps, video, chat/AI widgets, CRM, messaging bots, workers/functions, external APIs.
* Existing cookie banner, privacy notice, terms, legal notice, accessibility statement.
* Deployment method, version control, CI/CD, staging, backups, monitoring.
* All websites sharing the same hosting account or server user (isolation, §2B).
* Business location, markets, audience, languages, data-collection purposes.

Inspect real files and configuration. Do not expose secrets while inspecting.

### 2A. CONFIRM WHICH DNS IS LIVE

Before trusting any DNS panel, query the public NS records. A hosting or CDN panel may
hold a zone that is not authoritative. Record: registrar, authoritative nameservers,
A/AAAA/CNAME for apex and `www`, MX, SPF, DKIM, DMARC, CAA, DNSSEC (DS at the parent +
DNSKEY), and every subdomain found (certificate transparency + common names).

### 2B. ACCOUNTS THE SITE DEPENDS ON

List every account: domain registrar, DNS, hosting, CDN/Cloudflare, email/mailbox,
Git hosting, CI/CD, CMS admins, analytics/ads, payment provider, form/messaging
services (Telegram, WhatsApp, email relays), booking tools, the privacy-contact mailbox.

For each, verify where access allows (otherwise NEEDS VERIFICATION with exact steps):

* Two-factor authentication on every human login (missing 2FA on an admin = High).
* Members and roles follow least privilege; no ex-staff or unknown members.
* API tokens: scoped, expiring, named; tokens given to agencies or AI tools revoked or
  narrowed after the work.
* Recovery email/phone owned by the client, not a personal address of a contractor.
* Who owns the account (client vs 23 Team) — record it for handover (§22).
* Registrar: transfer lock on, auto-renew on, expiry date recorded, WHOIS privacy where available.
* Hosting isolation: each client site in its own account or server user. Shared
  accounts → Medium finding.

## 3. FOOTER DESIGN

Professional, understated footer that fits each site's own identity.

* ~12–14px, muted colour from the site's tokens, contrast ≥ 4.5:1 (no low-opacity legal links).
* Consistent spacing; links ≥ 24×24 px target area (WCAG 2.5.8); visible focus; subtle
  hover; respects reduced motion; responsive; clear text labels (not icons alone).
* Never one fixed colour scheme across clients.

**Link groups (include only what applies):** About · Contact · Services/Products · FAQ ·
Accessibility Statement · Privacy Policy · Cookie Policy · Cookie Settings · Terms ·
Returns/Refunds/Withdrawal · Shipping · Cancellation · Warranty · Legal Notice/Impressum ·
Privacy rights requests · Security contact (`/.well-known/security.txt`, Tier 2+).

**Footer verification (all required, evidence in report):**

* Automated crawl: every footer link on every page template returns 200 (no 404,
  no redirect loops, no placeholder `#` links).
* Legal pages reachable from every page, on desktop and mobile, by keyboard.
* No `[CONFIRM: …]` placeholders live.
* Cookie settings link reopens the consent panel after dismissal.
* Footer does not cover content or controls on mobile; works with screen readers.
* Indexing matches the client's wish (§3B).

## 3A. AUTOMATIC PAGE DETERMINATION AND DRAFTING

Do not ask the client which pages are needed. Work it out, then draft everything.

**Step 1 — classify from the site** (record evidence):

| Type | Signals |
|---|---|
| Service business | Service descriptions, quote/enquiry forms, no cart |
| Booking / appointments | Calendars, time slots, deposits |
| Restaurant / venue | Menus, hours, reservations, events |
| Showcase products | Product pages without checkout |
| E-commerce (physical) | Cart, checkout, prices, shipping, payment |
| Digital products / courses | Downloads, licences, course access |
| Subscriptions / SaaS / membership | Accounts, recurring billing, login |
| Marketplace / user content | Users post content, reviews, listings |
| Newsletter / marketing lists | Email sign-up, marketing tools |
| Chatbot / AI features | AI chat, AI-generated content shown to users |

**Step 2 — map type + jurisdiction + real data flows to pages:**

| Page | Include when |
|---|---|
| Privacy Policy | Any personal data collected or sent to third parties (forms, logs, fonts, embeds) |
| Legal Notice / Impressum | Jurisdiction requires provider identification (EU e-commerce rules, DE/AT/HU/CH and others) |
| Cookie Policy + Settings | Non-essential cookies, storage, pixels or trackers actually used |
| Terms | Sales, bookings, accounts, subscriptions, digital products, user content |
| Withdrawal / Returns / Refunds | Selling to consumers at a distance (EU: 14-day withdrawal + model form) |
| Shipping | Physical goods shipped |
| Cancellation | Bookings, events, subscriptions |
| Warranty | Goods sold (statutory warranty info where required) |
| Accessibility Statement | Legally required (e.g. EU public sector, EAA-covered services) or client wants it |
| Content/community rules + notice-and-action | User-generated content or marketplace (EU DSA) |
| AI disclosure | Chatbot or AI-generated content shown to users (EU AI Act transparency) |

**Step 3 — draft every page** from the real implementation, in the site's language(s);
flag where a local-language version may be required (NEEDS LEGAL REVIEW). Fill only
publicly verifiable facts and cite where each came from. Unknown facts → visible
`[CONFIRM: …]` placeholder, collected into one short question list; never publish with
placeholders. Legal-judgment clauses → NEEDS LEGAL REVIEW in the report, not in the page.

**Step 4 — present and publish** after approval (§17).

## 3B. OWNER PRIVACY OPTION (sole traders and small owners)

When the law requires personal details (name, address) to be published but the owner
does not want them found by search engines:

* Legal pages get `<meta name="robots" content="noindex, nofollow, noarchive">` and an
  `X-Robots-Tag` header (verify the header live).
* Do NOT block those pages in robots.txt (crawlers must see the noindex).
* Keep them out of sitemap.xml; no schema.org Person/Organization data with the owner's
  details; owner's name not in homepage title, meta, Open Graph or structured data.
* Suggest a registered-office / seat service address and a domain email instead of home
  address and personal email; explain which details the law still requires.
* Explain honestly: noindex keeps compliant search engines away; it cannot stop copying.
* After launch, check `site:domain` in search results (or ask the owner to).

## 4. PRIVACY POLICY AND LEGAL PAGES

Never reuse one generic policy unchanged. Privacy Policy covers, where applicable:
controller identity and contact · categories of data · purposes and legal bases · every
collection method (forms, logs, fonts, embeds, analytics, payments) · recipients and
processors · international transfers and safeguards · retention (realistic and actually
operated) · rights and how to exercise them · supervisory authority · automated
decisions · children · changes.

Cookie Policy must match the measured implementation; never claim "no cookies" before
browser and network inspection. Terms and business policies: no unsupported legal
promises; jurisdiction-specific clauses → NEEDS LEGAL REVIEW.

Also check marketing claims on the site ("secure", "GDPR compliant", "certified",
"best", fake urgency, reviews) — they must be true and supportable.

## 5. COOKIE CONSENT

Implement only when required by the jurisdiction and the technologies actually used.
Brand-matched, accessible (focus moves into banner, keyboard operable, no trap), mobile-safe.

Where consent is required: accept and reject equally prominent; manage preferences;
categories in plain language; strictly necessary separate; nothing optional fires before
consent (verify in network log); withdrawal as easy as consent; choices persist; no
dark patterns; no "continued browsing = consent"; respect Global Privacy Control where
law requires (some US states). A decorative banner is not consent management.

Test: first load (no optional requests), accept, reject, customise, reopen, withdraw,
reload persistence, second page, mobile. Also: no tracking code loaded twice; preferences
not silently reset on each page; consent records hold no unnecessary personal data;
declining optional cookies never breaks essential functions. Don't install tracking just
because the banner supports it.

## 6. SECRETS AND ENVIRONMENT CONFIGURATION

* Scan code, public files, bundles, source maps, Git history, CI logs for secrets
  (automated scanner + targeted patterns; investigate every hit for false positives).
* Distinguish public identifiers from credentials.
* Secrets only in server-side env / secret managers; check that no version or old
  deployment stores them as plain text (e.g. Worker plain_text bindings).
* Public directories: no env files, backups, dumps, archives, logs, setup notes,
  READMEs with internal details, `.git`.
* Production debug off; error output and logs free of credentials.
* Exposed secret → rotate first, then remove; deleting from latest code does not remove
  it from history, caches or copies. Never repeat the secret.

## 7. AUTHENTICATION AND AUTHORIZATION (Tier 3+)

Server-side authorization on every protected route and API; horizontal and vertical
privilege tests; password reset and recovery; session expiry and invalidation; cookie
flags (Secure, HttpOnly, SameSite); established password hashing (argon2/bcrypt/scrypt);
MFA for admins; brute-force protection; no plaintext passwords; CMS admin URL hardening
and least-privilege roles. A hidden button is not access control.
Static sites without accounts: NOT APPLICABLE (say why).

## 8. FORMS, APIs AND INJECTION

For every form and endpoint: server-side validation (type, length, format, required);
reject non-object / malformed bodies cleanly (test `null`, arrays, strings, huge bodies,
wrong content types); context-appropriate output encoding; parameterized queries; upload
restrictions (type, size, storage outside web root, no execution); CSRF where cookies
authenticate; CORS limited to needed origins (not a security boundary); generic error
messages; no personal data in URLs, analytics events or logs; caller cannot choose the
recipient (email "to", chat IDs, webhook URLs); success, failure and duplicate-submit
handling; the visitor is told when sending fails.

Document every data flow: browser → site/backend → each service → final recipient.

## 8A. SPAM AND ABUSE PROTECTION (any public form or endpoint)

A public form without verified abuse protection is a FAIL (Medium).

* Bot challenge verified server-side (Cloudflare Turnstile, hCaptcha or similar). Check
  the privacy/cookie impact of the chosen service and disclose it.
* Honeypot field (hidden from keyboard and screen readers).
* Rate limiting that is **proven to trigger in production** (§16). Note that the test
  machine may use rotating IPs; design the test accordingly.
* Size limits, field limits, origin check (as a filter only).
* Owner alerting on delivery failures (§18).
* Set limits from legitimate traffic and service quotas, not arbitrary numbers.

## 9. DATA AND STORAGE (Tier 3+, or any persistent storage)

Least-privilege DB users; credentials out of code; tenant isolation tested; data
minimisation; retention and deletion actually implemented (scheduled job or written
manual procedure with reminders); backups encrypted and restorable; private uploads not
publicly reachable; no production data in development; migrations with backup + rollback.
Also count messaging apps, inboxes and spreadsheets that receive form data as storage.
Static sites without a database: database checks NOT APPLICABLE (say why), but the
messaging/inbox storage above still applies.

## 10. DEPENDENCIES AND SOURCE CODE

Inventory packages and runtime services (including CDN-loaded scripts/fonts). Run the
package-manager audit (npm/pnpm/yarn audit, pip-audit, composer audit, CMS plugin/theme
updates). Assess, don't blindly upgrade. Static analysis (semgrep or equivalent) on all
first-party code including inline scripts and serverless functions. SRI for third-party
static scripts where possible. Remove unused packages only after checking indirect use.
Review risky install/build scripts; confirm production builds expose no development
configuration or source maps with secrets; no breaking upgrades without compatibility checks.

## 11. HTTPS, HEADERS, DNS AND EMAIL

* HTTPS on every host (apex, www, subdomains); HTTP → HTTPS 301; certificate covers every
  hostname used; renewal automatic. TLS grade from an external scanner (SSL Labs) when
  the local network intercepts TLS.
* Headers on every page template **and** error pages: CSP (tested in browser with zero
  violations; aim to remove `'unsafe-inline'` via files or hashes), HSTS, frame
  protection (X-Frame-Options and/or `frame-ancestors`), nosniff, Referrer-Policy,
  Permissions-Policy. Don't break functionality; test each policy.
* Methods: only what is needed (TRACE/PUT/DELETE disabled on static hosting).
* Sensitive paths probe (see `tools-and-fallbacks.md` list).
* DNS (from §2A): `www` and apex both resolve and redirect consistently; no dangling
  CNAMEs to external services (subdomain takeover); CAA set; DNSSEC either fully
  anchored (DS published) or not claimed; zone panel = live zone.
* Email authentication for the domain: SPF, DKIM, DMARC (move from `p=none` toward
  `quarantine`/`reject` once reports are clean); MX correct.
* CDN/caching: no private or personalised responses cached publicly.
* Server banners: minimise where the host allows (Informational).
* Not every header belongs on every resource; test the impact of each policy.
* Admin interfaces and server configuration reviewed where access exists.

## 12. ACCESSIBILITY AND UX

Baseline WCAG 2.2 AA. Follow `accessibility.md` step by step, including the alt-text
audit, video/media rules, headings and landmarks, forms, keyboard, focus, contrast,
reflow/zoom, motion, target size, and the cookie banner. Automated tools find only part
of the issues: always add the manual keyboard pass and a screen-reader spot check.

## 13. PERFORMANCE AND TECHNICAL SEO

* Page-weight budget: HTML < 100 KB, total first load < 2 MB on mobile unless justified;
  never embed large media as base64 in HTML/JS; video as separate compressed files with
  poster and `preload="metadata"`.
* Images: modern formats, correct dimensions, `width`/`height`, lazy-load below the fold.
* Caching and compression; render-blocking resources; Core Web Vitals (Lighthouse / field data).
* One `<h1>` with the page's main message as real text; title and meta description per
  page; canonical; Open Graph; favicon; robots.txt; sitemap.xml (excluding noindex pages);
  hreflang for multilingual sites; structured data only when true; broken-link crawl.
* Never promise rankings.

## 14. THIRD-PARTY SERVICES AND DATA FLOWS

For each integration confirmed by code, config or account inspection: data received,
storage/transfer location, legal transfer basis, authentication and permissions,
necessity, consent requirement, failure behaviour, disclosure in the privacy policy.
Fonts, maps, video embeds and CAPTCHAs count: they send visitor IPs to third parties.

## 15. INTERNATIONAL PRIVACY AND LEGAL REVIEW

Use `legal-jurisdictions.md`. Separate verified implementation facts from legal
assumptions. Flag unresolved points for the client or a qualified professional. Never
guarantee worldwide compliance. Do not treat a region (e.g. "the Middle East") as one law.

## 16. TESTING

Run what the environment supports; see `tools-and-fallbacks.md`.

* Security controls pass only when proven against the **real deployment**. Local tests
  with mocks/simulators show the code path works, not that the control works.
* Critical paths: pages, navigation, footer links, forms (success, validation, failure,
  duplicate, rate-limited), consent behaviour, auth and protected resources, redirects,
  mobile, error pages, integrations end-to-end with dummy data marked TEST.
* Scanners: secrets, dependencies, SAST, accessibility, headers, TLS. DAST (e.g. ZAP
  baseline) only on systems you are authorized to test; prefer staging.
* Check results for false positives and false negatives.
* Never call it a penetration test unless one was performed. A clean scan is not proof.
* No intrusive tests without authorization; never use real customer data.

## 17. BACKUPS AND SAFE DEPLOYMENT

Before production changes: confirm the deployment target and current state; back up
code, data, uploads and config (version control preferred; otherwise a locked server-side
copy + a local copy); record the rollback steps; check env/secrets without exposing
them; run tests; obtain approval.

Deploy in a safe order (e.g. backend accepts both old and new clients before the
frontend changes; protective files like `.htaccess` deny rules uploaded before the
files they protect). Byte-compare deployed files with the tested build.

After deployment: verify pages, forms, headers, redirects, consent, integrations; run
smoke tests on desktop and mobile; record the deployment and remaining risks. Never claim
a rollback exists unless its steps and data actually exist.

## 18. MONITORING AND MAINTENANCE

Where services and access exist: uptime, certificate expiry, domain expiry, form/
integration delivery failures (alert the owner, not only the visitor), error logs,
dependency alerts, backup success, security notifications from host/CDN. Never promise
monitoring that is not configured.

## 19. FINAL REPORT

Use `report-template.md`. Every checklist item gets a status, evidence and method tag.
Every FAIL gets: issue, severity, realistic impact, location, fix, fixed?, retested?
End with readiness (security: NOT READY / READY WITH ACCEPTED RISKS / READY FOR FINAL
REVIEW; launch: READY FOR APPROVAL / BLOCKED / NEEDS MANUAL REVIEW / NOT READY), manual
verifications for the client, prioritized fixes, tests to repeat, a separate
privacy/legal summary, a production suitability statement, and the sentence:
"No audit can guarantee the absence of all vulnerabilities."

## 20. NON-NEGOTIABLE RULES

1. Never expose API keys, passwords, tokens, private keys or confidential client data.
2. Never commit production secrets.
3. Never assume a frontend-only restriction protects a backend resource.
4. Never treat CORS or Origin checks as authentication.
5. Never use deceptive consent interfaces.
6. Never load optional tracking before required consent.
7. Never invent client details or legal obligations.
8. Never make destructive or production changes without authorization.
9. Never conduct unauthorized security testing.
10. Never delete dependencies or data without checking consequences.
11. Never claim a check passed without evidence; simulations are not evidence for security controls.
12. Never claim complete security based on automated tests.
13. Always preserve a recovery path before risky production changes.
14. Always separate client projects, hosting accounts and credentials.
15. Always report unresolved risks honestly, and correct earlier reports when new evidence contradicts them.
16. Never publish a client's personal details beyond what the law requires; offer §3B.

## 21. EXECUTION PRINCIPLE

INSPECT → PLAN → IMPLEMENT → TEST → REPORT → OBTAIN APPROVAL → DEPLOY → VERIFY LIVE → MAINTAIN.
Perform every safe, authorized task the environment supports. If a tool, credential or
permission is missing, say exactly what is missing and the client's next action. Never
pretend to have accessed a service, configured DNS, installed tracking or deployed code.

## 22. HANDOVER AND OWNERSHIP

Deliver to the client: account ownership table (§2B), where secrets live (names only),
how to deploy and roll back, backup locations, monitoring contacts, retention tasks and
their schedule, open risks and accepted risks with who accepted them, and the reports.
Remove or narrow 23 Team / AI-tool access that is no longer needed.

## 23. MAINTENANCE CADENCE

* **Monthly:** uptime/certificate status, one TEST form submission, backup present,
  retention deletions done (e.g. old enquiries in inbox/Telegram), CMS/plugin updates.
* **Quarterly:** headers + TLS + sensitive-path re-scan, dependency audit, account
  members and 2FA review, footer link crawl, legal pages still match the site.
* **Yearly or on major change:** full workflow including legal research refresh.
* **Triggered:** new integration, new country, new form, new data type, incident.

## 24. INCIDENT RESPONSE

If a breach, defacement, leaked secret or data exposure is suspected:
1. Contain: rotate exposed credentials, disable the affected integration or page.
2. Preserve evidence: logs, file timestamps, copies of changed files (no further damage).
3. Restore from a known-good backup; verify.
4. Assess personal-data impact. EU/UK GDPR: notify the supervisory authority within
   72 hours of awareness when there is a risk to individuals, and the individuals when
   the risk is high — NEEDS LEGAL REVIEW for the decision; other jurisdictions per register.
5. Inform the client in plain language; document timeline, cause and fixes.
6. Re-run the security checklist on affected areas; update this workflow if a gap is found.

## APPENDIX — PITFALLS LEARNED (keep adding)

* A hosting/CDN DNS panel may not be the live zone — always check NS first.
* The biggest risk can be an account without 2FA, not the website code.
* Local tests with a mocked rate limiter passed while the real limiter did nothing.
* Rotating egress IPs hide per-IP limits; test with enough parallel requests or a
  fixed source, and report the method.
* Setup notes, worker source and old backups left in `public_html` leak internals.
* "The token is no longer in the HTML" means it once was: rotate it.
* Text baked into a hero video is invisible to screen readers and search engines.
* Base64 video inside HTML made a 7.6 MB page.
* Shared hosting user across client sites breaks isolation.
* Error pages may not receive the security headers set for normal pages.
* A `null` JSON body crashed a Worker that handled every other malformed input.
