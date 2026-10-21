# P1: Postiz fork baseline

Updated: 2026-10-21. Scope: source inventory and isolated build/test acceptance.
This is not a deployment, complete security audit, or provider acceptance.

## Pinned source and maintenance

FACT — Upstream basis is `651876e24317c2d8e717262cf98267ec6f699180`.
The fork's prior planning checkpoint is `2b624a9a84252474dded93fbadbfe4c7857183e6`.
No upstream update, application/database migration, dependency version change,
account connection, or publication is included in P1.

DECISION — CEOPRENEUR-Labs maintains this fork and reviews upstream updates;
the owner retains release, account, commercial-license, and cost authority.
An operational hosting/on-call owner and service objectives remain a P2 decision.
Keep changes small, record the upstream base and exact deployed covered source,
and test updates before release. The fork does not depend on Postiz Cloud.

FACT — Node is now consistently pinned to 22.22.3 in Volta and the fork baseline
workflow; root engines require that version within major 22. pnpm remains 10.6.1.
The original Node 20 Volta entry conflicted with root engines; the upstream
build workflow's Node 22.12 also falls below the installed sanitizer's requirement
(`^22.13.0` on the Node 22 branch). All 272 direct package engine declarations
accept 22.22.3. The inherited GitHub build matrix is aligned to that version as
well; no Temporal workflow or activity was changed. No dependency versions
or lockfile entries changed.

## Architecture and dependency inventory

| Area | Current source |
| --- | --- |
| Frontend | Next.js 16.3.1, React 19.2.4; `apps/frontend/package.json` is authoritative, despite older Vite/Nx wording in inherited instructions |
| Backend | NestJS; controllers call services/repositories under `libraries/nestjs-libraries` |
| Jobs | NestJS orchestrator and versioned Temporal workflows/activities; no rewrite of existing workflow history |
| Persistence | Prisma 6.5.0 with Postgres; Redis and Temporal state are separate runtime dependencies |
| Other workspaces | Commands, browser extension, and SDK; not part of the default three-app build |
| Package graph | 214 production and 58 development dependencies; seven workspace manifests including root |
| Lockfile | v9, 3,955 package records and 3,992 snapshots; SHA-256 `8834026b11cdcbc08c7ac6a8b5a6998f7ca1798d2a58cfb896ad4ca06bca3226` |

The [machine-readable inventory](evidence/P1_INVENTORY_2026-10-21.json) records
all direct requested/resolved versions and license metadata plus both compose
image declarations. The existing committed lockfile is the complete versioned
transitive dependency/integrity inventory; it is not a license clearance.

Production compose has nine services: Postiz, Postgres, Redis, Spotlight,
Elasticsearch, a separate Temporal Postgres, Temporal, Temporal admin tools,
and Temporal UI. Development compose also has nine. All image declarations lack
digests; several use `latest`. No image was pulled or validated in P1.
The `Dockerfile.dev` base is `node:22.20-bookworm-slim`, a different Node patch than
the tested local baseline; container/runtime parity is not claimed.

## Installation, startup, and automation boundaries

- Root `postinstall` invokes `pnpm dlx prisma@6.5.0 generate`. P1 initially
  disables all lifecycle hooks, then invokes the installed pinned Prisma CLI
  explicitly. Generation creates code and obtains build engines; it does not
  start or migrate a database.
- Frontend `postinstall` can read root `.env` and download GTM when configured.
  P1 has no `.env` and does not execute that hook.
- `onlyBuiltDependencies: [bcrypt]` does not suppress workspace lifecycle hooks.
  The P1 procedure uses `--ignore-scripts` explicitly.
- Do not use `pm2`, `dev`, compose startup, or production start scripts for
  baseline checks. `pm2-run` performs `prisma-db-push`; `prisma-reset` contains
  `--force-reset`. Docker startup currently reaches the same DB-push path.
- Inherited Docker scripts request stages absent from `Dockerfile.dev`, and its
  PM2 install is unpinned. Container packaging is a P2 prerequisite, not a
  tested P1 deployment path.
