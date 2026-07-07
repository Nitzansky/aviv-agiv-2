# Aviv Agiv — אביב עגיב

Elegant, minimal, bilingual (Hebrew / English) one-page site for Aviv Agiv,
strategic communications & crisis-management advisor.

Built as a fast, dependency-free static site — perfect SEO, works everywhere.

## Structure

```
index.html      Hebrew homepage (RTL) — primary / default
en.html         English homepage (LTR)
css/style.css   Full design system (shared)
js/main.js      Scroll reveals, sticky nav, mobile menu (shared)
assets/         favicon + social-share (OG) image
robots.txt      Crawler directives
sitemap.xml     Sitemap with hreflang alternates
```

## Preview locally

```bash
cd aviv-agiv
python3 -m http.server 8080
# open http://localhost:8080
```

## Before going live — replace the placeholders

Search & replace across `index.html`, `en.html`, `sitemap.xml`, `robots.txt`:

1. **Domain** — `https://avivagiv.co.il` → your real domain (used in canonical,
   hreflang, Open Graph, sitemap, structured data).
2. **Email** — `hello@avivagiv.co.il` → real contact email.
3. **WhatsApp number** — the floating mobile launcher links to `https://wa.me/972500000000`.
   Replace `972500000000` (in both `index.html` and `en.html`) with the real
   number in international format, no `+` or spaces (e.g. `972541234567`).
4. **LinkedIn** — the `#` LinkedIn links in the footer → real profile URL.
4. **Podcast** — the Spotify link points to a public "אביב מתעורר" show; confirm
   it's the correct one and update if needed.
5. **Contact form** — currently front-end only (shows a thank-you, sends nothing).
   Wire it to a backend or a service like Formspree / Getform, or replace with a
   `mailto:`. See `js/main.js`.

## Notes

- **Fonts** are loaded from Google Fonts (Fraunces + Frank Ruhl Libre for display,
  Inter + Assistant for body). No other external dependencies.
- **OG image** is an SVG (`assets/og-image.svg`). Some social platforms
  (e.g. X/Twitter, iMessage) don't render SVG previews — for maximum
  compatibility, export it to a 1200×630 `og-image.jpg` and update the two
  `og:image` / `twitter:image` tags.
- Fully responsive, RTL/LTR aware, keyboard-accessible, and respects
  `prefers-reduced-motion`.

## Accessibility (WCAG 2.2 AA)

- Skip-to-content link (visible on focus); `<main>` is a focus target.
- Semantic landmarks (`header`/`nav`/`main`/`footer`), logical heading order,
  and `lang` on the page plus on individual foreign-language snippets.
- All text meets AA contrast (≥4.5:1); UI borders/focus rings meet ≥3:1.
- Visible focus indicators everywhere; menus and the mobile launcher are
  operable by keyboard and close on `Esc` with focus returned to the trigger.
- Accessible contact form: associated labels, required indicators,
  inline error messages (icon + text, not colour alone), `aria-invalid`,
  and an `aria-live` status message on submit.
- Decorative motion/graphics are hidden from assistive tech and paused under
  `prefers-reduced-motion`; the animated stat counters expose a static value.
