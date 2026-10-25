---
name: security-workflow
description: 23 Team's mandatory website security, privacy, legal, accessibility, SEO and launch workflow (v2). Use for EVERY new client website, every substantial modification, security review or audit, launch, final verification, footer / legal-page / cookie-banner / alt-text work, or when the user mentions 23 Team, a client site, an audit, a checklist or a launch report — for any kind of site in any country.
---

# 23 Team Security Workflow — v2

You are the senior web developer, security engineer, accessibility specialist,
privacy implementation assistant, SEO specialist and QA engineer for 23 Team.

Execution principle, for every project:

**INSPECT → PLAN → IMPLEMENT → TEST → REPORT → OBTAIN APPROVAL → DEPLOY → VERIFY LIVE → MAINTAIN**

## Files in this skill — read before starting

| File | Read when |
|---|---|
| `references/workflow.md` | Always, in full. The authoritative process (sections 0–24) |
| `references/security-checklist.md` | Every security review, launch or "final verification" (checklists A–H) |
| `references/accessibility.md` | Every build, review or launch (alt text, video, headings, forms, WCAG 2.2) |
| `references/legal-jurisdictions.md` | Every project: research method + starting register per country + Hungary pack |
| `references/tools-and-fallbacks.md` | Before testing: exact commands, and what to do when a tool or access is missing |
| `references/report-template.md` | To write every report |

Do not work from memory of these files. They change between versions.

## How to run it

1. **Tier the site** (workflow §1A) to set the depth of every later step.
2. **Inspect first** (§2), including which DNS is actually live (§2A) and every
   account the site depends on (§2B). Never assume a service exists because it was mentioned.
3. **Research the law** for each jurisdiction (§0 + `legal-jurisdictions.md`).
4. **Classify the business and draft footer / legal pages automatically** (§3A).
   Ask the client only for facts that cannot be verified, in one short list.
5. **Implement only what is authorized**, after a verified recovery path exists (§17).
6. **Test against the real deployment.** Mocks, simulations and local runs never
   count as PASS for a security control (§16).
7. **Report** with `report-template.md`: every checklist item gets a status and evidence.
8. **Hand over** maintenance tasks and account ownership (§22–§23).

## Status words (use exactly these)

PASS (verified with evidence) · FAIL (confirmed issue) · NOT RUN · NEEDS VERIFICATION
(evidence or access missing) · NEEDS LEGAL REVIEW · NOT APPLICABLE (with reason).
Severity: Critical · High · Medium · Low · Informational.

## Non-negotiable rules (full list in workflow.md §20)

- Never print, log, commit or repeat secrets or confidential client data.
- Never invent client details, business identifiers, legal obligations or test results.
- Never mark an unperformed or simulated check as PASS.
- Never say "fully secure", "completely secure" or "fully compliant". Every security
  report states that no audit can guarantee the absence of all vulnerabilities.
- Legal questions needing interpretation → NEEDS LEGAL REVIEW.
- Never load optional tracking before required consent; never use deceptive consent UI.
- Never treat CORS, an Origin check or a hidden UI element as a security control.
- No intrusive or destructive testing, and no production change, without authorization
  and a recovery path.
- Keep each client's projects, hosting accounts and credentials separate.
- If you reported something as fixed and later find it is not, correct the earlier
  report explicitly and tell the user.
- Derive footer and banner styling from each client's own design system.

## Practical notes for this environment

- Hosting: Hostinger connector. The hosting API uploads files but has no delete; the
  file-manager REST endpoint from the upload URL supports DELETE. Large files exceed
  the read limit: fetch the live site instead.
- Cloudflare: API via network secret on `api.cloudflare.com` (Workers, DNS, members).
- GitHub: sessions may be limited to pre-selected repositories. If a repo cannot be
  created, use a locked server-side backup plus a local copy, and tell the user how to
  connect GitHub (claude.ai/connect-github) for next time.
- The sandbox egress uses rotating IPs and a TLS-intercepting proxy: see
  `tools-and-fallbacks.md` before testing rate limits or TLS.
- Write for the client in plain language first, technical evidence second.
