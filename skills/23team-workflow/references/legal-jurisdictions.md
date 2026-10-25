# 23 Team — Legal Research Method and Jurisdiction Register

**This file is a map, not legal advice and not proof.** Laws change. Every entry must be
re-checked against the official source at the time of use, with the date recorded in the
Legal Register. Entries marked *(verify)* are known to be recent or uncertain. Anything
needing interpretation → NEEDS LEGAL REVIEW.

## 1. Research method (every project)

1. **Find the jurisdictions:** business establishment; target markets (language, currency,
   shipping countries, `.tld`, ads targeting); where data is hosted and sent (each
   processor); sector.
2. **For each jurisdiction, check these topics:** privacy/data protection · cookies &
   similar tech · provider identification (impressum) · consumer & distance-selling ·
   e-commerce pricing & reviews · accessibility · marketing (email/SMS/calls) · language ·
   children · AI disclosure · platform/user content · sector rules · data breach notification.
3. **Open the official source** (legislation database, regulator, DPA). Search snippets,
   blogs and memory are leads, not sources. Record whether the text was actually read.
4. **Translate to website requirements** (a page, a clause, a banner behaviour, a field).
5. **Verify the implementation** and record the result.
6. **Unresolved or interpretive → NEEDS LEGAL REVIEW.** Never claim compliance.

Applicability thresholds matter (company size, revenue, number of people's data, B2B vs
B2C). Record the facts used to decide applicability, or ask the client.

## 2. European Union (applies across member states + national laws)

| Topic | Starting point | Website implications |
|---|---|---|
| Data protection | GDPR, Regulation (EU) 2016/679 | Art. 13 notice at collection; legal bases; processor contracts (Art. 28); records (Art. 30); breach notice to authority within 72 h (Art. 33); EU representative for non-EU businesses targeting the EU (Art. 27); transfers (Chapter V) |
| Cookies / device access | ePrivacy Directive 2002/58/EC Art. 5(3) + national implementation | Prior consent for non-essential storage/access |
| Provider identification | E-Commerce Directive 2000/31/EC Art. 5 + national law | Name, address, email, register + number, VAT number, regulator, profession rules |
| Distance selling | Consumer Rights Directive 2011/83/EU | Pre-contract info; 14-day withdrawal + model form; "order with obligation to pay" button |
| Prices, reviews, rankings | Omnibus Directive (EU) 2019/2161 | Prior lowest price (30 days) for announced reductions; how reviews are verified; ranking criteria |
| Geo-blocking | Regulation (EU) 2018/302 | No unjustified discrimination by nationality/residence |
| Online dispute resolution | ODR Regulation 524/2013 — repealed; ODR platform closed in 2025 *(verify)* | Remove old ODR links if the repeal is confirmed |
| Accessibility (private sector) | European Accessibility Act, Directive (EU) 2019/882, applying from 28 June 2025, via national laws | E-commerce services to consumers etc.; microenterprises providing services exempt; accessibility info/statement |
| Accessibility (public sector) | Web Accessibility Directive (EU) 2016/2102 | WCAG-based (EN 301 549), statement + feedback mechanism |
| Platforms / user content | Digital Services Act, Regulation (EU) 2022/2065 | Notice-and-action, terms transparency, contact points (scaled by size) |
| AI | AI Act, Regulation (EU) 2024/1689, Art. 50 transparency obligations *(verify dates)* | Tell users they are interacting with an AI chatbot; label AI-generated content where required |
| Adequacy (transfers) | European Commission adequacy decisions list | Check destination country each time |

## 3. Hungary pack (verified items from 23team.hu, 25 Oct 2026)

| Rule | Source | Status at last check |
|---|---|---|
| Ekertv. — Act CVIII of 2001 §4: publish name, seat (or home address if no seat), contact email, register + number, licence info, tax number if VAT subject, profession rules | net.jogtar.hu/jogszabaly?docid=a0100108.tv | Text read 2026-10-25 |
| Infotv. — Act CXII of 2011; supervisory authority NAIH, 1055 Budapest, Falk Miksa u. 9–11 | naih.hu | Site read 2026-10-25 |
| Cookies — Eht. Act C of 2003 §155(4) | njt.hu (did not load) | Not read — verify |
| Direct marketing consent — Grt. Act XLVIII of 2008 §6 | njt.hu | Not read — verify |
| Distance contracts — Govt. Decree 45/2014 (14-day withdrawal, model form) | njt.hu | Not read — verify |
| Hungarian language in commercial communication — Act XCVI of 2001 | njt.hu | Not read — NEEDS LEGAL REVIEW for websites |
| EAA national implementation | find the Hungarian implementing act | Not identified — verify |

