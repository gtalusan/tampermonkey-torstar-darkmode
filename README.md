# Toronto Star Dark Mode

A Tampermonkey/Greasemonkey userscript that converts [www.thestar.com](https://www.thestar.com) — the Toronto Star, branded on-site as "The Star" — to dark mode. The site is "crazy white"; this makes it not.

## Install

1. Install a userscript manager:
   - Chrome/Edge/Brave: [Tampermonkey](https://www.tampermonkey.net/)
   - Firefox: [Tampermonkey](https://addons.mozilla.org/firefox/addon/tampermonkey/) or [Greasemonkey](https://addons.mozilla.org/firefox/addon/greasemonkey/)
   - Safari: [Userscripts](https://github.com/quoid/userscripts)
2. Click the Tampermonkey icon → **Create a new script**, delete the template, paste in the contents of [`thestar-dark-mode.user.js`](thestar-dark-mode.user.js), and save. (Or drag the file into the Tampermonkey dashboard.)

The script needs no special permissions (`@grant none`) and applies to `www.thestar.com`/`thestar.com` plus Torstar's sister papers (see below).

## What it does

The Toronto Star's site runs on the TownNews/BLOX platform, which defines its colours as CSS custom properties on `:root` (plus a pile of hard-coded Bootstrap whites). The script:

1. **Overrides the design tokens** (`--site-bg-color`, `--body-text-color`, `--accent-color`, `--nav-bg-color`, …) to a dark palette.
2. **Patches hard-coded components** — Bootstrap panels/dropdowns/forms/modals, homepage cards, the "New from the Star" promo box, `.tnt-has-block-bg` blocks ("More News", "Top Trending", …), related-content boxes, bylines, captions, the offcanvas mobile drawer.
3. **Wins cascade fights** — the site ships high-specificity `!important` white rules for the sticky header (`#site-container #site-navbar-container`, the `.affix` state); every selector in the script is written to beat its twin, and the script keeps its `<style>` element last in `<head>` (via a `MutationObserver`) so ties break in its favour.
4. **Inverts the masthead logo** (black-on-transparent PNG) and paints `<html>` dark immediately at `document-start` to avoid a white flash.
5. **Suppresses ad placeholders** — the "ARTICLE CONTINUES BELOW" video runway and "ADVERTISEMENT" slots render as big white blocks in dark mode, so they're hidden everywhere (mobile and desktop leaderboards alike).

The site's light design tokens are in the first `html.tstar-dark { … }` block — tweak the palette there.

## Sister papers

The same BLOX template runs Torstar's sister papers, and the script already matches all of them (verified live as of Oct 2026):

| Group | Sites |
|---|---|
| The Star | thestar.com |
| Hamilton | thespec.com (also the redirect target for flamboroughreview.com, sachem.ca, hamiltonnews.com) |
| GTA | toronto.com, mississauga.com, bramptonguardian.com, insidehalton.com |
| Durham/York | durhamregion.com, yorkregion.com |
| Niagara | niagarafallsreview.ca, niagarathisweek.com, stcatharinesstandard.ca, thoroldtoday.ca, wellandtribune.ca |
| Waterloo Region | therecord.com, guelphmercury.com, cambridgetimes.ca, newhamburgindependent.ca |
| Simcoe/Muskoka | simcoe.com, muskokaregion.com, parrysound.com, orangeville.com, caledonenterprise.com |
| Northumberland | northumberlandnews.com |
| Peterborough | thepeterboroughexaminer.com (mykawartha.com redirects here) |
| Ottawa Valley | insideottawavalley.com |

To add or remove a site, edit the `@match` lines in the script header. Dead domains (dundasstarnews.com, ancasternews.com, stoneycreeknews.com, burlingtonpost.com) were verified offline and are not matched.

## Development notes

- Everything is gated on the `html.tstar-dark` class that the script adds, so the CSS only applies when the script runs.
- Site stylesheets live on `bloximages.chicago2.vip.townnews.com` — cross-origin, so `document.styleSheets[i].cssRules` throws from a file:// or injected context and cannot be used to find which rule paints an element. The working technique was: disable `<link rel=stylesheet>` elements one at a time in a headless Chrome and watch the element's computed background flip.
- Headless verification pattern used for this project: download a page with curl, inject the script's CSS into `<head>` + a computed-style probe script before `</body>`, then `chrome --headless --dump-dom` and read the probe's `<pre>` output. Both homepage and article pages were audited: zero elements with near-white computed backgrounds among the site's block/card families.
