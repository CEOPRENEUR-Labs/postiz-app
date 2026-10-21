# SGE publishing session

## 2026-10-21 — P1b HTTP dependency repair

FACT — Continued on clean isolated `codex/sge-http-dependencies` from `fec83dd`.
Main's Build (39628513730) and SGE baseline (39628513660) passed at that revision.
The inherited staging resolver (39662155808) fails at SSH preflight with an
unusable key; that is separate from build/test health. GitHub still lists 20
historical critical alerts; dependency-graph refresh/closure is not confirmed.

A fresh pre-patch investigator and the parent traced the shared Axios consumers,
actual lock/installed copies and direct media/provider callers. Updated only
Axios to 1.20.0 and follow-redirects to 1.16.1 with targeted dependency constraints.
The generated lock changes only those package versions; pnpm also deduplicates
three edges to existing form-data/hasown versions. All eight transitive Axios
consumers resolve the patched copy. No application or Temporal history changes.

Four before/after probes reproduce then close package-level credential leakage,
Fetch redirect-limit bypass and inherited multipart visitor behavior. Sixteen
new tests preserve ordinary redirects, streamed multipart, arraybuffer/stream
reads, DNS hooks, abort classification and provider error responses. All 98 tests,
baseline types/lint, offline Prisma generation and the complete three-app build
passed (167.52 seconds, exit 0). Installs disabled hooks. Initial frozen install
was attempted before lock resolution completed and correctly refused the config
mismatch; replay after resolution passed without weakening frozen enforcement.

Node 22.22.3/pnpm 10.6.1; sanitized environment with user-directory access denied.
Build/types/lint/Prisma denied network; HTTP tests/probes allowed only loopback.
Parity: standalone package/local build, no Labs Netlify transport/deployed config
or provider accounts. These are engine/component checks, not production evidence.

Fresh production JSON audit: 0 critical, 136 high, 204 moderate, 36 low;
full JSON audit: 0 critical, 141 high, 205 moderate, 36 low. Both return 1 for
remaining findings. The unchanged plain critical CI command returns 0. All 14
selected records (9 high, 5 moderate) disappear; newly reported Vite records
(2 moderate, 1 low) explain the other count changes. No ignore/dismissal.
Current-tree Gitleaks initially checked 1,054 files: the same 24 checksum metadata
findings, zero unresolved, no suppression; no history scan is claimed.

Fresh independent read-only review: no actionable bypass/regression, 8.5/10.
Reviewer traced source/exported Node and browser builds, copies and consumer
contracts; no runtime tests were successfully run by the reviewer. The parent
owns the runtime checks above. HTTP2 controls/session failures, CIDR/proxy ReDoS
and several other gadgets were not individually reproduced. Application SSRF,
trusted proxies, token/tenant, license, container/native and operating acceptance
remain open. Hosted verification must refer to the pushed revision separately.

## 2026-10-21 — P1a critical dependency repair