- Inherited scheduled staging-conflict automation can use an agent/deploy key;
  extension/container workflows can publish. Do not enable these jobs or add
  secrets merely to validate this fork. Only the existing GitHub build's Node
  matrix is corrected; its build steps and all other inherited workflows remain.
- The inherited file `.github/workflows/eslint` lacks a YAML extension and is
  not an active GitHub Actions gate. Do not report it as lint evidence.

P1 adds a separate `sge-baseline.yml`, pinned to verified action-tag commit SHAs,
restricted to this fork with read-only repository permission and no provider
secrets. It runs frozen installation without hooks, explicit Prisma generation,
types, baseline lint, real tests, and the default three-app build. No deploy,
workflow-history change, service startup, or publishing step is present.
Local success is not a hosted-CI success; record actual runs separately.

## Reproducible local verification procedure

Use a fresh checkout and task-local tools/cache, with no production `.env` or
inherited provider variables. Review scripts before execution. For P1, official
Node 22.12.0 was initially checked against the Node download SHA-256 manifest;
it was later rejected because of a dependency engine constraint. The final
22.22.3 binary was copied from the existing local toolchain into the isolated
tools directory, with byte/hash equality checked; no official distribution
checksum is claimed for that copy. CI obtains the explicitly pinned version.
pnpm 10.6.1 was obtained through Corepack. The first download-only dependency
fetch resolved Node 26 from the host PATH and executed no hooks. Installation
was then replayed offline with Node 22; final checks use 22.22.3.

1. Install with the pinned toolchain and a dedicated pnpm store:
   `pnpm install --frozen-lockfile --ignore-scripts --store-dir <task-store>`.
2. Obtain Prisma build engines with the installed CLI only:
   `pnpm exec prisma generate --schema libraries/nestjs-libraries/src/database/prisma/schema.prisma`.
   Clear provider variables, disable tool telemetry, and never run DB push/reset.
   P1 used Prisma's normal downloader; no checksum checks were bypassed and no
   `--no-engine`/Accelerate replacement was used. A separate Python HTTP request
   to the engine checksum URL returned 403; the official CLI download succeeded.
3. Block external network and reads/writes to the user directory. P1 used a
   macOS `sandbox-exec` profile with `deny network*` and explicit denial of the
   actual user-home subtree. Tools, checkout, and caches were outside it.
   The child environment retained only PATH, actual HOME, task-local temporary
   and cache paths, locale, CI, and explicit telemetry-disable controls. No
   provider/account/database credentials were inherited.
4. Verify that sandboxing is effective: a user-directory read fails with EPERM
   and an external registry request fails. These probes passed. No service,
   database, queue, workflow worker, mailer, payment client, or provider is started.
5. Replay step 1 with `--offline`; repeat normal Prisma generation offline.
6. Run `pnpm run typecheck:sge-baseline`, `pnpm run lint:sge-baseline`,
   `pnpm test`, and `pnpm run build` inside that same sandbox.

Commands alone do not enforce isolation. A later runner must provide an
equivalent network/filesystem boundary; do not treat this prose as a sandbox.
Hosted CI obtains build dependencies on its runner and is a separate execution
environment. It receives no production configuration from this workflow.

## Build and test repairs

- `pnpm test` now executes the existing Vitest runner and three suites with 58 real
  cases. Upstream had no executable test files; the old Jest config imported
  absent `@nx/jest`. No existing suite was removed, no Nx dependency was added,
  and no `passWithNoTests` or fake coverage success was introduced. The old
  unused Jest config/preset remain as inherited files, not active gates.
- Tests exercise actual OAuth parsing/challenge/discovery helpers and public
  HTTPS destination validation, including private/mapped IPs and mixed DNS
  answers. DNS is mocked completely; no actual provider/HTTP request is made.
  A third suite exercises real server sanitization, Unicode/entities, unsafe
  markup removal, block boundaries, and editor mention metadata.
- Added an explicit narrow TypeScript gate for those tests and their imports.
  Backend/orchestrator compilation separately checks their existing sources.
