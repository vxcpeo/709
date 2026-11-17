# Tranova identity and availability record

The prepared identity is **Tranova / tranova.xyz / @tranova**, pronounced **tra-NO-va**, with the tagline **Make timing accountable.** No domain, account or handle was registered by this work.

Tranova is a coined name formed from tranche releases and nova renewal: an allocation arrives as a named slice on its own visible date, and the next one follows. The previous identity's decision record and evidence are archived under `docs/history/pre-rebrand-2026-10-22/`, and the root `brand.txt` registry keeps the full lineage.

## Checks performed on 22 October 2026

| Target | Method | Result | Confidence |
| --- | --- | --- | --- |
| `tranova.xyz` | CentralNic RDAP `https://rdap.centralnic.com/xyz/domain/tranova.xyz` in Chrome | HTTP **404**, `objectClassName: error`, no registration record at 16:51:26 UTC (00:51:26 UTC+8) | Medium: registrar pages were bot-challenged, so premium/reserved status was not ruled out |
| `@tranova` | Real Chrome 155.0.8059.85 navigation to `https://x.com/tranova` | HTTP **404**, page renders “Hmm…this page doesn’t exist”, no public profile at 16:51:48 UTC (00:51:48 UTC+8) | High for “no public profile today” |

Browser evidence: Chrome/155.0.8059.85 driven over the DevTools Protocol, headless, direct connection (no proxy). Screenshots:

- [X profile response](evidence/x-tranova-profile.png)
- [RDAP 404 response](evidence/xyz-rdap-404.png)
- [Registrar page (GoDaddy, empty check)](evidence/registrar-godaddy.png)
- [Registrar page (Porkbun, bot challenge)](evidence/registrar-porkbun.png)

A negative control was run during the same sweep: `.xyz` names confirmed as registered (`vesto`, `timera`, `cadenza`, `clara`) all returned HTTP 200 from the same RDAP endpoint, while unregistered coinages returned 404, so the endpoint discriminates correctly.

## Scope and limits

- A 404 from RDAP means no registration record was returned at that moment. It is not a reservation, and premium or registry-reserved status can still apply at checkout.
- X returns 404 for handles that do not exist; that is not proof the handle will remain free or that registration will succeed under the intended account.
- A limited public search found unrelated uses of the same spelling: TRANOVA companies (Switzerland and elsewhere), a Tranova hotel operator in Japan, and one ERC-20 contract token on Base. None is a token-scheduling product, but trademark clearance and namespace exclusivity are **not** claimed.
- No domain purchase, account creation, reservation, push or deployment was performed. Availability is a point-in-time snapshot.

## Candidate selection

Earlier sweeps rejected taken `.xyz` names (`clara`, `claria`, `ledger`, `timing`, `cadence`, `members`, `payroll`, `vesting`, `veria`, `verio`, `anchor`, `onchain`, `cliffa`, `clifra`, `scheda`, `vestra`, `vesto`, `timera`, `cadenza`) before X was consulted. Tranova was the first candidate in the scored list where both checks came back available, so it was selected. The full sweep, including per-candidate evidence and screenshots, is retained in `.rebrand/availability.json` and `.rebrand/availability/`.

## Name and domain evidence in this folder

- `name-availability.md` (this file)
- `selected-brand.json` — machine-readable identity and evidence summary
- `brand-map.md` — surface replacement map
- `cleanup.md` — what moved to history
- `validation.md` — what was verified for this delivery
- `evidence/` — screenshots listed above
