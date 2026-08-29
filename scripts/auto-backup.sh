#!/bin/bash
# Auto Backup Script for electricrate-site
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
cd /Users/al.ksenofontova/electricrate-site

if ! git diff-index --quiet HEAD --; then
  git add .
  git commit -m "chore(auto-backup): checkpoint $TIMESTAMP"
fi

git tag "auto-backup-$TIMESTAMP"
git push origin "auto-backup-$TIMESTAMP" 2>/dev/null || true
echo "Backup created: auto-backup-$TIMESTAMP"