- ESLint now consumes the installed Next flat configurations directly. The
  previous FlatCompat wrapper failed before linting with a circular-config
  exception. Existing rule exceptions are retained without weakening them;
  Next's root is configured for the actual monorepo frontend.
- Frontend build scripts explicitly select Webpack, matching the existing custom
  Webpack configuration. The isolated default Turbopack run made no progress
  and was stopped after 315 seconds; its behavior outside this sandbox is unknown.
- A Webpack run hit Node's approximately 4-GiB heap limit. Frontend build scripts
  now set a bounded 8-GiB heap and enable the pinned Next version's documented
  `webpackMemoryOptimizations`. This is a build-resource change; adequate RAM
  remains an explicit runner prerequisite. No typecheck/validation was disabled.
- The first completed frontend compilation then failed during page collection:
  bundling `isomorphic-dompurify` relocated jsdom's filesystem-relative CSS asset.
  `serverExternalPackages` now keeps that package in native Node resolution;
  the sanitizer itself is unchanged. It is neither removed nor made client-only.

## Credential, authorization, and external-call inventory

This is a bounded reading of relevant paths, not a full security finding set.
Before P2/P3 accepts real tokens or more than one tenant:

| Source boundary | Required next proof |
| --- | --- |
| Public API accepts an org API key or `pos_` OAuth token; organization comes from middleware; privileged org-key override exists | Use an independently checked account/tenant mapping, reject caller overrides, prove foreign-org/channel/post and role/revocation failures |
| OAuth authorization is orgbound; broad read/write scopes and nonexpiring tokens exist | Do not assume channel-only/draft-only scopes; prove least privilege and revoke behavior |
| Current credential code uses `JWT_SECRET` for several purposes; social token persistence and backup protection need separate review | Define token-at-rest protection, separate key authority, backup access, rotation and recovery before real credentials |
| Role-policy behavior depends on billing configuration; billing-off is not proof of role isolation | Prove or correct roles independently of billing; do not enable billing as an authorization workaround |
| Registration and optional dynamic OAuth registration have permissive paths | Restrict operator access and registration before exposure; an env flag alone is insufficient evidence |
| Backend startup connects DB/Redis/Temporal and may register workflows/search attributes; nonempty `RUN_CRON` is truthy | Keep it absent for baseline; the string `false` is not a reliable off switch; test startup/stop separately in P2 |
| Email, AI, social platforms, Stripe, Sentry, newsletter and marketing paths exist | Use synthetic data and verify actual egress/logs before access; empty provider keys do not guarantee no attempted request |
| The empty email provider can return content which callers log | No real recipient/content in initial staging; prove log redaction/retention |
| Draft creation can shorten links before the DRAFT workflow exit | First adapter must reject shortlinks, media, unknown actions/fields and other outbound features; draft mode alone is insufficient |

Relevant source: `apps/backend/src/services/auth/public.auth.middleware.ts`,
`services/auth/permissions/permissions.service.ts` under that backend,
`libraries/helpers/src/auth/auth.service.ts`, and the OAuth, integrations,
posts, email, openai, newsletter, Sentry and Temporal modules under
`libraries/nestjs-libraries/src/`. Read the actual paths before implementing;
no Labs schema/API/env names are invented by this inventory.

## License review and source offer

FACT — Root AGPL and original notices are retained. Several app manifests say
ISC while root and SDK say AGPL; this does not authorize treating covered
upstream code as proprietary or ISC. Third-party rights are separate.

Three exact packages were checked from registry metadata and their actual
tarball license files. Their registry integrity matches the committed lock
integrity, and downloaded tarballs match it. Hashes are in the inventory.

| Exact package | License text outcome |
| --- | --- |
| `polotno@3.0.0-beta.25` | Allows local development/noncommercial use under its package text; commercial use requires a separate license. No purchase or commercial clearance exists for this project. |
| `sweetalert2@11.4.8` | MIT, with copyright/license notices to retain |
| `@postiz/wallets@0.0.1` | Apache 2.0; LICENSE present, no NOTICE in this tarball |