Practical: sole traders (egyéni vállalkozó) publish their own name; offer the owner-privacy
option (workflow §3B). Tax/registration number omissions → NEEDS LEGAL REVIEW.

## 4. Other European countries (national add-ons to EU law)

| Country | Starting points |
|---|---|
| Germany | DDG §5 Impressum (replaced TMG §5 in 2024) · TDDDG §25 cookies (formerly TTDSG) · UWG · BFSG (EAA implementation) |
| Austria | ECG §5 · MedienG §25 disclosure (Offenlegung) · UGB company details |
| France | LCEN mentions légales · CNIL cookie guidance · RGAA (public sector accessibility) |
| Italy, Spain, Netherlands, etc. | National e-commerce provider-info law · DPA cookie guidance · consumer code |
| Switzerland (not EU) | revFADP / nDSG (in force 1 Sept 2023) · UWG Art. 3(1)(s) provider identification for e-commerce |
| United Kingdom (not EU) | UK GDPR + Data Protection Act 2018 · PECR 2003 (cookies, email marketing) as amended by Data (Use and Access) Act 2025 *(verify)* · Consumer Contracts Regulations 2013 · Companies (Trading Disclosures) Regs 2008 (name, number, registered office) · DMCC Act 2024 (fake reviews, drip pricing) · Equality Act 2010 · ICO as regulator |

## 5. Americas

| Jurisdiction | Starting points |
|---|---|
| United States (federal) | No general privacy law. FTC Act §5 (deceptive practices; privacy promises must be true) · COPPA (children under 13) · CAN-SPAM (email) · TCPA (calls/SMS) · ADA Title III (web accessibility through case law; WCAG 2.1 AA as common benchmark) · ADA Title II rule for state/local government sites |
| US states | California CCPA/CPRA (thresholds; "Do Not Sell or Share" link; Global Privacy Control) · Virginia, Colorado, Connecticut, Texas, Oregon and many others with similar laws *(verify current list and thresholds)* · state breach-notification laws |
| Canada | PIPEDA · Québec Law 25 (privacy officer, consent, cookies by default off) · CASL (express consent for commercial email) · AODA (Ontario accessibility) |
| Brazil | LGPD, Lei 13.709/2018 · ANPD · Consumer Defense Code (CDC) |
| Others | Argentina, Mexico, Chile, Colombia, Peru: national data protection laws — verify |

## 6. Middle East and Africa (each country is separate)

| Jurisdiction | Starting points |
|---|---|
| United Arab Emirates | Federal PDPL, Decree-Law 45/2021 *(verify implementing regulations)* · DIFC and ADGM have their own data protection laws · consumer protection law |
| Saudi Arabia | PDPL (SDAIA as regulator) with implementing regulations · e-commerce law |
| Qatar, Bahrain, Oman, Kuwait | National data protection laws vary — verify each |
| Israel | Privacy Protection Law, amended (Amendment 13) *(verify)* |
| Turkey | KVKK, Law No. 6698 · VERBİS registration thresholds · e-commerce law 6563 |
| Iran | Verify current status of any data protection law; sanctions may affect services and payments — NEEDS LEGAL REVIEW |
| South Africa | POPIA · ECTA s43 (supplier information for online sales) |
| Nigeria / Kenya | Nigeria Data Protection Act 2023 · Kenya Data Protection Act 2019 |

## 7. Asia-Pacific

| Jurisdiction | Starting points |
|---|---|
| Australia | Privacy Act 1988 (APPs; small-business exemption under revenue threshold) · Spam Act 2003 · Australian Consumer Law · Disability Discrimination Act |
| New Zealand | Privacy Act 2020 · Unsolicited Electronic Messages Act |
| Japan | APPI (amended) · Specified Commercial Transactions Act (seller disclosure page) |
| South Korea | PIPA · Information and Communications Network Act |
| China | PIPL · Cybersecurity Law · ICP filing/licence for sites hosted in mainland China · cross-border transfer rules |
| India | Digital Personal Data Protection Act 2023 and its Rules *(verify commencement)* · IT Act intermediary rules |
| Singapore | PDPA · Spam Control Act |
| Others (Malaysia, Thailand, Indonesia, Vietnam, Philippines) | National PDPAs — verify each |

## 8. Cross-cutting questions to ask the client (only if not verifiable)

Legal form and registration numbers · VAT status · registered address · target
countries · B2B or B2C · employee count/turnover (thresholds, EAA microenterprise) ·
regulated profession or sector · marketing plans (newsletter, SMS, ads) · whether
children may use the site · retention periods they actually operate.
