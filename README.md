# Felix Onfermann — Work, reworked

Two proposals for felixonfermann.com, built on the site's own design: same type, spacing, colours and content, pulled from the live site.

- **Viewer** — [`/`](./) — the selected work centred, every work in one endless strip (along the bottom on the phone, down the right on desktop). Drag, flick, tap or scroll; swiping the picture still walks a series first, then the next work, like the live site.
- **Index (desktop)** — [`/works/`](./works/) — the live index, unchanged except smaller (50% by default) and still flush left, so the hover preview gets the right half of the screen.

The **Tune** tab on the edge switches the options:
- Viewer: Strip (pill / plain / lens, plus fixed on desktop), Nav (CAPS / lower).
- Index: Scale (50% / 65% / the live size), Nav.
- `?ui=0` hides Tune.

Images and videos load from the site's own Sanity CDN. Plain HTML/CSS/JS, no build. To run it locally: `python3 _serve.py` → http://localhost:8030
