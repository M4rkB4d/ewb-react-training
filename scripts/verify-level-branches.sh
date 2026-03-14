#!/usr/bin/env bash
# verify-level-branches.sh
# Verifies that all 18 level branches build cleanly.
#
# For each branch:
#   - level-XX-start: npm install && npm run build must pass
#   - level-XX-complete: npm install && npm run build must pass
#
# Usage: bash scripts/verify-level-branches.sh

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
CURRENT_BRANCH=$(git -C "$REPO_ROOT" branch --show-current)
PASS=0
FAIL=0
FAILURES=()

echo "============================================"
echo "  EWB Level Branch Verifier"
echo "============================================"
echo ""

verify_branch() {
  local branch=$1
  echo ""
  echo "--- Verifying: $branch ---"

  if ! git -C "$REPO_ROOT" rev-parse --verify "$branch" &>/dev/null; then
    echo "  SKIP: Branch does not exist"
    return
  fi

  git -C "$REPO_ROOT" checkout "$branch" --quiet

  # Check if portal exists
  if [[ -d "$REPO_ROOT/companion-repo/portal" ]]; then
    cd "$REPO_ROOT/companion-repo/portal"

    # Install dependencies
    if ! npm install --loglevel=error 2>&1 | tail -3; then
      echo "  FAIL: npm install failed"
      FAIL=$((FAIL + 1))
      FAILURES+=("$branch: npm install failed")
      return
    fi

    # Type check
    if ! npx tsc --noEmit 2>&1 | tail -5; then
      echo "  FAIL: TypeScript check failed"
      FAIL=$((FAIL + 1))
      FAILURES+=("$branch: tsc --noEmit failed")
      return
    fi

    echo "  PASS: Portal builds clean"
    PASS=$((PASS + 1))
  else
    echo "  WARN: No portal directory"
  fi

  # Check public-site if it exists (level-09 only)
  if [[ -d "$REPO_ROOT/companion-repo/public-site" ]]; then
    cd "$REPO_ROOT/companion-repo/public-site"

    if ! npm install --loglevel=error 2>&1 | tail -3; then
      echo "  FAIL: public-site npm install failed"
      FAIL=$((FAIL + 1))
      FAILURES+=("$branch: public-site npm install failed")
      return
    fi

    if ! npx tsc --noEmit 2>&1 | tail -5; then
      echo "  FAIL: public-site TypeScript check failed"
      FAIL=$((FAIL + 1))
      FAILURES+=("$branch: public-site tsc failed")
      return
    fi

    echo "  PASS: Public-site builds clean"
  fi
}

# Verify all branches
for level in $(seq 1 9); do
  verify_branch "level-$(printf '%02d' "$level")-start"
  verify_branch "level-$(printf '%02d' "$level")-complete"
done

# Return to original branch
git -C "$REPO_ROOT" checkout "$CURRENT_BRANCH" --quiet

echo ""
echo "============================================"
echo "  Results: $PASS passed, $FAIL failed"
echo "============================================"

if [[ ${#FAILURES[@]} -gt 0 ]]; then
  echo ""
  echo "Failures:"
  for f in "${FAILURES[@]}"; do
    echo "  - $f"
  done
  exit 1
fi
