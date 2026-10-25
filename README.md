# 23 Team Workflow (v2)

Claude Code skill for 23 Team's website security, privacy, legal, accessibility, SEO and launch workflow.

- `skills/23team-workflow/SKILL.md` — entry point
- `skills/23team-workflow/references/workflow.md` — full process (sections 0–24)
- `skills/23team-workflow/references/security-checklist.md` — verification checklists A–H
- `skills/23team-workflow/references/accessibility.md` — WCAG 2.2 checklist incl. alt-text audit
- `skills/23team-workflow/references/legal-jurisdictions.md` — research method, country register, Hungary pack
- `skills/23team-workflow/references/tools-and-fallbacks.md` — commands and fallbacks
- `skills/23team-workflow/references/report-template.md` — review/launch report template

## Install (Claude Code setup script)

```
rm -rf /tmp/23tw && git clone --depth 1 -q https://github.com/Ksy2352005/23team-workflow /tmp/23tw && mkdir -p ~/.claude/skills && cp -r /tmp/23tw/skills/23team-workflow ~/.claude/skills/
```

## Install (claude.ai)

Zip the `skills/23team-workflow` folder (the folder itself at the zip root) and upload it in
claude.ai → Customize → Skills → + → Create skill → Upload a skill.

## Changes in v2

- Site tiering by risk; live-DNS and account-security inspection (2FA, members, tokens, ownership)
- Security controls pass only when proven against the real deployment
- Mandatory, live-verified spam protection for public forms
- Owner-privacy option for legal pages (noindex, no structured data)
- Detailed accessibility checklist: alt text, media, headings, forms, WCAG 2.2 criteria
- Footer link crawl and legal-page verification
- Multi-country legal research register (to be verified at time of use)
- Handover, maintenance cadence and incident response
- Tools, commands and fallbacks; pitfalls learned from real audits
