# SGE publishing changes

## 2026-10-25 — Multipart dependency repair

Replaced the old request pin with bounded same-major form-data overrides:
2.5.6/3.0.5/4.0.6. All five vulnerable consumer edges are repaired; existing
provider/Axios root 4.0.6 remains. No application configuration, authentication,
UI/content, database, provider or Temporal implementation changed.

Added 105 boundary/compatibility cases: 251 tests, types/lint and offline Prisma
pass. Actual before/after builders and native parsing no longer permit synthetic
part/header injection; normal names, file/stream bytes, lengths and MIME remain.
Independent static review: 9.0/10. The full three-app build passes; exact-SHA
hosted delivery remains separate.

Production audit: 0 critical / 139 high / 209 moderate / 38 low. Three matching
high records disappear; no ignore/dismissal. Actual provider operation and raw
custom header trust remain separate. Release stays BLOCKED.
See [P1e](INTEGRATION_PLAN.md#p1e--repair-multipart-field-and-filename-serialization).

## 2026-10-23 — Critical framework refresh

Updated Next/env/SWC to 16.4.1, the four direct Sentry SDKs to 10.75.2 and
application Sharp to 0.35.5. The fresh audit's three critical and four selected
high records disappear. Next's prior private Sharp already met the image
workaround; cache/tunnel prerequisites remain absent in this app. No app
configuration, authentication, UI/content, database or Temporal changes.

Added 19 boundary/compatibility cases: 146 tests, types/lint and offline Prisma
pass. Before/after checks verify tunnel middleware decisions and stable Flight
buffer snapshots; ordinary replies and SVG/PNG/JPEG/animated GIF processing pass.
Independent static review: 8.8/10. All three apps build; built login/local PNG
return 200, protected routes redirect to auth (307), disallowed images return 400.
The smoke parser now accepts valid relative Location headers; app behavior is unchanged.
Linux x64 CPU requirements and production acceptance remain separate gates.

Production audit: 0 critical / 137 high / 202 moderate / 36 low. Newly reported
Zod findings affect unchanged resolutions; no ignore/dismissal. Release stays
BLOCKED. See [P1d](INTEGRATION_PLAN.md#p1d--refresh-the-critical-framework-boundary).

## 2026-10-21 — Next security update

Verified the previous documentation build (`4d13fe3`, run 39666258315): success.
Pinned Next and its existing override at 16.3.8, with matching env/eight SWC
versions. No application configuration, UI/content, provider, authentication,
database or Temporal changes. The current built app has no remote-image allowlist;
the image advisory's active SSRF prerequisite is absent in this inspected state.

Added 29 actual Next boundary regressions (127 total). Before/after simulated
transport checks verify DNS pinning; compatibility covers redirects, compression,
body limits and errors. Types/lint, offline Prisma and the full build pass.
Built local login/PNG return 200; disallowed remote images return 400. Local dev
MCP rejects a foreign Origin (403) and accepts same-origin initialization (200).
Independent review: 8.7/10. Real remote sockets/TLS/reuse and production parity
remain unverified; hosted CI is checked separately for the pushed revision.

All six matching Next advisories disappear. Production audit: 0 critical / 135
high / 201 moderate / 35 low. A newly reported moderate Vitest-Mocker advisory
in the unchanged graph remains open. Release/security/operating gates remain
BLOCKED; no ignore/dismissal, deploy or provider action.
See [P1c](INTEGRATION_PLAN.md#p1c--patch-next-without-widening-the-image-allowlist).

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
other security/license/operating gates are separate work. Both hosted Build and
SGE baseline passed on code `11b58ca`. A documented Dependabot graph refresh
now confirms all 20 historical critical alerts fixed (0 open, none dismissed),
with current package versions in GitHub SBOM. See [P1b plan](INTEGRATION_PLAN.md#p1b--repair-the-shared-http-dependency-boundary).

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
