#!/bin/sh
# Re-vendor the SML runner from a local web-sml checkout.
set -e
SRC=${1:-$HOME/browser_sml}
rm -rf static/sml
mkdir -p static/sml
cp -r "$SRC/dist" "$SRC/js" "$SRC/web" "$SRC/examples" static/sml/
rm -f static/sml/dist/camlrunm-node.mjs static/sml/dist/camlrunm-node.wasm \
      static/sml/web/index.html static/sml/web/main.js
echo "vendored from $SRC ($(git -C "$SRC" rev-parse --short HEAD))"
