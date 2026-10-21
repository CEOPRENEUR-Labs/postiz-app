# SGE publishing roadmap

Updated: 2026-10-21. Canonical scope: [integration plan](INTEGRATION_PLAN.md).

| Stage | Outcome | Status |
| --- | --- | --- |
| P0 | Own public fork, preserved AGPL/history, versioned plan | Accepted at 9.2/10; documentation evidence in SESSION |
| P1 | Pinned runtime, reproducible baseline, maintenance/license inventory | Technical baseline accepted locally, 9.1/10; 58 tests and full build pass; hosted CI separate |
| Release stop | Triage/remediate dependency findings and other recorded gates | BLOCKED: production audit reports 15 critical entries; next package before exposure/real tokens |
| P2 | Isolated service, operations and source-offer proof | Not started; dependency/security/license gates and hosting/cost decisions open |
| P3 | Offline server-side, tenant-bound draft adapter | Not started |
| P4 | One authorized own-channel draft, no publication | Not started; account/scopes and environment open |
| P5 | One explicitly approved visible post | Not started; separate publication acceptance |
| P6 | Bounded scheduling, cancellation and recovery | Not started |
| P7 | Demand-led channels, media, roles and measurement | Deferred |

Proceed in order, with a review of at least 8.5/10 per package and no unresolved
critical defect. Existing Labs closure acceptance remains separate. No new
feature is described as deployed until its actual live path is verified.
