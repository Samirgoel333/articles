#!/usr/bin/env bash
# Regenerate search-article-thumb-256.png from the flat vector SVG.
set -euo pipefail
cd "$(dirname "$0")"
npx --yes @resvg/resvg-js-cli --fit-width 256 --fit-height 256 \
  search-article-thumb.svg search-article-thumb-256.png
echo "Wrote search-article-thumb-256.png (256x256)"
