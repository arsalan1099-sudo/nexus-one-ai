#!/usr/bin/env bash
set -euo pipefail
owner='arsalan1099-sudo'
repo='nexus-one-ai'
if ! command -v gh >/dev/null 2>&1; then
  echo 'GitHub CLI (gh) is required: https://cli.github.com/' >&2; exit 1
fi
if ! gh auth status >/dev/null 2>&1; then
  echo 'Run gh auth login locally first (do not share credentials).' >&2; exit 1
fi
if gh repo view "$owner/$repo" >/dev/null 2>&1; then
  echo "Repository $owner/$repo already exists; refusing to replace it." >&2; exit 1
fi
if [[ ! -d .git ]] || [[ "$(git branch --show-current)" != main ]]; then
  echo 'Run this from the cloned bundle repository on the main branch.' >&2; exit 1
fi
gh repo create "$owner/$repo" --private --source=. --remote=origin --push
echo "GitHub repository: https://github.com/$owner/$repo"
