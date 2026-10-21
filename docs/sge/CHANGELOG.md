# SGE publishing changes

## 2026-10-21 — Shared HTTP dependency repair

Updated Axios 1.19.0 → 1.20.0 and its resolved follow-redirects 1.16.0 → 1.16.1,
covering every existing SDK consumer. The direct floor, bounded Axios override
and scoped redirect pin prevent retaining the affected copies. No application,
provider, authentication, database or Temporal implementation changed.

Four isolated before/after probes close array-header credential leakage, custom
sensitive-header escaping, the Fetch redirect-limit bypass and inherited
multipart visitors. Added 16 security/compatibility regressions: all 98 tests,
baseline types/lint, ordinary offline Prisma generation and the full three-app
build passed. Independent fresh read-only review: 8.5/10, no concrete remaining
bypass/regression; not every optional HTTP2/proxy/gadget advisory was reproduced.

Fresh production audit: 0 critical / 136 high / 204 moderate / 36 low. All 14
selected advisory records disappear (9 high, 5 moderate); three newly reported
Vite records remain open without changing Vite. Full audit retains 141 high;
plain critical CI gate passes. No ignore, dismissal or secret was added.
Release remains BLOCKED; the remaining plain-Axios media path, egress and the
other security/license/operating gates are separate work. Exact-revision hosted
CI follows push. See [P1b plan](INTEGRATION_PLAN.md#p1b--repair-the-shared-http-dependency-boundary).

## 2026-10-21 — Critical dependency remediation

The last P1 build (`065236b`) passed. Updated the 11 critical dependency families
with targeted constraints and a regenerated frozen lock. Next is pinned at 16.3.6;
Vitest/UI/coverage at 4.1.2 removes Tinypool. Removed unused Pigment and omitted the
unused Happy DOM peer. Scoped overrides preserve multipart major versions and
limit the Tar major change to the native installer. No application/authentication
or Temporal workflow implementation changed.

Added 24 actual package-boundary regressions, including normal input controls and
installer callback/stream/promise compatibility. 82 tests and baseline types/lint
passed. Production/all-dependency CLI reports and an independent all-lock bulk
check contain zero critical advisories. The initial shell-quote 1.8.4 candidate was improved
to 1.12.0 after the repeat audit exposed a newer critical advisory. No ignore,
dismissal or provider action was used. The full three-app build passed in
429.03 seconds; localhost login/image
parameter checks passed with external traffic denied. Independent patch review:
9.0/10, no concrete remaining bypass or regression. GitHub's fork baseline
now rejects critical advisories before installation; the command's real exit
behavior was checked separately from JSON.

Release stays BLOCKED: 145 production high entries, auth/token/tenant, license,
native/container and operating gates remain. Audit counts do not establish
application reachability. See [P1a in the plan](INTEGRATION_PLAN.md#p1a--remove-known-critical-dependency-advisories).

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
