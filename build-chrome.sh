#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
DIST_DIR="$ROOT_DIR/dist/chrome"
ARTIFACT="$ROOT_DIR/dist/chrome.zip"

rm -rf "$DIST_DIR"
mkdir -p "$DIST_DIR"

rsync -av \
  --exclude 'server/' \
  --exclude 'web-ext-artifacts/' \
  --exclude 'dist/' \
  --exclude '.git/' \
  --exclude '*.env' \
  --exclude 'output.xpi' \
  --exclude 'output.zip' \
  --exclude '*.bash' \
  --exclude '*.sh' \
  --exclude 'manifest.firefox.json' \
  "$ROOT_DIR/" "$DIST_DIR/"

# Ensure the Chrome manifest is used
cp "$ROOT_DIR/manifest.json" "$DIST_DIR/manifest.json"

rm -f "$ARTIFACT"
(cd "$DIST_DIR" && zip -r "$ARTIFACT" . >/dev/null)
echo "Chrome package created at $ARTIFACT"