Polotno is imported by the media editor and is not made absent by an empty key.
The current vendor terms and the exact older package text differ; do not infer
a current trial entitlement for the pinned package. These findings cover three
packages, not all 3,955 lock records. Installed license metadata is not a legal
review of every package or the shipped container.

Nine font files are tracked. Plus Jakarta Sans includes an OFL notice. Evidence
for the two Chirp, one SFNS, and four Charter font files is missing from tracked
license notices; permission is UNKNOWN, not a confirmed infringement. Logos,
avatars, OS/container packages and optional commercial features also need review.
Elasticsearch 7.17's distribution cannot be assumed Apache 2.0; no image license
clearance is claimed from source/version metadata alone.

P2 must either obtain appropriate rights or prove the first backend/orchestrator
text-only artifact omits those frontend/editor/assets, then review its actual
remaining dependencies. Do not merely hide a UI control and claim removal.
Before any modified covered network release, provide a prominent, free source
offer for the exact release plus required corresponding build/install material,
license/notices and an immutable source reference. Validate the combined-work
boundary before integration; acceptance of Postiz AGPL does not relicense Labs.

Primary references:

- [Exact Polotno package metadata](https://registry.npmjs.org/polotno/3.0.0-beta.25)
- [Exact SweetAlert package metadata](https://registry.npmjs.org/sweetalert2/11.4.8)
- [Exact wallet package metadata](https://registry.npmjs.org/@postiz/wallets/0.0.1)
- [Current Polotno terms](https://polotno.com/legal/license)
- [Elastic license FAQ](https://www.elastic.co/pricing/faq/licensing)
- [Original AGPL](../../LICENSE), section 13

## Acceptance record

P1 is accepted as a technical baseline/inventory at 9.1/10. Pinned offline
installation, ordinary offline Prisma generation, all 58 cases, baseline lint/types
and the complete frontend/backend/orchestrator build pass on Node 22.22.3.
The full build includes frontend TypeScript, page generation and traces; exit 0,
384.25 seconds. [Exact scope and file hashes](evidence/P1_VERIFICATION_2026-10-21.json).
Separately verified on GitHub: the baseline workflow (58 tests, types/lint,
Prisma and full build), inherited full build and CodeQL all passed on
`00e8463a0ce07707a9765074899e95f2bddab433`.
[Run URLs, exact revision and step outcomes](evidence/P1_HOSTED_CI_2026-10-21.json).
This is Linux build/contract evidence, not deployed or operational acceptance.

The [local Gitleaks scan](evidence/P1_SECRET_SCAN_2026-10-21.json) checks tracked/current
new files with default rules, 100% redaction and inline allow-comments disabled.
Its 24 raw findings are 23 localization checksums and one verified source-file
SHA-256. The source hash was compared to the actual file; no credential remains
unresolved in this scan. No broad ignore or scanner suppression is added.
Full Git history is outside this local scan's scope.

Both dependency audits completed. [pnpm production audit](evidence/P1_PRODUCTION_AUDIT_2026-10-21.json)
returns exit 1 and reports 15 critical/163 high entries. [Bulk registry evidence](evidence/P1_DEPENDENCY_ADVISORIES_2026-10-21.json)
covers all 3,955 lock versions, including development/optional packages; it returns
375 matching advisories, including 16 critical. Different counting/scope must not
be combined into a single vulnerability total. Neither scan proves reachability.
The initial CLI audit on the installed tree ran out of memory; replaying against
an exact lock/manifest-only copy succeeded and the independent bulk check agrees
that security triage is required.

GitHub secret scanning, push protection and vulnerability alerts were enabled
and read back. Provider validity checks and automatic dependency-update PRs remain
off. Feature enablement does not mean GitHub's initial scans have completed.

BLOCKED — No security or operating release is accepted. Triage/remediate affected
shipped dependencies before network exposure or real credentials, then resolve
the remaining auth/token, license, source-offer, container and operating gates.
Technical P1 acceptance does not waive the plan's stop on critical defects.
