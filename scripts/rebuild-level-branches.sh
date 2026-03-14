#!/usr/bin/env bash
# rebuild-level-branches.sh
# Generates 18 level branches (level-01-start through level-09-complete)
# from the current main branch using the level manifest and templates.
#
# Usage: bash scripts/rebuild-level-branches.sh [--dry-run]
#
# Prerequisites:
#   - Clean working tree on main branch
#   - All changes committed
#   - Node.js available (for JSON parsing)

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
MANIFEST="$REPO_ROOT/scripts/level-manifest.json"
TEMPLATES="$REPO_ROOT/scripts/level-templates"
DRY_RUN=false

if [[ "${1:-}" == "--dry-run" ]]; then
  DRY_RUN=true
  echo "[DRY RUN] No branches will be created."
fi

# Verify preconditions
if [[ ! -f "$MANIFEST" ]]; then
  echo "ERROR: level-manifest.json not found at $MANIFEST"
  exit 1
fi

if [[ "$(git -C "$REPO_ROOT" status --porcelain)" != "" ]]; then
  echo "ERROR: Working tree is not clean. Commit or stash changes first."
  exit 1
fi

CURRENT_BRANCH=$(git -C "$REPO_ROOT" branch --show-current)
echo "Current branch: $CURRENT_BRANCH"
echo "Building level branches from: $CURRENT_BRANCH"
echo ""

