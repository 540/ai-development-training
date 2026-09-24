#!/usr/bin/env sh
# Publishes screenshots to the orphan branch `pr-assets` (under <feature-branch>/) without touching
# the working tree, and prints one markdown image line per file, ready for the PR body.
# Usage: publish-screenshots.sh <feature-branch> <png> [<png> ...]
set -e

BRANCH="$1"
shift
[ -n "$BRANCH" ] && [ "$#" -gt 0 ] || { echo "usage: $0 <feature-branch> <png>..." >&2; exit 1; }

REPO=$(gh repo view --json nameWithOwner -q .nameWithOwner)
INDEX=$(mktemp)
trap 'rm -f "$INDEX"' EXIT
export GIT_INDEX_FILE="$INDEX"

PARENT=""
if git fetch --quiet origin pr-assets 2>/dev/null; then
  PARENT=$(git rev-parse FETCH_HEAD)
  git read-tree "$PARENT"
else
  git read-tree --empty
fi

LINES=""
for FILE in "$@"; do
  NAME="$BRANCH/$(basename "$FILE")"
  BLOB=$(git hash-object -w "$FILE")
  git update-index --add --cacheinfo "100644,$BLOB,$NAME"
  LINES="$LINES![$(basename "$FILE" .png)](https://github.com/$REPO/blob/pr-assets/$NAME?raw=true)
"
done

TREE=$(git write-tree)
if [ -n "$PARENT" ]; then
  COMMIT=$(git commit-tree "$TREE" -p "$PARENT" -m "Capturas de $BRANCH")
else
  COMMIT=$(git commit-tree "$TREE" -m "Capturas de $BRANCH")
fi
git push --quiet origin "$COMMIT:refs/heads/pr-assets"

printf '%s' "$LINES"
