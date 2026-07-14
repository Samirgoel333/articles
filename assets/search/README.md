# Search article assets

| File | Use |
|------|-----|
| `search-article-thumb.svg` | Editable flat vector source (Storyset city style) |
| `search-article-thumb-256.png` | **256×256 thumbnail** for app Learn section & website article cards |
| `00-hero-search.png` | Article hero screenshot (phone frame) |
| `01-tray-search.png` | Stationary tray with **Search** chip highlighted |
| `02-results.png` | Place search screen with results list |
| `03-confirm-mock.png` | **Mock [place]** bottom sheet with Cancel / Mock |
| `04-active-mock.png` | Pulsing pin + player bar after Mock |

Regenerate the thumbnail: `./generate-thumb.sh` (requires Node/npx).

After adding a screenshot, either:
1. Put `<img src="assets/search/01-tray-search.png" alt="...">` inside the figure and add class `has-image` to the figure, or
2. Keep the placeholder frame and swap it for the img when ready.
