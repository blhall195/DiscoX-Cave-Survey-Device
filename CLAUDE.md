# discox.co.uk — the DiscoX product website

The public site for the DiscoX cave survey device: what it is, how to build and
use one, how to order, firmware downloads, and news.

## `main` is live

GitHub Pages serves this repo's `main` branch directly, and `CNAME` points
**discox.co.uk** at it. There is no staging environment and no review step of
its own — a push to `main` is a deploy, visible to customers about a minute
later.

**So: branch, then open a pull request.** Never commit to `main`, even for a
typo. Brendan reads the diff and merges. This is a convention rather than an
enforced branch-protection rule, so nothing stops you technically; the point is
that a page edited from a phone gets looked at on something bigger first.

## There is no build step

Plain hand-written HTML. Every page is self-contained: its own `<style>` block
and its own `<script>` at the bottom of `<body>`. There is no framework, no
bundler, no `package.json`, no CSS preprocessor, no templating, and no CI that
renders anything.

**Do not introduce any of those.** The natural instinct on being asked for a new
page is to reach for a static site generator or to factor the repeated CSS into
a shared stylesheet. Both are wrong here. The duplication is deliberate: it
means any page can be opened, read and changed in isolation, with no tooling
installed, which is the whole reason this site is maintainable from a phone.

The two shared files are `logo.png` and `assets/i18n.js`. That is the extent of
it.

## Pages

| File | What it is |
|------|-----------|
| `index.html` | Home. Features, specs, the pitch. The largest page. |
| `order.html` | Ordering and pricing. |
| `build.html` | Build-it-yourself instructions. |
| `firmware.html` | Firmware downloads, flashing guide, changelog. See below. |
| `user-guide.html` | The full user guide, mirrored by `discox-user-guide.pdf`. |
| `calibration-card.html` | Calibration reference, mirrored by `discox-calibration-card.pdf`. |
| `news.html` | The news index. One `<a class="post">` block per article. |
| `news-*.html` | One file per article. |
| `gallery.html` | Photo gallery, images in `gallery/`. |
| `writeup.html` | Long-form technical write-up. |

A PDF next to an HTML page (`discox-user-guide.pdf`, `discox-calibration-card.pdf`)
is a separate artefact that does **not** regenerate from the HTML. Changing the
page does not change the PDF; say so rather than silently leaving them
disagreeing.

## The `data-ver` device switcher

`firmware.html` and `user-guide.html` cover two physically different devices:

- `data-ver="v2"` — the new device, the one with the large orange trigger button
- `data-ver="v1"` — the original, four identical blue buttons, no orange trigger

Buttons with `data-set-ver` toggle which set is shown. **Every element that
applies to only one device must carry the right `data-ver`.** An untagged
element shows under both, which is how a v2-only instruction ends up being read
by someone holding a v1 — the failure is silent and only the customer sees it.

## Assets

Images and files live at the repo root or in a folder next to it:
`assets/` (page images + `i18n.js`), `gallery/` (gallery photos, each as a
`-full` and a `-thumb`), `Parts/` (downloadable STL/DXF/zip for self-builders).

Filenames with spaces are URL-encoded in `src`/`href`
(`assets/3D%20rendered%20view.png`). Keep that; do not rename existing files to
fix it, because the names are linked from elsewhere.

Every `<img>` needs a real `alt`. The existing ones describe what is actually in
the photo, at length — match that, it is not decorative filler.

## Firmware versions live in exactly five places

All in `firmware.html`, all in the `data-ver="v2"` blocks:

1. the download `<a href="mrzappy-<ver>.uf2" download="DiscoX2-<ver>.uf2">`
2. that link's own text, `Download DiscoX2-<ver>.uf2`
3. the mono line beneath it: `v<ver> · released <date> · sha256 <short>`
4. the `<div class="dropzone__file" data-ver="v2">` filename
5. a new `<h3 data-ver="v2">v<ver> — <date></h3>` at the top of the changelog

**Normally you do not touch these by hand.** Tagging a release in
[DiscoX-V2](https://github.com/blhall195/DiscoX-V2) opens a pull request here
that does all five, drops in the new `.uf2` and writes the changelog from the
GitHub release notes. Only edit them manually if that automation failed — the
`publish-firmware` skill has the procedure.

The `.uf2` binaries are vendored at the repo root. The automation keeps the
newest two and deletes older ones, so the repo does not grow an 835 KB binary
per release for ever. (Deleting from the working tree does not shrink git
history; this only stops it getting worse.)

## Voice

Plain, specific, first person, no marketing language. The site explains what
something does and what it costs you, including the drawbacks — see the laser
module and PCB sections of `news-upgrading-the-design.html`, which is the model
to write against.

Things the existing copy does not do: exclamation marks, "revolutionary",
"game-changing", "seamless", feature lists without a reason attached, or claims
about performance that no number backs up.

British spelling.

## Skills

- `new-article` — adding a news post. It is a two-file change and half-doing it
  publishes an article nothing links to.
- `publish-firmware` — the manual fallback for a firmware release, for when the
  automated pull request from DiscoX-V2 did not arrive.

## Related repositories

- [`blhall195/DiscoX-V2`](https://github.com/blhall195/DiscoX-V2) — the device
  firmware. Builds and publishes the `.uf2` this site hands out.
- [`blhall195/Mr_Zappy`](https://github.com/blhall195/Mr_Zappy) — the original
  V1 device, still linked from the v1 sections here.
