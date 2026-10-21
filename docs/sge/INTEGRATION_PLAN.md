# Postiz as the SGE publishing service

Updated: 2026-10-21. Status: P1 technical baseline accepted locally and on GitHub; release blocked.

This document is the canonical plan for this fork. [ROADMAP](ROADMAP.md)
tracks order, [TODO](TODO.md) tracks open work, [SESSION](SESSION.md) records
evidence, and [CHANGELOG](CHANGELOG.md) records accepted changes.

## Decision and authorization

FACT — The owner accepted AGPL for the Postiz portion and requested an own
fork plus a staged integration plan. The fork is
[CEOPRENEUR-Labs/postiz-app](https://github.com/CEOPRENEUR-Labs/postiz-app),
based on upstream commit `651876e24317c2d8e717262cf98267ec6f699180`.
The original [LICENSE](../../LICENSE), copyright notices, and ancestry remain.

FACT — P0 created the fork and documentation. The owner then requested P1 and
repair of its build/test failures, critical dependency remediation and continued
bounded dependency repair. This does
not authorize hosting purchases,
account connections, credential changes, social publication, deployments,
billing changes, or activation of existing SGE gates. No Labs application code
is copied into this public repository.

DECISION — Operate Postiz separately and integrate through its public HTTP API.
Labs retains SGE content creation and account authority. Postiz handles selected
publication payloads, connected channels, and publication execution. Keep the
initial fork close to upstream. Avoid importing its NestJS/Prisma/Temporal stack
into Labs or replacing SGE's existing storage, access, AI, and credit contracts.

FACT — This removes a requirement to use Postiz Cloud. Social platform access,
dependencies, security maintenance, and our own infrastructure remain external
or operational dependencies. An upstream outage must not prevent local builds
from retained source and verified dependency/container artifacts.

## Evidence and current limits

| Area | Verified source boundary | Still unverified |
| --- | --- | --- |
| SGE | Labs `8a229a2f8826cbc321c415bf1b19234875a614b9`, now included in Main merge `5e1b0d9b13652184e3f3d611cddea66faec7f340`; account profiles and versioned drafts exist | Current deployed account journey and existing SGE closure acceptance |
| Publishing | Upstream public API controller exposes `POST /public/v1/posts`; documented types are `draft`, `schedule`, and `now` | Actual behavior of this fork in our environment |
| Authentication | Public API accepts API keys and documents user OAuth; controller derives organization from authenticated request | Least-privilege scopes, self-hosted OAuth configuration, revocation, and full cross-tenant isolation |
| Runtime | Compose defines persistent services including Postgres, Redis, and Temporal; source includes backend, frontend, and orchestrator | Hosting, cost, resource envelope, recovery, and operational ownership |
| LinkedIn | Personal and Page providers exist; both request organization-related scopes as well as member scopes | Our app approval, granted scopes, refresh behavior, and target-account capabilities |
| Metrics | The Page provider implements analytics; no corresponding personal analytics override was found in the inspected personal provider | Personal-profile measurement coverage; no complete analytics promise |
| License | Repository license is AGPLv3; owner accepts AGPL for the Postiz portion | Combined-work boundary, dependency/asset terms, and deployed corresponding-source completeness |

Source inspection is not a security audit or production acceptance. Online docs
can drift; implementation must verify payloads against the pinned source.
Existing SGE release/credential/restore work remains in the
[Labs product roadmap](https://github.com/CEOPRENEUR-Labs/labs.ceopreneur.com/blob/main/docs/plans/SGE_PRODUCT_ROADMAP_2026-10-07.md).
This extension does not close or expand those earlier acceptance blocks.

## Responsibility and data boundaries

The following is the proposed contract, not an implemented data model.

| Concern | Authority and proposed boundary |
| --- | --- |
| Identity and permissions | Labs authenticates its session and checks the current SGE entitlement/owner on every command. Postiz independently authorizes its organization and channel. A browser key or caller-supplied organization ID grants nothing. |
| Tenant mapping | A server-owned, verified mapping binds the current Labs account or tenant to one permitted Postiz organization and selected channel. Recheck membership and channel ownership before reads, writes, and dispatch. Customer groups alone are not a tenant boundary. |
| Content | Labs owns original profiles, drafts, versions, source provenance, and audit reports. Only an explicitly selected, saved content version and necessary publication metadata leave Labs. No roast inputs, reports, guest emails, credits, or training data are transferred. |
| Publication | Postiz owns its channel connection and execution record. Labs retains the requested version, approval, request correlation, and mapped outcome. Remote IDs/status never replace Labs ownership checks. |
| Approval | The person approves the exact text, target account/channel, attachments, and immediate or scheduled action. A later edit, channel change, or schedule change invalidates the earlier approval. Saving or exporting a draft is not approval to publish. |
| Credentials | Store platform tokens and Postiz credentials only in protected server storage; verify encryption, access, rotation, and revocation. No organization-wide key in the browser, Git, URLs, traces, or user-visible errors. Do not reuse historical mail/AI credentials. |
| Service URL | Use an operator-configured allowed origin and restricted server egress; never accept arbitrary fetch destinations or redirects from users. Media-by-URL stays disabled for the first text-only pilot. |
| UI and content | Keep Labs interaction structure, business logic, localized copy, and styling separate. Reuse its existing account editor and DE/EN/FR conventions. No broad Postiz UI transplant or new styling system. |
| Provider outage | Keep editing/saving/export available in Labs. Report publication as unavailable, failed, or uncertain with evidence. Never show success from an accepted HTTP request alone or silently fall back to Postiz Cloud. |

There is no shared database, shared browser session, or direct cross-repository
model import in the proposed design. This separation helps maintenance; it is
not a legal conclusion about the AGPL scope.

## License and maintenance contract

REQUIRED BEFORE NETWORK RELEASE — Preserve notices and add an accessible source
offer for the exact deployed covered version, including covered modifications
and corresponding build/install material as required by AGPL. A link to an
unrelated upstream revision is insufficient. Validate the actual combined-work
boundary before copying code or implementing close coupling; the owner's AGPL
acceptance for Postiz does not authorize relicensing proprietary Labs code.
Audit third-party packages, media, fonts, and optional commercial features.

Keep `origin` on this fork and `upstream` on `gitroomhq/postiz-app`. Pin and record
the upstream revision for every accepted update; review its diff, dependency and
migration changes, source/license obligations, and regressions before release.
Retain reproducible source/build artifacts and a rollback-compatible backup.
Do not automatically track a mutable `latest` image. Database upgrades require
a tested recovery path; reverting an image is not proof of a safe schema rollback.

Upstream's contribution policy declines primarily AI-generated PRs. This plan
does not submit an upstream PR or promise upstream acceptance. Changes remain
in this fork unless a separate contribution is appropriate and authorized.

## Staged delivery and acceptance

Each stage is a small reviewed package. Update this plan, TODO, SESSION, and
CHANGELOG with the tested revision, evidence, limits, and a scope-specific score.
Repair anything below 8.5/10 and any critical defect before the next stage.
Planning quality is not runtime quality. Register new Labs responsibilities,
write paths, failure behavior, and gates in Labs `SYSTEM.md` with implementation.

### P0 — Fork and record the integration direction

- Preserve upstream history/license, configure upstream remote, and expose this
  plan from the README. Keep source code, dependencies, and workflows unchanged.
- Accept when remote fork metadata, origin/upstream URLs, ancestry, documentation
  links, exact diff, and absence of application changes have been checked.
- Status: fork and documentation accepted at 9.2/10; checks and delivery boundary
  are recorded in SESSION.

### P1 — Establish an executable, maintainable baseline

- ACCEPTED as a technical baseline: [P1 inventory and checks](BASELINE.md).
  Node 22.22.3, frozen offline install, ordinary offline Prisma generation,
  all 58 tests, narrow lint/types and the complete three-app build passed.
  Independent technical review: 9.1/10. GitHub's baseline, full build and CodeQL
  also passed on `00e8463`; [exact hosted evidence](evidence/P1_HOSTED_CI_2026-10-21.json).
- Historical P1 release stop: the initial production audit reported 15 critical
  entries. P1a below remediates that dependency inventory; auth/token, license,
  high-severity dependency and operating gates still block release. Technical
  acceptance does not waive those gates.
- Review pinned architecture, all relevant repo instructions, scripts, workflows,
  lockfile, licenses, auth, token storage, outbound calls, and default features.
- Resolved the Node discrepancy: root engines, Volta and both build workflows
  now use the supported 22.22.3 baseline. The original Node 20 and 22.12 pins were
  incompatible with current dependencies. pnpm remains 10.6.1.
- Inspect install/build hooks before running them. In an isolated environment,
  reproduce the pinned build and relevant upstream tests without production
  secrets, migrations, publication, mail, AI, or payment calls. Record any baseline
  failures rather than silently weakening gates.
- Inventory inherited automation, including scheduled merge/release jobs, before
  enabling workflows or adding secrets. Add fork-appropriate scanning and CI in
  a separately reviewed change. Do not rewrite existing Temporal workflow or
  activity histories; version incompatible workflows as upstream requires.
- Accept with reproducible build/test evidence, dependency/license review,
  identified maintenance owner, and a versioned dependency/container inventory.

### P1a — Remove known critical dependency advisories

FACT — The last P1 documentation build on `065236b` passed on GitHub
([run](https://github.com/CEOPRENEUR-Labs/postiz-app/actions/runs/39583938450)).
The owner then authorized fixing the critical dependency findings. Fresh GitHub
metadata identified 20 alert instances across 11 package families; duplicate
manifest/lock alerts are not separate exploitable application paths.

The accepted local change updates only dependency resolution, the test runner configuration,
focused regression tests and the fork CI gate. It does not change application,
authentication, database or Temporal workflow code.

| Package boundary | Accepted resolution |
| --- | --- |
| Next | 16.3.1 → 16.3.6, direct pin and existing override together |
| Vitest/UI/coverage | Aligned at 4.1.2; native pool removes Tinypool; Node types align with Node 22 |
| Pigment/Happy DOM | Remove unused Pigment and its old transform graph; explicitly omit Vitest's unused optional Happy DOM peer |
| Legacy request multipart | Scoped `request>form-data` 2.5.5; preserve other form-data major versions |
| Protobuf | 7.5.5 for all existing 7.x consumers, including Temporal |
| Native installer Tar | Scoped to node-pre-gyp 1.0.11: Tar 7.5.22; bcrypt and canvas versions remain unchanged |
| Other targeted patches | proxy-addr 2.0.8, Handlebars 4.7.10, Piscina 4.9.4, shell-quote 1.12.0 |

The first shell-quote candidate, 1.8.4, was rejected by the repeat audit: it fixed
one advisory but introduced exposure to a newer critical comment/token advisory.
1.12.0 addresses both. No advisory was dismissed and no audit ignore was added.

Verified locally: 82 tests (24 added security/compatibility cases), baseline
lint/types and the complete three-app build passed (429.03 seconds). The local
HTTP smoke returned 200 for `/auth/login` and 400 for invalid image parameters;
only loopback traffic was allowed and the test server was stopped afterward.
Independent patch review: 9.0/10, no concrete remaining bypass/regression.
Both CLI audits contain zero critical findings. The production JSON audit
still reports 145 high, 207 moderate and 35 low entries; the all-dependency JSON
report has 150 high, 208 moderate and 35 low. JSON mode exits 1 for these remaining
findings. The exact CI command, `pnpm audit --audit-level critical`, separately
passed with exit 0. It runs before installation and includes development packages;
registry errors are not ignored. Independent npm bulk matching across all 3,899
locked versions also found zero critical advisories; its 329 advisory records use
a different count/scope and must not be added to the CLI totals.

Six bounded package-level reproductions fail the intended security control on
the original packages and pass after the patch: shell operators, proxy subnets,
AST validation, multipart randomness, protobuf names and archive decompression.
The new tests also preserve normal quoting/templates/multipart/protobuf payloads,
Temporal's shipped schema and the installer's callback/stream/promise Tar APIs.
This is dependency/component evidence, not proof of a live Postiz exploit or a
production acceptance. No real provider, account, mail, AI or publication is used.

BLOCKED — Release remains closed pending the high-severity inventory's reachability
and remediation, license/source-offer, token/role/tenant protection, container/native
installation and operating/recovery acceptance. Existing custom forwarded-header
handling also needs a separate trusted-proxy review: updating proxy-addr does not
change that application code. Native bcrypt loading and Temporal history replay
are not proven by archive/codec tests.

### P1b — Repair the shared HTTP dependency boundary

FACT — Axios 1.20.0 and its resolved follow-redirects 1.16.1 replace the only
installed/locked copies of 1.19.0 and 1.16.0. The direct Axios floor and bounded
1.x override cover its SDK consumers; the scoped redirect pin is necessary
because Axios itself still permits 1.16.0. All existing consumer ranges admit
the selected versions. No application, provider or Temporal implementation changes.

Four isolated before/after probes reproduce then close array-header credential
leakage, custom sensitive-header escaping, Fetch `maxRedirects: 0` bypass and the
inherited multipart visitor gadget. Sixteen added tests also preserve same-origin
authorization, streams/arraybuffers, streamed multipart, explicit visitors, custom
HTTP-agent DNS lookup, cancellation and provider error data. All 98 tests,
baseline types/lint and ordinary offline Prisma generation pass. The full
frontend/backend/orchestrator build passed in 167.52 seconds. Independent fresh
read-only review found no actionable bypass/regression: 8.5/10, accepted within
this package scope. Optional HTTP2 session/control failures, CIDR/proxy ReDoS
and other prototype gadgets were inspected through source/version coverage,
not individually reproduced. This is a documented validation limit, not proof
of complete HTTP security.

Fresh pnpm production audit: 0 critical, 136 high, 204 moderate, 36 low;
all dependencies: 0 critical, 141 high, 205 moderate, 36 low. The 14 selected
advisory records (9 high, 5 moderate) disappear. Three newly reported Vite records
(2 moderate, 1 low) remain open; no Vite version was changed. JSON audits return
1 for remaining findings; the unchanged plain critical CI command returns 0.
Only the two target package versions change; pnpm also deduplicates three edges
to already-locked form-data/hasown versions. No advisory ignore or dismissal.

These are package/component checks: optional Fetch/HTTP2 modes, prior prototype
pollution and deployed proxy settings have differing prerequisites. No active
application exploit is inferred from a version match. Existing plain-Axios media
conversion in `posts.service.ts` remains a separate SSRF review item. This update
does not establish safe egress, token/tenant isolation or production acceptance.

FACT — On the starting Main `fec83dd`, the Build and SGE baseline workflows both
passed. At that checkpoint GitHub still listed 20 critical alerts with stale graph data;
closure was not confirmed at that checkpoint. A documented UI refresh after
P1b push rebuilt the graph: REST and UI now confirm 0 open / 20 fixed critical
alerts, none dismissed. SBOM now resolves Next 16.3.6, Vitest 4.1.2, Axios 1.20.0
and follow-redirects 1.16.1, without Happy DOM or Tinypool. The inherited
scheduled staging resolver fails its SSH preflight without a usable deploy key (run 39662155808), independently of builds.
Do not provision production secrets to make that inherited job pass.

### P2 — Define and prove isolated service operation

- Propose hosting, region, estimated monthly cost, resource limits, data retention,
  recovery objectives, and operator ownership. Obtain the required concrete
  deployment/cost approval before provisioning or exposing a service.
- Prepare a disposable local or approved staging environment with separate DB,
  queue/workflow state, media storage, and credentials. Start with synthetic data
  and provider publication blocked. Restrict registration and administrative access.
- Identify and disable unneeded AI, payment, mail, telemetry, and optional external
  integrations. Verify actual outbound traffic; configuration names are not proof.
- Rehearse restart, backup/restore, token revocation, data deletion, and a rollback
  with pending work. Document a stop procedure that also halts queued execution.
- Accept with an exact source/image/config inventory, operational runbook,
  working source offer, and no unexpected outbound side effects.

### P3 — Specify and test the Labs-to-Postiz contract offline

- Inspect current Labs ownership, draft versioning, and entitlement paths before
  naming new endpoints, environment keys, tables, or fields. Decide credential
  strategy and verify organization-scoped authorization with two synthetic tenants.
- Implement the smallest server-side adapter using the existing public HTTP API.
  Start with a text-only `draft` allowlist. No browser-supplied API credentials,
  organization/channel overrides, `now`, `schedule`, or media uploads.
- Define a bounded persisted handoff record for an immutable selected draft
  version, target, approval level, correlation, remote ID, and observed outcome.
  These are proposed concepts, not claims about existing schema fields.
- Prove duplicate-click/concurrent-request handling and response-loss recovery.
  Do not assume Postiz or LinkedIn provides a general idempotency key. If a write
  might have succeeded, reconcile first; do not blindly submit again.
- Accept contract tests for foreign IDs, revoked/stale sessions and channels,
  changed draft versions, malformed/oversized input, timeouts, and secret-free
  logs. Verify draft creation cannot schedule or publish through another route.

### P4 — Complete one real draft handoff without publication

- Resolve actual LinkedIn developer-app products/scopes for one expressly
  permitted own account or Page; choose only a supported approved target. If
  approval is unavailable, report a blocker rather than substituting scraping.
- Connect that channel only with the necessary account/credential authorization.
  Send one confirmed saved SGE version as `type: draft` in approved staging.
- Show the destination identity, copied snapshot, remote draft reference, and
  visible outcome. Check exact text, line breaks, Unicode, reopen, and isolation.
  Subsequent Labs edits must not silently overwrite the remote draft or publish it.
- Enforce draft-only restrictions server-side across the adapter, native Postiz
  UI/API/agent surfaces, and worker paths used in the pilot; no hidden promotion
  to publication. If this cannot be enforced, keep provider execution blocked.
- Accept with evidence of exactly one remote draft, no scheduled job or platform
  post, own/foreign-account checks, and recovery after an uncertain response.

### P5 — Permit one explicitly approved publication

- After P4, obtain approval for one exact post, target, and execution environment.
  Confirm the final immutable content/target again at dispatch; do not infer this
  approval from a prior draft transfer or a general development instruction.
- Recheck current entitlement, membership, channel status, provider permissions,
  and approval validity. Provide a stop control and define its actual reach:
  disabling Labs alone does not cancel jobs already queued in Postiz.
- Record provider-confirmed success and the external post reference/URL when
  available. Distinguish accepted, queued, published, failed, and uncertain.
  An uncertain outcome blocks automatic retries until reconciliation.
- Accept one actual visible publication plus revoke/timeout/rate-limit tests,
  duplicate prevention, operator recovery, and an explicit audit trail. Do not
  claim exactly-once delivery where the platform cannot guarantee it.

### P6 — Add scheduling after immediate publication is proven

- Confirm local timezone and UTC instant, DST gaps/ambiguities, past times, and
  clock skew. Bind approval to that schedule and selected content version.
- Verify reschedule/cancel, dispatch races, token expiry, retries, worker outage,
  restart, revoke-after-enqueue, and the stop procedure with already queued work.
- Reconcile cancellation with dispatch; never claim a dispatched external post
  was withdrawn merely because the local request was canceled. External deletion
  is a separate explicit operation with its own result.
- Accept limited scheduled pilot evidence, bounded reconciliation and retention,
  restore without re-publishing completed jobs, and a documented rollback.

### P7 — Expand only on measured demand

- Consider media, additional channels, agency roles, approval workflows, and
  metrics separately after P6. Establish each provider's actual capabilities.
- Analytics must identify source, account type, time window, and missing data;
  unavailable values are not zero, and publication does not prove growth or sales.
- Before wider release, verify tenant isolation and revocation behavior.
  Validate proposed billing and quotas, data export and deletion, retention,
  support and provider outage operation, accessible localized UI, and compliance
  of the exact deployed covered source.
- Accept only the individually proven capabilities; no automatic discovery,
  outreach, profile scraping, or replacement of SGE's audit product is included.

## Current next gate

P1b is accepted at 8.5/10: 98 tests, types/lint and full build locally; both
[SGE baseline](https://github.com/CEOPRENEUR-Labs/postiz-app/actions/runs/39664881466)
and [Build](https://github.com/CEOPRENEUR-Labs/postiz-app/actions/runs/39664881420)
passed on exact code revision `11b58cae57d164d4d5a945959a31f5d114341296`.
GitHub graph refresh confirms all 20 historical critical alerts fixed.
Continue bounded high-severity triage (136 production
entries), starting with Next's remaining image-optimization advisory and the
selected artifact's egress paths. Keep license, token, role, trusted-proxy,
container and recovery gates in P2. The inherited staging automation and unverified
history secret-scan state need separate fork-specific follow-up.
No production or account connection is authorized here.

## References

- [Pinned API controller](https://github.com/gitroomhq/postiz-app/blob/651876e24317c2d8e717262cf98267ec6f699180/apps/backend/src/public-api/routes/v1/public.integrations.controller.ts)
- [Pinned LinkedIn provider](https://github.com/gitroomhq/postiz-app/blob/651876e24317c2d8e717262cf98267ec6f699180/libraries/nestjs-libraries/src/integrations/social/linkedin.provider.ts)
- [Pinned LinkedIn Page provider](https://github.com/gitroomhq/postiz-app/blob/651876e24317c2d8e717262cf98267ec6f699180/libraries/nestjs-libraries/src/integrations/social/linkedin.page.provider.ts)
- [Pinned compose](https://github.com/gitroomhq/postiz-app/blob/651876e24317c2d8e717262cf98267ec6f699180/docker-compose.yaml)
- [Public API authentication](https://docs.postiz.com/public-api/introduction)
- [Post creation and draft mode](https://docs.postiz.com/public-api/posts/create)
- [LinkedIn self-hosting requirements](https://docs.postiz.com/self-host/providers/linkedin)
- [AGPL text](../../LICENSE), especially section 13; preserve corresponding source
  for the actual deployed covered version.