# Parse the manifest to get file-to-level mappings
# We use Node.js to parse the JSON since bash can't do it natively
FILE_LEVELS=$(node -e "
  const fs = require('fs');
  const m = JSON.parse(fs.readFileSync('$MANIFEST', 'utf8'));
  const result = {};

  // Portal src files
  for (const [file, level] of Object.entries(m.portal.src)) {
    result['companion-repo/portal/src/' + file] = level;
  }

  // Portal config files
  for (const [file, level] of Object.entries(m.portal.config.files)) {
    result['companion-repo/portal/' + file] = level;
  }

  // Public-site files
  for (const [file, level] of Object.entries(m['public-site'].files)) {
    result['companion-repo/public-site/' + file] = level;
  }

  // Output as TSV: file\tlevel
  for (const [file, level] of Object.entries(result)) {
    console.log(file + '\t' + level);
  }
")

# Function: get files that should exist at a given level (inclusive)
files_for_level() {
  local target_level=$1
  echo "$FILE_LEVELS" | while IFS=$'\t' read -r file level; do
    if [[ "$level" -le "$target_level" ]]; then
      echo "$file"
    fi
  done
}

# Function: get files introduced AT a specific level (for start branches — these become stubs)
files_at_level() {
  local target_level=$1
  echo "$FILE_LEVELS" | while IFS=$'\t' read -r file level; do
    if [[ "$level" -eq "$target_level" ]]; then
      echo "$file"
    fi
  done
}

# Function: apply template overrides for a level
apply_templates() {
  local level_num=$1
  local level_dir="$TEMPLATES/level-$(printf '%02d' "$level_num")"

  if [[ -d "$level_dir" ]]; then
    echo "  Applying templates from $level_dir..."
    # Copy template files over, preserving directory structure
    cd "$level_dir"
    find . -type f | while read -r tpl_file; do
      local rel="${tpl_file#./}"
      local dest="$REPO_ROOT/companion-repo/$rel"
      # Handle portal/ prefix — templates store as portal/src/... but dest is companion-repo/portal/src/...
      if [[ "$rel" == portal/* ]]; then
        dest="$REPO_ROOT/companion-repo/$rel"
      fi
      mkdir -p "$(dirname "$dest")"
      cp "$level_dir/$rel" "$dest"
      echo "    Replaced: companion-repo/$rel"
    done
    cd "$REPO_ROOT"
  fi
}

# Function: apply README template
apply_readme() {
  local branch_name=$1
  local readme_file="$TEMPLATES/readme/${branch_name}.md"

  if [[ -f "$readme_file" ]]; then
    cp "$readme_file" "$REPO_ROOT/companion-repo/README.md"
    echo "  Applied README for $branch_name"
  fi
}

# Function: create a complete branch (all files through this level)
create_complete_branch() {
  local level=$1
  local branch_name="level-$(printf '%02d' "$level")-complete"

  echo ""
  echo "=== Creating $branch_name ==="

  if $DRY_RUN; then
    echo "  [DRY RUN] Would create branch: $branch_name"
    echo "  Files included: $(files_for_level "$level" | wc -l)"
    return
  fi

  # Start from main
  git -C "$REPO_ROOT" checkout "$CURRENT_BRANCH" --quiet

  # Create orphan-like branch from main
  git -C "$REPO_ROOT" checkout -B "$branch_name" --quiet

  # Remove files that belong to levels ABOVE this one
  echo "$FILE_LEVELS" | while IFS=$'\t' read -r file level_num; do
    if [[ "$level_num" -gt "$level" ]] && [[ -f "$REPO_ROOT/$file" ]]; then
      rm "$REPO_ROOT/$file"
    fi
  done

  # Remove docs (guides, training, reference, scripts) — only companion-repo on level branches
  for dir in guides training reference scripts .tracking PROJECT_CONTEXT.md; do
    if [[ -e "$REPO_ROOT/$dir" ]]; then
      rm -rf "$REPO_ROOT/$dir"
    fi
  done

  # Apply template overrides for this level and all previous
  # We apply the highest applicable template for each variant file
  for tpl_level in $(seq 1 "$level"); do
    apply_templates "$tpl_level"
  done

  # For variant files, use the highest applicable template
  # The loop above already handles this since later templates overwrite earlier ones

  # Apply README
  apply_readme "$branch_name" || true

  # Clean up empty directories
  find "$REPO_ROOT/companion-repo" -type d -empty -delete 2>/dev/null || true

  # Stage and commit
  git -C "$REPO_ROOT" add -A
  git -C "$REPO_ROOT" commit -m "Level $level complete — reference implementation" --quiet --allow-empty

  echo "  Created: $branch_name ($(git -C "$REPO_ROOT" rev-parse --short HEAD))"
}

# Function: create a start branch (files through previous level + stubs for current)
create_start_branch() {
  local level=$1
  local branch_name="level-$(printf '%02d' "$level")-start"
  local prev_level=$((level - 1))

  echo ""
  echo "=== Creating $branch_name ==="

  if $DRY_RUN; then
    echo "  [DRY RUN] Would create branch: $branch_name"
    return
  fi

  # Start from main
  git -C "$REPO_ROOT" checkout "$CURRENT_BRANCH" --quiet

  # Create branch from main
  git -C "$REPO_ROOT" checkout -B "$branch_name" --quiet

  # Remove files that belong to levels ABOVE the PREVIOUS level
  # (i.e., keep only files through level-1, then add stubs for current level)
  echo "$FILE_LEVELS" | while IFS=$'\t' read -r file level_num; do
    if [[ "$level_num" -gt "$prev_level" ]] && [[ -f "$REPO_ROOT/$file" ]]; then
      rm "$REPO_ROOT/$file"
    fi
  done

  # Remove docs
  for dir in guides training reference scripts .tracking PROJECT_CONTEXT.md; do
    if [[ -e "$REPO_ROOT/$dir" ]]; then
      rm -rf "$REPO_ROOT/$dir"
    fi
  done

  # Apply template overrides through previous level
  for tpl_level in $(seq 1 "$prev_level"); do
    apply_templates "$tpl_level"
  done

  # Create stub directories for current level's features
  # (empty directories so students know where to put things)
  files_at_level "$level" | while read -r file; do
    local dir
    dir=$(dirname "$REPO_ROOT/$file")
    mkdir -p "$dir"
  done

  # Apply README for this start branch
  apply_readme "$branch_name"

  # Clean up empty directories that shouldn't exist yet
  find "$REPO_ROOT/companion-repo" -type d -empty -delete 2>/dev/null || true
  # Re-create intentional empty dirs for current level
  files_at_level "$level" | while read -r file; do
    local dir
    dir=$(dirname "$REPO_ROOT/$file")
    mkdir -p "$dir"
    # Create a .gitkeep so the directory is tracked
    if [[ ! -f "$dir/.gitkeep" ]] && [[ -z "$(ls -A "$dir" 2>/dev/null)" ]]; then
      touch "$dir/.gitkeep"
    fi
  done

  # Stage and commit
  git -C "$REPO_ROOT" add -A
  git -C "$REPO_ROOT" commit -m "Level $level start — student starting point" --quiet --allow-empty

  echo "  Created: $branch_name ($(git -C "$REPO_ROOT" rev-parse --short HEAD))"
}

echo "============================================"
echo "  EWB Level Branch Generator"
echo "============================================"
echo ""
echo "Source: $CURRENT_BRANCH"
echo "Manifest: $MANIFEST"
echo "Templates: $TEMPLATES"
echo ""

# Generate branches: for each level, create start then complete
for level in $(seq 1 9); do
  create_start_branch "$level"
  create_complete_branch "$level"
done

# Return to original branch
git -C "$REPO_ROOT" checkout "$CURRENT_BRANCH" --quiet

echo ""
echo "============================================"
echo "  Done! Created 18 branches."
echo "============================================"
echo ""
echo "Branches created:"
for level in $(seq 1 9); do
  printf "  level-%02d-start\n" "$level"
  printf "  level-%02d-complete\n" "$level"
done
echo ""
echo "Next steps:"
echo "  1. Verify each branch builds: bash scripts/verify-level-branches.sh"
echo "  2. Push all branches: git push origin level-01-start level-01-complete ..."
