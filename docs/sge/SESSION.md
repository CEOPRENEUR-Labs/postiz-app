# SGE publishing session

## 2026-10-29 — Bound Postiz CI triggers

FACT — Refreshed origin/Main `58f0faf`, recent Actions and the latest failure
log. Repeated scheduled staging jobs fail SSH preflight; issue maintenance is
scheduled but skips this fork. P1f's exact code already passed
[Build](https://github.com/CEOPRENEUR-Labs/postiz-app/actions/runs/40381498379),
[SGE baseline](https://github.com/CEOPRENEUR-Labs/postiz-app/actions/runs/40381498422)
and [CodeQL](https://github.com/CEOPRENEUR-Labs/postiz-app/actions/runs/40381498391).
Main protection returned 404 `Branch not protected`; repository rulesets were `[]`.

Created isolated `codex/postiz-ci-triggers` from origin/Main; preserved Labs and
the incomplete `codex/sge-high-dependencies` working copy. Removed both cron
schedules and made inherited Build manual-only. SGE baseline retains its complete
job, adds manual and merge-queue events, and skips only docs/branding-only changes
on Main pushes/PRs. Mixed changes and future code/configuration remain covered.
CodeQL and publishing workflows are unchanged. No credentials were added.

Validation: official actionlint 1.7.12 Darwin ARM64 archive SHA-256
`aba9ced2dee8d27fecca3dc7feb1a7f9a52caefa1eb46f3271ea66b6e0e6953f`
matches the release checksum. All nine active YAML workflows pass with optional
shellcheck/pyflakes integrations disabled. Its first pass found an inherited
unsupported `exempt-pr-label` input; corrected it to `exempt-pr-labels` and reran.
All 21 local event/path scenarios pass. Deep comparison confirms the complete SGE
job definitions and CodeQL are unchanged; existing cancellation is preserved.
Fresh independent read-only architecture/convention review: 9.2/10, no scoped
CI regression; its stale baseline-documentation finding is corrected.
Application tests/build are not rerun locally for this workflow/docs-only patch;
the delivered SGE run remains a separate exact-SHA check.

Self-review: diagnosis 9.0/10 (current run/log evidence); configuration 9.0/10
(bounded changes, required verification retained); validation/tracking 9.0/10
(actionlint plus event/path checks, with hosted scheduling still to be observed).
No application, dependency, UI/content, Temporal history, provider, production
or deployment change. High-dependency repair remains unfinished and is not
included. Future branch protection must reconcile filtered required workflows.
Already queued historical runs can still finish; no absence-of-future-runs claim
is inferred from a short observation window.

Delivery: `f50d2d3eb1b76c5c341e078ba49cfc71b37a05ca` was fast-forward pushed
to own-fork Main. GitHub created exactly one automatic run for that SHA:
[SGE baseline 40886838308](https://github.com/CEOPRENEUR-Labs/postiz-app/actions/runs/40886838308),
completed successfully. Critical audit, frozen installation, Prisma, types,
lint, tests and all three app builds passed. No duplicate Build or CodeQL run
was expected for the workflow/docs-only patch. These final tracking changes are
documentation-only and should not start another full build under the new policy.

## 2026-10-26 — P1f URL, DNS and redirect boundary

Started from clean own-fork Main `ce9c066`; fetched origin and verified equality.
Labs' unrelated dirty/staged work was preserved. Branch: `codex/sge-egress-security`.

Fixed shared Fetch/Axios literal bypass, pinned full DNS answers and redirect
checks, and protected Axios environment-proxy bypass. Routed PNG conversion,
media imports, storage and both webhook send paths through protected clients.
Initial independent static review: 8.5/10 scoped candidate, with one confirmed
Bluesky SDK sibling outside the diff. The package gate stayed open: both SDK
constructors now use protected HTTPS Fetch, covering admission, stored URLs and
DID-provided PDS URLs. No second independent review is claimed.

| Work step | Evidence and self-review |
| --- | --- |
| Boundary investigation | 8.7/10: independent source trace and eight actual old-code synthetic private reads; no live/provider impact inferred |
| Shared transport and caller repair | Initial scoped static review 8.5/10; final parent 8.8/10 after the confirmed SDK sibling was fixed and actual installed-SDK cases passed |
| Verification and tracking | 8.8/10: 302 tests, focused types/lint, offline Prisma, full three-app build and critical audit pass; deployed egress/TLS and operating acceptance remain open |

Before/after uses source from `ce9c066` and the current file, transpiled with the
installed compiler. Eight literal/numeric-alias Fetch/Axios cases read only a
synthetic loopback marker before and are rejected with zero fixture hits after;
the explicit generic-provider private-network opt-out still works. 51 new tests
exercise actual transports/SDK; public TLS/socket routing is simulated locally.
The suite totals 302 tests in nine files. Already-aborted cancellation is covered;
in-flight body cancellation and exhaustive provider coverage are not claimed.

Final local checks: frozen install without hooks; ordinary offline Prisma6.5;
`pnpm run typecheck:sge-baseline`; scoped ESLint on baseline tests and transport;
`pnpm test`; `pnpm run build` (139.64 seconds), all pass. Current-tree Gitleaks:
24 reviewed checksum/source-digest matches, zero unresolved credentials; no
history-scan claim. October26 production audit: 0 critical /139 high /209 moderate
/38 low; JSON audit exits1 for remaining findings, plain critical gate exits0.
Audited nine byte-identical manifest/lock/workspace files; no dependency change,
ignore, dismissal or manual graph submission.

Setup failures retained: incomplete old dependencies survived an incremental
install and caused a Sentry type/bin mismatch; preserved them and reinstalled
completely without hooks. Offline install initially lacked pinned tarballs;
normal frozen install obtained them, and normal Prisma engine download repaired
the empty engine cache before offline generation passed. Harness-only Git config
access and missing pnpm executable-name setup were corrected. A simulated socket
needed native connecting lifecycle; DNS mock overload typing was corrected.
Initial audits against the installed tree exhausted the local heap; repeated
unchanged audits from exact manifest copies succeeded. No product gate weakened.

Behavior changes: media imports/tool copy and webhooks enforce public HTTPS,
even with the provider opt-out; protected Axios ignores environment proxies.
Generated-image data URLs remain parsed locally. See P1f's explicit bounded
English technical-error maintenance exception and pre-release localization gate.
No Temporal workflow/parameter, UI/design, schema, credentials, deployment,
publication, source offer or operating approval changed. Existing Sentry import/
instrumentation warnings and staging SSH preflight remain separate open work.

Delivery: local acceptance complete; exact-SHA hosted checks are still separate.

## 2026-10-25 — P1e multipart dependency repair

FACT — Main remained `1095e4a5a1e8222047e34b3d43e53ced93f4752d`. Previous
temporary checkouts were incomplete, so a fresh isolated checkout was made from
the confirmed remote; existing folders and unrelated Labs edits were preserved.
Used `codex/sge-multipart-security`, Node22.22.3 and pnpm10.6.1. Restored the
pinned Prisma engine cache without a database, then repeated generation offline.

A fresh read-only investigator and parent traced the five vulnerable lock edges,
all filename sources and actual callers. Direct provider/Axios imports resolve
safe root4.0.6; Transloadit uses fixed label `subtitles.srt` and subtitle text as
body. No vulnerable application attacker path was established. Browser/global
FormData and Telegram's safe Cypress request implementation are separate.

Replaced request's old2.5.5 override with three bounded same-major selectors:
2.5.6/3.0.5/4.0.6. Only form-data versions change, with a compatible shared
hasown edge and refreshed registry deprecation metadata. Official npm tarball
SHA-512 checks and four installed implementation-file SHA-256 matches pass.
Before/after actual builders and independent native parsing show five contexts
changing from two parsed parts/injected header to one part/no injected header;
two already-safe contexts remain safe. No network request or upload was sent.

105 regressions cover seven consumer contexts and all four physical copies.
All 251 tests, types/lint, ordinary offline Prisma and the complete frontend,
backend and orchestrator build pass (255.67 seconds). An initial fixture expected
an encoded parsed filename; it now correctly checks encoded wire bytes and the
native parser's decoded original filename. No production code or gate was weakened.
The frozen install gate also correctly rejected an attempt before lock generation
completed; it passed on the final lock. Existing Sentry warnings remain visible.

Fresh independent static review: 9.0/10; no scoped surviving bypass/regression.
Filename cases check serialized headers; parsed extra-part attacks exercise the
field-name path. Explicit raw headers/contentType remain caller-controlled and
outside this guarantee. Actual provider operation, egress safety, full secret
history, container/CPU and production parity remain unverified. These are bounded
dependency/component checks, labelled engine-level evidence in the plan.

Starting production audit: 0 critical/142 high/209 moderate/38 low. After repair:
0 critical/139 high/209 moderate/38 low; full graph0 critical/144 high/210 moderate/
38 low. Three selected high records disappear. JSON audits still exit1 for other
findings; the unchanged plain critical gate exits0. No ignore/dismissal, provider,
credential, deployment, publication, feature flag or recurring-cost operation.
Exact-SHA hosted delivery is recorded separately; release remains BLOCKED.

## 2026-10-23 — P1d critical framework refresh

FACT — Fetched clean Main `b0a400eec46ccc102f2f64e483d829fe12f19000` and worked
on isolated `codex/sge-security-p1d`. Labs' unrelated dirty work was untouched.
The fresh registry audit reported 3 critical/138 high/202 moderate/36 low.
Two critical records match Next; one matches Sentry, whose upstream rates it
Moderate. A fresh investigator and parent traced prerequisites and direct uses:
Next already privately used fixed Sharp; cache/tunnel prerequisites were absent.
The direct Sharp 0.33.5 used by five application files still needed repair.

Pinned Next/override 16.4.1, four coordinated Sentry roots 10.75.2 and direct
Sharp 0.35.5. Only their closure changes, including two Sentry OTel edges and
removal of obsolete native Sharp packages. Root/shared runtime Sentry aligns;
build-plugin Core 10.75.0 is a separate unchanged dependency. Official npm
tarball SHA-512 checks and four critical installed source-file hashes match.

Before/after actual component probes reproduce then remove broad synthetic
tunnel skipping and mutable Flight queued buffer views. No RCE payload or
external target was used. Nineteen added regressions bring the suite to 146;
types/lint, ordinary offline Prisma and the full three-app build pass (510.47s).
SVG/PNG/JPEG and animated GIF conversions retain dimensions/frames/timing/loop.
Built HTTP: login/local PNG 200; protected routes redirect to auth 307;
unconfigured/private/protocol-relative images and invalid width 400. The initial
smoke harness rejected a valid relative Location; its parser was corrected and
the complete smoke passed without an application change. Local dev MCP origin
checks are recorded separately; all local servers are stopped after their run.

Fresh static candidate review: 8.8/10, no scoped surviving bypass. Its concrete
conditional compatibility note is retained: root Sharp now extends Linux x64-v2
requirements to backend/orchestrator imports. Target CPU/container is UNKNOWN.
Private emitter checks do not prove real streaming/backpressure/detachment;
native RCE and production parity were not exercised. Runtime checks used pinned
Node22.22.3/pnpm10.6.1 with home access denied and network denied except the
bounded installation/audit downloads or localhost-only tests/smokes.

Current production audit: 0 critical/137 high/202 moderate/36 low; full audit:
0 critical/142 high/203 moderate/36 low. Seven selected records disappear;
new Zod findings match unchanged resolutions. JSON commands exit 1 for remaining
findings; the unchanged plain critical gate exits 0. No ignore/dismissal.
The scheduled staging run 40019055841 still fails its existing SSH key preflight
(`error in libcrypto`); no deploy key/provider configuration was changed.
Sentry root config import deprecation and the older instrumentation warning stay
visible in TODO. Hosted delivery remains an independent exact-SHA gate. Release,
hosting, accounts, tokens, publications and recurring cost remain unapproved.

## 2026-10-21 — P1c Next security update

FACT — Starting Main `4d13fe35f8bf31a8281876195d56dc80b9462861` was clean.
The [documentation build 39666258315](https://github.com/CEOPRENEUR-Labs/postiz-app/actions/runs/39666258315)
passed. Worked on isolated `codex/sge-next-security`; unrelated Labs work remains
untouched. A fresh read-only investigator and parent traced config, actual image
callers, all copies/peers, the six advisory prerequisites and affected behavior.

Official npm 16.3.8 tarball SHA-512 matched registry metadata. Frozen installation
with hooks disabled updates only Next/env/eight SWC package versions; installed
Next/env/platform SWC all resolve 16.3.8. React and app configuration are unchanged.
The source/build contain no remote image allowlist or affected cache/metadata
routes, so no active app SSRF or cache exploit is inferred from package matches.

The actual Next image-fetch function with simulated transport changes from a
second, private DNS result before patch to one checked public set after patch.
No DNS/socket or real target was contacted by that probe. Twenty-nine additional
cases cover aliases/families, private/mixed answers, redirect revalidation,
protected/permissive pool separation, compression/decoded caps and error behavior.
All 127 tests, narrow types/lint, ordinary offline Prisma generation and complete
frontend/backend/orchestrator build pass; build 292.60 seconds, exit 0.
Overloaded DNS test fixtures were corrected explicitly without any/ts-ignore or
turning off type checks. No owning application source needed a compatibility fix.

The built standalone server served login and optimized a real local PNG (200),
rejected unconfigured remote/private/protocol-relative URLs and invalid width
(400). The local Webpack dev server rejected foreign-origin MCP initialization
(403) and accepted same-origin initialization (200), with no MCP tool invocation.
Servers stopped; no source-generation diff remained. Sanitized Node22.22.3/pnpm
10.6.1 processes denied user-home access; build/types/lint/Prisma and simulated
probe denied network, HTTP smoke/tests allowed loopback only. This has no Labs
Netlify/deployed env/model/flag parity and is not production acceptance.

Fresh production JSON audit: 0 critical/135 high/201 moderate/35 low;
full JSON audit: 0 critical/140 high/202 moderate/35 low. Both exit 1 for
remaining findings; exact plain critical CI gate exits 0. Six Next records
(1 high,4 moderate,1 low) disappear. Newly reported moderate Vitest-Mocker remains
without a package change. No ignore or dismissal.

Fresh read-only reviewer: no actionable surviving bypass/regression, 8.7/10.
It inspected source/configuration, graph and eight installed critical-source
integrity matches; it executed no dependency code/tests. The parent owns runtime
checks. HTTPS/pool simulations do not prove native socket reuse or TLS/SNI.
Other cache/metadata modes without app prerequisites were not dynamically tested.
Container/native and actual production acceptance remain open, including the
existing Dockerfile.dev Node22.20 vs root>=22.22.3 discrepancy. Exact-SHA hosted
results are retained separately at delivery; local checks do not replace them.

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
remain open.

Post-push verification on exact code `11b58cae57d164d4d5a945959a31f5d114341296`:
[Build 39664881420](https://github.com/CEOPRENEUR-Labs/postiz-app/actions/runs/39664881420)
and [SGE baseline 39664881466](https://github.com/CEOPRENEUR-Labs/postiz-app/actions/runs/39664881466)
both completed successfully. Every baseline step passed, including critical
audit, frozen install, Prisma, types/lint, contract tests and full build.

The authenticated GitHub UI showed the last manifest check nine hours earlier.
Used GitHub's documented More Dependabot options → Refresh Dependabot alerts.
After processing, UI and REST confirm 0 open / 20 fixed critical alerts, no
manual dismissals. SBOM now contains Next 16.3.6, Vitest 4.1.2, Axios 1.20.0 and
follow-redirects 1.16.1, with no Happy DOM/Tinypool. Retained screenshot, fixed
alert metadata and hosted receipts in the standalone security artifact collection.
Documentation/evidence cross-check: 9.0/10; package review remains 8.5/10.

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