FACT — Verified the final P1 documentation build on `065236b`: GitHub run
[39583938450](https://github.com/CEOPRENEUR-Labs/postiz-app/actions/runs/39583938450)
succeeded. The owner authorized critical dependency repair. Worked on the clean
isolated `codex/sge-critical-dependencies` worktree; unrelated Labs work is untouched.

Updated eleven package families with the resolution boundaries in
[the plan](INTEGRATION_PLAN.md#p1a--remove-known-critical-dependency-advisories).
The regenerated lock removes Tinypool/Happy DOM and keeps all other targeted
copies patched. Removed only the unused Pigment dependency; no application,
authentication, database or Temporal workflow implementation changed.

Local verification used Node 22.22.3/pnpm 10.6.1, sanitized environment and user-home
access denied. Installs disabled lifecycle hooks. Normal Prisma 6.5 generation
needed its official verified engine download once in the new worktree; no database
was started or migrated. Types/lint, 82 tests and the full three-app build passed;
build exit 0 after 429.03 seconds. The 24 added cases exercise actual packages,
normal inputs, Temporal's shipped codec and native-installer Tar call shapes.
Six bounded before/after probes show original package controls failing and
patched controls succeeding. Shell text was never executed; compressed test input
was bounded to 8 MiB. Native bcrypt loading and Temporal replay are not proven.

The Next HTTP smoke allowed loopback only: `/auth/login` 200 and malformed image
parameters 400. The server was stopped. Parity difference: standalone local Next,
branch build, no Labs/Netlify transport or deployed provider/flag configuration;
this is engine/component evidence, not production acceptance.

Fresh pnpm JSON audits: production 0 critical/145 high/207 moderate/35 low;
all dependencies 0 critical/150 high/208 moderate/35 low. JSON mode returns exit 1
for remaining findings. The exact critical-only CI command without JSON returns
exit 0. Independent registry bulk matching over all 3,899 locked versions found
zero critical advisories (329 matching advisory records; separate counting).
The initial shell-quote 1.8.4 candidate was rejected for a newer critical advisory
and improved to 1.12.0. No ignore/dismissal/error-tolerance rule was added.

Independent fresh read-only bypass/regression review: 9.0/10, no concrete issue.
Current-tree Gitleaks: 1,053 files, 24 raw findings classified as the same
localization/source checksum metadata, zero unresolved; no suppression added.
It checked every lock/snapshot/optional edge, installed nested package identity,
actual consumer resolution and the Tar API boundary. This is not a full security,
native/container, provider or operating acceptance. Release remains BLOCKED by
high-severity triage, auth/token/tenant, trusted-proxy, license and operating gates.
Hosted runs must be checked separately for the pushed code revision.

## 2026-10-21 — P1 technical baseline and explicit release stop

FACT — The owner requested P1, then explicitly requested repair of its open
build/test failures and completion with a minimum 8.5/10 review.

Completed:

- Inventoried architecture, 272 direct dependencies, complete locked versions,
  both compose files, install/startup effects, auth/token paths, licenses and assets.
- Fixed Node to 22.22.3 in engines/Volta and both GitHub build workflows.
  22.12 was initially tested but rejected by the sanitizer's dependency constraint.
- Replaced the unusable Nx/Jest root command with 58 real Vitest contract cases;
  added narrow type/lint gates and repaired Next flat-config loading.
- Fixed frontend builds with explicit Webpack, bounded 8-GiB heap, documented
  memory optimization and native server resolution of the unchanged sanitizer.
- Added a fork-only read-only CI workflow; retained existing steps and corrected
  only the inherited build matrix. No Temporal workflows/activities changed.
- Enabled GitHub secret scanning, push protection and vulnerability alerts in this
  public fork. Readback confirmed enabled; automatic update PRs and provider
  validity checks remain disabled. No existing CI control was disabled.

Verified locally on macOS arm64 with Node 22.22.3/pnpm 10.6.1:

- Frozen installation replayed offline with lifecycle hooks disabled.
- Ordinary Prisma 6.5.0 client generated offline after its official download.
- 58/58 real tests, baseline types and lint passed.
- Complete frontend/backend/orchestrator build passed, including frontend types,
  page generation and traces; final full build exit 0 after 384.25 seconds.
- Build/test processes denied network and user-home reads/writes; the isolation
  probes passed. Download and audit requests were separately bounded.
- Independent final review: code/tests 9.1/10, CI configuration 9.0/10,
  documentation/evidence 9.2/10. All eleven source and six log digests matched;
  relative links and `git diff --check` passed. Local P1 accepted at 9.1/10.
- Gitleaks: 24 raw findings classified as 23 localization checksum values and one
  actual verified source-file digest, zero unresolved; no ignore/suppression added.

Evidence: [baseline report](BASELINE.md), [verification receipt](evidence/P1_VERIFICATION_2026-10-21.json),
[inventory](evidence/P1_INVENTORY_2026-10-21.json), and dependency audit files.

BLOCKED — Security/operating release is not accepted. The production audit
reports 15 critical and 163 high entries; the broader lock inventory also includes
development/optional packages and is not the same count. Actual reachability
needs triage, and affected shipped packages must be repaired before exposure or
real tokens. Auth/token protection, editor/font rights, source offer, container
packaging, runtime/recovery and real account acceptance remain open.

Separately verified after push on `00e8463a0ce07707a9765074899e95f2bddab433`:
GitHub's SGE baseline (58 tests, types/lint, Prisma and full build), inherited
full build and CodeQL all completed successfully. The
[hosted receipt](evidence/P1_HOSTED_CI_2026-10-21.json) records exact runs and steps.
This closes the hosted technical baseline check, not security/operating release.
Independent review of this closing documentation: 9.3/10; all run/job metadata
and both hosted log hashes matched. No further correction was required.

No deployment, account connection,
platform token, publication, DB startup/migration, paid AI, mail or billing change
occurred. The unrelated dirty Labs checkout remains untouched.

## 2026-10-20 — Fork and staged plan

FACT — The owner accepted AGPL for the Postiz portion and requested an own fork
plus a documented plan for integration into SGE as a publishing service.

Completed locally:

- Created public `CEOPRENEUR-Labs/postiz-app` from `gitroomhq/postiz-app`.
- Verified parent, AGPL, default branch `main`, and initial revision
  `651876e24317c2d8e717262cf98267ec6f699180`.
- Configured local `origin` as the fork and `upstream` as the original repository.
- Read root instructions, source/API and LinkedIn provider boundaries. Inspected
  the existing Labs SGE contract; GitHub confirms PR #369 is merged into Main
  `5e1b0d9b13652184e3f3d611cddea66faec7f340`.
- Added a canonical plan and scoped roadmap/tasks/changelog. Preserved the
  upstream README after an introductory fork-navigation section.

Verified:

- GitHub fork metadata: public, correct parent, AGPL, default branch `main`.
- All relative documentation links resolve. The upstream LICENSE is byte-identical
  (SHA-256 `d322fb1066693d8ed25495d11029f443aa793316852749e1389773c1946251b3`);
  upstream README content is preserved after the new navigation section.
- Changed-file scope, documentation whitespace, credential-shaped-token check,
  and `git diff --check`. Existing upstream README whitespace is preserved.
- Independent read-only review: 9.2/10 for planning quality, no blocking finding.
  Reviewer checked the API/auth, draft workflow, LinkedIn, Node, AGPL, and Temporal
  source boundaries. The reviewer's own remote lookup was unavailable; remote
  metadata above was separately verified by the primary agent.

Delivery: commit these documentation files to the fork's existing `main`, push,
and compare local HEAD to GitHub's branch head before handoff. Report the final
commit externally; embedding a document's own commit hash would be circular.

FACT — GitHub Actions remains enabled at repository level. No workflow was
manually dispatched or workflow file changed. A normal documentation push may
trigger the inherited Build workflow; source/runtime acceptance remains open.

Limits: documentation only; no local install/build, service startup, workflow dispatch,
account connection, external content transfer, social post, or Labs code change.
No build/test/production acceptance is claimed. The unrelated dirty Labs primary
checkout and its existing operational work remain untouched.

Next: P1 source/runtime/license and baseline-verification inventory.
