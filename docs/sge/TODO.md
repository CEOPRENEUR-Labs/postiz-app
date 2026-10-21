# Open SGE publishing work

Updated: 2026-10-21. Scope and acceptance: [integration plan](INTEGRATION_PLAN.md).

## Completed package and next security work

- [x] Verify the final P1 build (`065236b`) on GitHub: success.
- [x] Patch the dependency versions behind 20 historical critical alert instances.
- [x] Refresh GitHub graph and confirm all 20 critical alerts fixed (0 open, none dismissed).
- [x] Add package-boundary and compatibility regressions; 82 tests and narrow types/lint pass.
- [x] Repeat production/all-lock audits: zero critical; retain the other severity findings.
- [x] Complete the final three-app build, localhost HTTP smoke and independent review (9.0/10).
  Hosted results are a separate exact-revision check in the
  [baseline workflow](https://github.com/CEOPRENEUR-Labs/postiz-app/actions/workflows/sge-baseline.yml).
- [x] Repair Axios/redirect dependencies with before/after probes and 16 regression cases.
- [x] Complete P1b full build and independent review (8.5/10).
- [x] Verify both hosted P1b workflows on exact code `11b58ca`: success.
- [ ] Triage 136 remaining high production audit entries before any exposed service or real token.
  Next: remaining Next image-optimization advisory and selected artifact egress paths.
- [ ] Make inherited staging automation appropriate for this fork; its SSH preflight
  fails without a usable deploy key. Do not add production credentials as a workaround.
  Distinguish version matches from shipped/reachable paths; do not infer exploitability.
- [ ] Repair or prove absence of affected dependencies in the selected text-only
  artifact, with focused regressions and fresh audits after bounded changes.
- [ ] Confirm GitHub's newly enabled history secret scan has completed; the local
  Gitleaks check covers the current tree, not full upstream history.

## Decisions before later implementation

- [ ] Confirm hosting/region/resource envelope, monthly cost and operator owner.
- [ ] Choose approved staging and test backup/restore, deletion, rollback and stop.
- [ ] Validate the concrete AGPL combined-work boundary before code integration.
- [ ] Resolve Polotno/commercial editor and font rights or prove those components
  are absent from the actual first artifact; audit its remaining dependency licenses.
- [ ] Implement and verify the exact-release source offer.
- [ ] Review custom forwarded-header handling against the selected trusted proxy.
- [ ] Review plain-Axios media conversion and prove all selected outbound paths
  enforce the intended URL/DNS/redirect boundary; dependency patches alone do not.
- [ ] Establish token storage/key rotation/backup controls and prove role/tenant
  isolation independently of billing configuration before real credentials.
- [ ] Choose and prove Labs account/tenant to Postiz organization/channel mapping.
- [ ] Decide API-key versus self-hosted OAuth strategy and least privilege.
- [ ] Define immutable handoff/approval, deduplication and uncertain-result recovery.
- [ ] Verify LinkedIn app products/scopes for the selected own account or Page.
- [ ] Complete P3/P4 draft-only tests before requesting a real publication pilot.
- [ ] Complete P5 before scheduling, media, other channels or broader accounts.

P1's technical baseline is recorded in [BASELINE](BASELINE.md). No real account,
provider credential, deployment, publication or recurring cost was used. Those
operations remain outside the current authorization.
