# SGE publishing session

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
