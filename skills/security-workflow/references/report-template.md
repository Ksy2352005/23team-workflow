# 23 Team — Website Review Report (v2 template)

Write plain language first, technical evidence second. Never "fully secure". Include the
sentence: "No audit can guarantee the absence of all vulnerabilities."

## 1. Verdict and summary

- Security readiness: NOT READY | READY WITH ACCEPTED RISKS | READY FOR FINAL REVIEW — because …
- Launch decision: READY FOR APPROVAL | BLOCKED BY CRITICAL OR HIGH-RISK ISSUES | NEEDS MANUAL REVIEW | NOT READY FOR PRODUCTION — because …
- What was checked (one line)
- Critical / High findings
- Medium / Low / Informational findings (IDs + one line each)
- What was fixed during this work (deployed and retested vs. drafted only)
- Corrections to earlier reports (if any)

## 2. Project, scope, methods, limits

| Field | Value |
|---|---|
| Client / project | |
| URL(s) and hostnames | |
| Tier (workflow §1A) | |
| Stack | |
| Hosting / CDN / DNS (live NS) | |
| Accounts in scope (§2B) | |
| Review date | |
| Scope | |
| Access used | |
| Not possible / limitations | |

Method tags: [Code] [Auto] [Live] [Config] [External] [Owner]. Tools and versions used.

## 3. Failed checks in detail

| ID | Issue | Severity | Realistic impact | Where | Recommended fix | Fixed? | Retested? |
|---|---|---|---|---|---|---|---|

## 4. Checklists A–H (from `security-checklist.md`)

One table per checklist: Check · Status · Evidence and method.
Statuses: PASS · FAIL · NOT RUN · NEEDS VERIFICATION · NEEDS LEGAL REVIEW · NOT APPLICABLE (with reason).

## 5. Accessibility results

Pages scanned · axe results per page · keyboard pass · screen-reader spot check · alt-text
audit (count of images, issues) · media (captions, pause) · open WCAG failures with criterion numbers.

## 6. Footer and legal pages

| Page | Needed? (reason) | URL | HTTP status | Linked from every page? | Indexing (index/noindex) | Placeholders left? |
|---|---|---|---|---|---|---|

Business classification and evidence.

## 7. Third-party data flows

Data-flow chain per integration: browser → backend → service → final recipient.

| Service | Confirmed by | Data received | Stores / transfers personal data (where) | Consent needed? | In privacy policy? |
|---|---|---|---|---|---|

## 8. Legal register

| Jurisdiction | Rule | Authoritative source (URL) | Source read? | Date checked | Required implementation | Result | Open questions |
|---|---|---|---|---|---|---|---|

## 9. Client actions

- Manual verifications (checkbox list with exact steps)
- Information needed (one short list)
- Fixes in priority order (who does each)
- Tests to repeat after fixes

## 10. Privacy and legal summary (separate from security)

Bullets: each NEEDS LEGAL REVIEW item, transfers, missing disclosures, claims on the site,
cookie status, retention operation.

## 11. Production suitability statement

On the evidence available, the website is / is not suitable for production because …
This review used [methods]. It was / was not a penetration test.
No audit can guarantee the absence of all vulnerabilities.

## 12. Handover (launches)

Account ownership table · secrets locations (names only) · deploy/rollback steps · backups ·
monitoring · maintenance schedule (workflow §23) · accepted risks and who accepted them.
