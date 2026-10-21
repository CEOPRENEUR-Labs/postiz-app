# SGE publishing roadmap

Updated: 2026-10-21. Canonical scope: [integration plan](INTEGRATION_PLAN.md).

| Stage | Outcome | Status |
| --- | --- | --- |
| P0 | Own public fork, preserved AGPL/history, versioned plan | Accepted at 9.2/10; documentation evidence in SESSION |
| P1 | Pinned runtime, reproducible baseline, maintenance/license inventory | Technical baseline accepted, 9.1/10; 58 tests/full build pass locally and on GitHub; CodeQL passed on `00e8463` |
| P1a | Critical dependency remediation and regression gate | Accepted locally, 9.0/10: zero critical in repeated CLI/bulk audits, 82 tests, full build and localhost HTTP smoke pass; hosted checks separate |
| P1b | Shared HTTP dependency repair | Accepted at 8.5/10: Axios 1.20.0/redirects 1.16.1, 98 tests/full build locally; both hosted workflows passed on `11b58ca`; GitHub critical alerts 0 open/20 fixed |
| Release stop | High-severity dependency triage and other recorded gates | BLOCKED: 136 high production audit entries after P1b plus auth/license/operating acceptance before exposure/real tokens |
| P2 | Isolated service, operations and source-offer proof | Not started; dependency/security/license gates and hosting/cost decisions open |
| P3 | Offline server-side, tenant-bound draft adapter | Not started |
| P4 | One authorized own-channel draft, no publication | Not started; account/scopes and environment open |
| P5 | One explicitly approved visible post | Not started; separate publication acceptance |
| P6 | Bounded scheduling, cancellation and recovery | Not started |
| P7 | Demand-led channels, media, roles and measurement | Deferred |

Proceed in order, with a review of at least 8.5/10 per package and no unresolved
critical defect. Existing Labs closure acceptance remains separate. No new
feature is described as deployed until its actual live path is verified.
