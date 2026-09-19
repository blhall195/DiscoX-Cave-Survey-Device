---
name: publish-firmware
description: Manually publish a DiscoX2 firmware release to discox.co.uk - the .uf2 download, version strings and changelog on firmware.html. Use ONLY as the fallback when the automated pull request from the DiscoX-V2 repo did not arrive or was wrong; the normal path is fully automatic.
---

# Publishing firmware to the site by hand

## First: this is the fallback, not the normal path

Tagging a release in [`blhall195/DiscoX-V2`](https://github.com/blhall195/DiscoX-V2)
runs `.github/workflows/build.yml`, which builds the `.uf2`, publishes the
GitHub release, and then runs `tools/publish_to_website.py` to open a pull
request **on this repo** doing everything below automatically.

So before doing any of this, check whether that already happened:

```
gh pr list --repo blhall195/DiscoX-Cave-Survey-Device
gh run list --repo blhall195/DiscoX-V2 --limit 5
```

If a `Publish <tag> firmware` PR is open, review and merge that instead. If the
workflow run failed, the interesting question is why — a failure is usually the
`WEBSITE_PR_TOKEN` secret having expired, which is worth fixing rather than
working around every release.

Only carry on here if the automation is genuinely unavailable.

## What to change

Work on a branch, open a PR. `main` is live (see `CLAUDE.md`).

Let `VER` be the version as the tag spells it, e.g. `v2.0.3`, and `DATE` be the
release date as `YYYY-MM-DD`.

### 1. The binary

Download the release asset and put it at the repo root:

```
gh release download <VER> --repo blhall195/DiscoX-V2 \
   --pattern 'mrzappy-*.uf2' --dir .
```

Then delete vendored `.uf2` files older than the newest two, so the repo does
not accumulate an 835 KB binary per release. Leave `firmware.uf2` alone — that
one is the **V1** device's firmware and is linked from the `data-ver="v1"`
block.

### 2. The five strings in `firmware.html`

All five are inside `data-ver="v2"` blocks. Search for the previous version
string to find them; there should be exactly five hits plus any in older
changelog prose (leave those, they are history).

1. the download link's attributes:
   `<a href="mrzappy-<VER>.uf2" download="DiscoX2-<VER>.uf2" class="btn-link btn-link--primary">`
2. that link's visible text: `Download DiscoX2-<VER>.uf2`
3. the mono line under the download row:
   `v<VER> · released <DATE> · sha256 <code>xxxx…xxxx</code>`
4. the flashing animation's filename:
   `<div class="dropzone__file" data-ver="v2">DiscoX2-<VER>.uf2</div>`
5. a new changelog heading, above the current newest one:
   `<h3 data-ver="v2">v<VER> — <DATE></h3>`

**Note the two filenames differ on purpose.** The file in the repo is
`mrzappy-<VER>.uf2`; the browser saves it as `DiscoX2-<VER>.uf2` via the
`download` attribute. Keep both.

The sha256 short form is the **first four and last four** hex characters of the
real file's digest, joined with `…` (U+2026, not three dots):

```
sha256sum mrzappy-<VER>.uf2
```

Compute it from the file you actually committed. Do not copy it from anywhere
else — the only thing this line is for is letting someone check the download
they got is the one you shipped.

### 3. The changelog entry

Under the new `<h3>`, a `<ul data-ver="v2">` of `<li>` items.

**Source the prose from the GitHub release body**, not from commit messages:

```
gh release view <VER> --repo blhall195/DiscoX-V2 --json body -q .body
```

Convert its top-level `-` bullets to `<li>`. The release notes are written to be
customer-facing; raw commit titles are not, and must not end up on the site.

If the release body is empty or is GitHub's auto-generated commit list, stop and
say so rather than paraphrasing commits into customer copy — the fix is to edit
the release notes upstream, which also fixes the automation for next time.

Write to the standard already set by the existing entries: say what was wrong,
what it meant for the user in the field, and whether they need to do anything
(re-calibrate, re-flash). See the v2.0.2 entry.

## Check before opening the PR

- `sha256sum` of the committed file matches the short digest on the page
- the `href` filename exists in the repo
- exactly five current-version strings, all inside `data-ver="v2"`
- older changelog entries untouched
- `firmware.uf2` and the v1 blocks untouched
