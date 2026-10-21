# SGE publishing session

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

Hosted CI is a separate remote check after push. No deployment, account connection,
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
