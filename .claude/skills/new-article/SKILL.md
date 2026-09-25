---
name: new-article
description: Add a news post to discox.co.uk. Use when asked to write, publish or draft a news article, blog post, update or announcement for the DiscoX site. Covers both halves of the change - the article page itself and the entry on the news index - because doing only one publishes an article nothing links to, or a link that 404s.
---

# Adding a news post

A post is **two files**, and the whole reason this is a skill is that it is easy
to do one and forget the other:

1. a new `news-<kebab-title>.html` at the repo root — the article itself
2. an entry at the **top** of the list in `news.html` — how anyone finds it

Do both in the same branch and the same pull request. Never commit to `main`
(see `CLAUDE.md` — `main` is live).

## 1. The article page

Copy an existing article and rewrite its content. Do **not** hand-write a page
from scratch: each article carries ~100 lines of inline CSS that must match the
rest of the site, and there is no shared stylesheet to inherit it from.

```
cp news-upgrading-the-design.html news-<kebab-title>.html
```

`news-upgrading-the-design.html` is the better template — it has the figure and
multi-section markup. `news-discox-introduction.html` is a plainer prose piece.

Then change, and only these:

- `<title>` → `<Article title> — DiscoX News`
- the `<p class="mono-label">` → `<Tag> · <D Month YYYY>`, e.g.
  `Update · 24 August 2026` (long month here, unlike the index)
- `<h1>` → the article title
- `<p class="article__dek">` → one or two sentences summarising the piece
- everything between the dek and `<h2>What's next</h2>` → the article body

Leave the `<head>`, the `<style>` block, the nav, the footer and the closing
scripts exactly as they are. The nav's `<a href="news.html" class="active">` is
already correct for a news page.

### Body markup available

```html
<p>…</p>
<h2>A section heading</h2>

<div class="improve">
  <h3>A sub-point with its own heading</h3>
  <p>…</p>
</div>

<figure class="figure">
  <img src="assets/your-photo.jpg" alt="A real description of what is in the photo">
  <figcaption>Optional caption.</figcaption>
</figure>
```

Put new images in `assets/`. URL-encode spaces in the `src`
(`assets/My%20Photo.jpg`). Write a genuine `alt` — the existing ones describe
the contents of the picture in detail, and that is the standard here.

If you have no image, leave the figure out. Do not invent a filename for a photo
that does not exist in the repo; that ships a broken image to customers.

## 2. The index entry

In `news.html`, paste a block at the **top** of the list inside
`<section class="posts"><div class="container">`, above the current newest post.
Newest first, always.

```html
      <a href="news-<kebab-title>.html" class="post" style="text-decoration:none;">
        <div class="post__meta">
          24 Aug 2026
          <span class="post__tag">● Update</span>
        </div>
        <div>
          <h2 class="post__title">Article title</h2>
          <p class="post__excerpt">One or two sentences. This is the only thing most people read — make it say what actually happened, not that something happened.</p>
          <span class="post__more">Read the article
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
          </span>
        </div>
      </a>
```

Note the **two date formats differ and both are correct**: the index uses the
short form (`24 Aug 2026`), the article page uses the long form
(`24 August 2026`). Do not "fix" one to match the other.

The tag is `● Update` unless there is a reason for something else; keep the
bullet character.

Leave the `═══ TO ADD A NEW POST ═══` HTML comment in place. It is there for
whoever edits the file by hand.

## 3. Check before opening the PR

- `news-<kebab-title>.html` exists and its filename matches the `href` in
  `news.html` exactly, character for character
- the new block is above the previous newest post, not below it
- every `<img src>` you added resolves to a file that exists in the repo
- the title, date and excerpt agree between the two files
- nothing outside the article body and the index block changed — in particular
  the `<style>` block should be byte-identical to the template's
- the Cloudflare Web Analytics `<script>` is still just before `</body>`, with
  the same token as every other page — without it the article's visits are not
  counted, and nothing else tells you

## Writing

`CLAUDE.md` has the house voice. In short: plain, specific, first person,
British spelling, and say the drawbacks as well as the wins. If you are drafting
from a short instruction, write it, then say plainly which details you invented
or guessed so Brendan can correct them in the PR rather than after it is live.
