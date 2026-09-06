#!/bin/bash
# 変更をデプロイする。
# CSS/JS のバージョン文字列を打ち直してブラウザキャッシュを確実に破棄し、
# コミットして push、GitHub Pages のビルド完了まで待って本番を検証する。
#
#   使い方:  ./tools/release.sh "コミットメッセージ"

set -euo pipefail
cd "$(dirname "$0")/.."

MSG="${1:-サイトを更新}"
STAMP=$(date +%Y%m%d-%H%M)
REPO="keganokami/my-harvest"
BASE="https://keganokami.github.io/my-harvest"

# --- 1. バージョン文字列を打ち直す ---
python3 tools/stamp.py "$STAMP"

# --- 2. コミットして push ---
if [ -z "$(git status --porcelain)" ]; then
  echo "変更がありません。"
  exit 0
fi
git add -A
git commit -q -m "$MSG"
git push -q origin main
LOCAL=$(git rev-parse --short HEAD)
echo "  push 完了: $LOCAL"

# --- 3. GitHub Pages のビルドを待つ ---
printf '  デプロイ待ち'
for _ in $(seq 1 24); do
  R=$(gh api "/repos/$REPO/pages/builds/latest" --jq '.status + " " + .commit[0:7]' 2>/dev/null || echo "")
  case "$R" in "built $LOCAL"*) echo " → 完了"; break;; esac
  printf '.'
  sleep 10
done

# --- 4. 本番に反映されたか、ファイルのハッシュを突き合わせて検証 ---
OK=1
for f in index.html js/app.js js/simulator.js assets/style.css; do
  L=$(shasum -a 256 "$f" | cut -c1-16)
  R=$(curl -s "$BASE/$f?cb=$RANDOM" | shasum -a 256 | cut -c1-16)
  if [ "$L" = "$R" ]; then
    echo "  OK  $f"
  else
    echo "  --  $f がまだ古い（数分後に再確認してください）"
    OK=0
  fi
done

if [ "$OK" = "1" ]; then
  echo ""
  echo "  $BASE/ に反映されました（build $STAMP）"
  echo "  スマホで古い画面が出るときは、フッターの build 表示を確認してください。"
fi
