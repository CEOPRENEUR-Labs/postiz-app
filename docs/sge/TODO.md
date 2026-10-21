# Open SGE publishing work

Updated: 2026-10-21. Scope and acceptance: [integration plan](INTEGRATION_PLAN.md).

## Next package: release-blocking dependency triage

- [ ] Triage the [production audit](evidence/P1_PRODUCTION_AUDIT_2026-10-21.json),
  starting with its 15 critical and 163 high reported entries. Distinguish package
  advisories from actual shipped/reachable paths; do not infer exploitability.
- [ ] Repair or prove absence of affected dependencies in the selected text-only
  artifact; avoid blindly applying major overrides across unused upstream features.
- [ ] Rebuild, run relevant regressions and repeat the audit after each bounded fix.
- [ ] Confirm hosted fork CI separately from the accepted local baseline.
- [ ] Confirm GitHub's newly enabled scanning has completed; the local Gitleaks
  check covers the current tree, not full upstream history.

## Decisions before later implementation

- [ ] Confirm hosting/region/resource envelope, monthly cost and operator owner.
- [ ] Choose approved staging and test backup/restore, deletion, rollback and stop.
- [ ] Validate the concrete AGPL combined-work boundary before code integration.
- [ ] Resolve Polotno/commercial editor and font rights or prove those components
  are absent from the actual first artifact; audit its remaining dependency licenses.
- [ ] Implement and verify the exact-release source offer.
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
