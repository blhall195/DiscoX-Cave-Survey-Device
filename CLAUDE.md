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

Every page also ends with the same Cloudflare Web Analytics `<script>` just
before `</body>`: cookie-free visit counts, so no consent banner is needed. It
is the one external script on the site. A new page must carry it, with the same
token, or its visits silently go uncounted. The dashboard is in Cloudflare under
Analytics & Logs → Web Analytics.

## Pages

| File | What it is |
|------|-----------|
| `index.html` | Home. Features, specs, the pitch. The largest page. |
| `order.html` | Ordering and pricing. |
| `order-status.html` | A customer's order progress, looked up by `?ref=` from discox-api. |
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

## The order form posts to discox-api

`order.html`'s form posts to the
[`discox-api`](https://github.com/blhall195/discox-api) Cloudflare Worker, which
stores the order for Brendan's CRM to import and redirects to `/submitted/`.
The homepage contact form still uses Formspree.

`/submitted/` shows the order ref when it arrives with `?ref=` (an order),
and its second button becomes **View order status** (it is "Read the user
guide" for the contact form, which arrives with no ref). The status page,
`order-status.html?ref=…`, `fetch()`es `GET /status/<ref>` from
the Worker. The Worker returns only a first name, the order date, three
statuses and, once shipped, DHL's tracking scans (time, wording, depot town)
-- never an address or contact detail -- and allows only
`https://discox.co.uk` to read it (CORS), so the page cannot be previewed from a
local file against the live Worker. Statuses come from Brendan's CRM, which
pushes them within seconds of an order being saved there; tracking is
refreshed hourly from DHL. The page inserts everything as text, never HTML.
**Scan times are the local clock time where DHL scanned the parcel, with no
zone, and are shown exactly as given** -- `stamp()`/`day()` format them
without a `Date` conversion, which would shift them into the reader's time
zone. The Delivered step ticks itself when DHL says delivered, even before the
CRM's device status is set to Received. **A DHL label is not a dispatch**
(Brendan, 2026-11-03): while a parcel has tracking but no scans, the step reads
**Preparing shipment** and the Tracking card stays hidden; DHL's first scan
makes it **Shipped** and shows the card. That is decided from the scans, not
from the CRM's Sent flag. With no DHL parcel, the device status decides as
before, and Received / Returned set by hand always win.

The form's `name` attributes are what the Worker reads (`FIELDS` in its
`src/index.js`). Renaming, adding or removing a field here needs the matching
change there, or that data is silently dropped. **"How many units?"**
(`name="Quantity"`, 1-50, default 1) is read separately by the Worker as a
number and becomes the order's quantity in the CRM. The submit button reads
**Send Order Enquiry**. Deploy order for a new field: the Worker first, then
this site -- the other way round, the field is ignored until the Worker
catches up.

**Paying online (published 2026-11-13; payments switch on at go-live).** With
JavaScript, the form shows **Get price**: it `fetch()`es the Worker's
`POST /quote`, lists the DHL options (service, and outside the UK import
taxes paid now or on delivery) as radio cards built with `textContent`, and
**Pay £X securely** submits the same form to `POST /checkout`
(`formaction`), which redirects to Stripe. Changing country, postcode, city
or quantity clears the price. "Send an enquiry instead" is the old submit to
`/order`. Without JavaScript the page is exactly the old enquiry form. The
page never computes a price -- it only shows the Worker's. `Country` is now a
`<select>` of ISO codes, generated in discox-api by `node
tools/countries.mjs`; regenerate it there rather than editing it here.
`TURNSTILE_SITEKEY` in the page's script is Cloudflare Turnstile's public
site key (blank = no widget, which the Worker accepts only in sandbox mode).
`/submitted/?ref=…&paid=1` is Stripe's return; it says "order placed" but is
not proof of payment -- the Worker learns that from Stripe's webhook.
It was published while the Worker was still in test mode: the Worker then
reports **0 in stock to discox.co.uk** (its test-mode gate), so the page
shows "Out of stock" and offers only enquiries until DHL and Stripe go live.

**Stock, not pre-orders (2026-11-13).** The order page and the homepage
price pill read the live count from the Worker's `GET /stock`. In stock: "In
stock — N", Get price and Pay work, "dispatched within 2 working days". Zero
(or the Worker unreachable, or the Worker still in test mode): "Out of
stock", Get price is hidden and the enquiry button is the main action. The
markup is written as out of stock, so a page whose script fails can never
offer to sell. Brendan sets the count in the CRM; never hard-code stock here.

Anything that needs a secret, storage or a call to another service (payments,
DHL, order status, emails) belongs in `discox-api`, not in a page here. Its
`CLAUDE.md` has the overall plan and the current state, including the DNS move
to Cloudflare.

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
- [`blhall195/discox-api`](https://github.com/blhall195/discox-api) (private) —
  the Cloudflare Worker backend: order intake now, payments, shipping and order
  status later.
