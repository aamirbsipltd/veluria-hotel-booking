#!/usr/bin/env bash
set -e
echo "Scanning for AI references..."
! grep -ri "claude\|anthropic\|🤖\|co-authored-by:.*claude" \
  --include="*.md" \
  --include="*.ts" \
  --include="*.tsx" \
  --include="*.json" \
  --include="*.yml" \
  --include="*.yaml" \
  . \
  | grep -v node_modules \
  | grep -v ".claude/CLAUDE.md"
echo "Clean ✓"
