# How apify-sdk-js releases work

Releases are managed by GitHub Actions and `apify/actions/git-cliff-release`. There are two
release lines:

| line | branch | stable dist-tag | canary dist-tag |
|---|---|---|---|
| v4 (current development) | `master` | `latest` (from 4.0.0 on) | `next-v4` now, `next` once 4.0.0 is stable |
| v3 (maintenance) | `3.x` | `latest` until 4.0.0 ships, then `latest-v3` | `next-v3` |

Release candidates for the next major are published from `master` under the `rc` dist-tag.
Canary versions always keep the `-beta.N` suffix regardless of the dist-tag they ship under.

## Canary releases

Every push to `master` or `3.x` (not a `docs:` commit) runs the `publish` job in
`test-and-release.yaml`, which dispatches `publish-to-npm.yaml` with the branch's canary
dist-tag. The version comes from the `git-cliff-release` action (`release_type: prerelease`,
registry-derived `-beta.N` counter; on master the `premajor_version` input pins the base to
the next major). No commit or git tag is created for canaries.

## Stable releases

Trigger `release.yaml` manually via `workflow_dispatch` **from the branch you want to
release**:

- `master` + `release_type: auto` (or `custom` `4.0.0`) is how `4.0.0` goes out — git-cliff
  derives the version, commits the changelog, creates the GitHub release, and publishes
  with `tag: latest`.
- `3.x` ships v3 maintenance releases (keeps `latest` until 4.0.0, then `latest-v3`).

On minor/major releases from `master`, the `version_docs` job snapshots the current docs
into `website/versioned_docs`. The job never runs for maintenance branches — it checks out
the default branch.

## RC releases

Dispatch `publish-to-npm.yaml` from `master` with `tag: rc`. This publishes `4.0.0-rc.N`
under the `rc` dist-tag and pushes a `v4.0.0-rc.N` git tag; no commit lands on the branch.

## 4.0.0 release day

See the tracking issue for the ordered checklist (publish 4.0.0 to `latest`, switch master
canaries `next-v4` → `next`, switch 3.x stable releases to `latest-v3`, clean up retired
dist-tags).

## Playbook: switching master to the next major

Adapted from the crawlee v4 transition (see crawlee's RELEASE.md for the original) and the
apify-client v3 transition; single package, git-cliff versioning:

1. **Cut the maintenance branch first.** Branch `(N-1).x` off the master tip. In one commit:
   point `test-and-release.yaml` triggers and the publish gate at the branch (exact
   `github.ref` match), set the canary dist-tag to `next-v(N-1)`, port the current
   git-cliff publish flow if the branch still carries an older mechanism, and delete the
   `version_docs` job from `release.yaml` (it checks out the repo default branch, so it
   would snapshot the wrong docs). Stable releases keep `latest` until the new major ships.
2. **Rebase the `vN` branch onto the master tip** and validate: build, `tsc-check-tests`,
   tests, and every functional master-only commit explicitly (a rerere- or strategy-assisted
   rebase can silently drop them; diff the result against both parents — the tree vs the old
   `vN` tip must equal exactly master's delta).
3. **Prep the `vN` branch for becoming master**: narrow triggers and the publish gate to
   `master`, hardcode the canary dist-tag to `next-vN`, and add RELEASE.md if missing.
4. **Fast-forward push master.** A PR cannot do this (squash-only merges on the default
   branch). The org rulesets accept the `BypassTemporary` team — join it for the push. The
   repo required-checks ruleset ignores existing check runs on direct pushes, so it needs
   `BypassTemporary` added for the moment of the push too (remove right after); update its
   required contexts to the new branch's job names in the same breath.
5. **Retarget open `vN`-based PRs to master** before deleting the `vN` branch — after a
   fast-forward push, deleting the branch would auto-close them.
6. **Check renovate and the docs pipeline**: no `baseBranches` means the maintenance branch
   gets no dependency updates; the docs deploy fires from master only, and the theme
   auto-update workflow keeps committing to master, so coordinate the push window.
7. **Open the release-day tracking issue** with the dist-tag flips — the maintenance branch
   must move off `latest` the same day the new major claims it.
