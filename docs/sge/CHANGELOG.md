# SGE publishing changes

## 2026-10-21 — Repair and accept the local P1 technical baseline

Fixed incompatible Node pins, replaced the nonworking Nx/Jest test command with
58 real Vitest cases, repaired ESLint flat-config loading, and added narrow types
and a fork-only CI gate. The inherited GitHub build now uses the same Node 22.22.3;
no Temporal workflow history changed.

Frontend builds now use the existing Webpack configuration explicitly, a bounded
8-GiB heap and Next memory optimization. Keeping `isomorphic-dompurify` external
on the server fixes jsdom's misplaced stylesheet during page collection without
removing or changing sanitization. Regression tests cover actual content cleanup.

Passed: pinned frozen offline install, ordinary offline Prisma generation,
58 tests, narrow lint/types and the complete three-app build. Independent technical
review: 9.1/10. No dependency versions or lock entries changed. Added versioned
dependency/container/license inventories and scan evidence. GitHub secret scanning,
push protection and vulnerability alerts are enabled; automatic updates remain off.

P1 acceptance is limited to the technical baseline and inventory. Release remains
BLOCKED: production dependency audit reports 15 critical and 163 high entries,
plus unresolved auth/token, license and operational gates. Triage/remediation is
the next bounded package before exposed service or real credentials. No deployment,
provider/account connection or publication occurred; hosted CI is checked separately.

GitHub verification completed for `00e8463`: the SGE baseline workflow (58 tests,
types/lint, Prisma and full build), inherited full build and CodeQL all passed.
Recorded their exact commit, run URLs and step outcomes in the
[hosted CI receipt](evidence/P1_HOSTED_CI_2026-10-21.json). This confirms P1's
technical baseline on Linux as well; the release stop above remains unchanged.

Details and verification limits: [BASELINE](BASELINE.md), [SESSION](SESSION.md).

## 2026-10-20 — Own fork and integration plan

FACT — Created the CEOPRENEUR Labs public fork from upstream
`651876e24317c2d8e717262cf98267ec6f699180`, retaining AGPL and ancestry.
The owner accepted AGPL for the Postiz portion.

Added the [staged plan](INTEGRATION_PLAN.md), roadmap, tasks, and session evidence.
The proposed boundary keeps original SGE content/permissions in Labs and uses
Postiz separately for selected publication payloads. Draft handoff precedes a
single explicit publication pilot; scheduling and broader capabilities follow.
The plan covers source obligations, tenant mapping, credentials, uncertain
outcomes, provider permissions, operational recovery, and the 8.5/10 review floor.

This is a planning checkpoint, not an implemented or deployed integration.
Application source, dependencies, workflow files and LICENSE are unchanged.
Documentation checks and independent review passed at 9.2/10 within this planning
scope. Detailed evidence and delivery boundary are in [SESSION](SESSION.md).
