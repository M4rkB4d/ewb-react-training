#!/usr/bin/env bash
# verify-setup.sh — Pre-training environment validation
# Run this BEFORE Day 1 to catch setup issues early.
#
# Usage:
#   bash scripts/verify-setup.sh
#
# Exit codes:
#   0 — All checks passed
#   1 — One or more checks failed (see output)

set -euo pipefail

PASS=0
FAIL=0
WARN=0

pass() { echo "  [PASS] $1"; ((PASS++)); }
fail() { echo "  [FAIL] $1"; ((FAIL++)); }
warn() { echo "  [WARN] $1"; ((WARN++)); }

echo ""
echo "=========================================="
echo "  EWB React Training — Setup Verification"
echo "=========================================="
echo ""

# ── Node.js ──────────────────────────────────────────────
echo "1. Node.js"
if command -v node &>/dev/null; then
  NODE_VERSION=$(node --version | sed 's/v//')
  NODE_MAJOR=$(echo "$NODE_VERSION" | cut -d. -f1)
  if [ "$NODE_MAJOR" -ge 24 ]; then
    pass "Node.js $NODE_VERSION (>= 24 required)"
  else
    fail "Node.js $NODE_VERSION found — version 24+ required"
  fi
else
  fail "Node.js not found — install Node.js 24 LTS from https://nodejs.org"
fi

# ── npm ──────────────────────────────────────────────────
echo "2. npm"
if command -v npm &>/dev/null; then
  NPM_VERSION=$(npm --version)
  pass "npm $NPM_VERSION"
else
  fail "npm not found"
fi

# ── Git ──────────────────────────────────────────────────
echo "3. Git"
if command -v git &>/dev/null; then
  GIT_VERSION=$(git --version | sed 's/git version //')
  pass "Git $GIT_VERSION"

  GIT_USER=$(git config --global user.name 2>/dev/null || echo "")
  GIT_EMAIL=$(git config --global user.email 2>/dev/null || echo "")
  if [ -n "$GIT_USER" ] && [ -n "$GIT_EMAIL" ]; then
    pass "Git identity: $GIT_USER <$GIT_EMAIL>"
  else
    fail "Git identity not configured — run: git config --global user.name \"Your Name\" && git config --global user.email \"you@eastwestbanker.com\""
  fi
else
  fail "Git not found — install from https://git-scm.com"
fi

# ── VS Code ──────────────────────────────────────────────
echo "4. VS Code"
if command -v code &>/dev/null; then
  CODE_VERSION=$(code --version 2>/dev/null | head -1)
  pass "VS Code $CODE_VERSION"

  # Check extensions
  EXTENSIONS=$(code --list-extensions 2>/dev/null || echo "")

  check_extension() {
    local ext_id="$1"
    local ext_name="$2"
    if echo "$EXTENSIONS" | grep -qi "$ext_id"; then
      pass "Extension: $ext_name"
    else
      fail "Extension missing: $ext_name — run: code --install-extension $ext_id"
    fi
  }

  check_extension "dbaeumer.vscode-eslint" "ESLint"
  check_extension "esbenp.prettier-vscode" "Prettier"
  check_extension "bradlc.vscode-tailwindcss" "Tailwind CSS IntelliSense"
else
  warn "VS Code CLI (code) not found in PATH — cannot verify extensions. Make sure VS Code is installed with ESLint, Prettier, and Tailwind CSS IntelliSense extensions."
fi

# ── Companion repo ───────────────────────────────────────
echo "5. Companion Repo"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(dirname "$SCRIPT_DIR")"

if [ -f "$REPO_ROOT/companion-repo/portal/package.json" ]; then
  pass "Portal companion repo found"
else
  fail "Portal companion repo not found at companion-repo/portal/"
fi

if [ -f "$REPO_ROOT/companion-repo/public-site/package.json" ]; then
  pass "Public site companion repo found"
else
  fail "Public site companion repo not found at companion-repo/public-site/"
fi

# ── TypeScript strict mode ───────────────────────────────
echo "6. TypeScript Configuration"
if [ -f "$REPO_ROOT/companion-repo/portal/tsconfig.app.json" ]; then
  if grep -q '"strict": true' "$REPO_ROOT/companion-repo/portal/tsconfig.app.json"; then
    pass "TypeScript strict mode enabled"
  else
    warn "TypeScript strict mode not found in tsconfig.app.json"
  fi
else
  warn "tsconfig.app.json not found — will be created during B01"
fi

# ── Summary ──────────────────────────────────────────────
echo ""
echo "=========================================="
echo "  Results: $PASS passed, $FAIL failed, $WARN warnings"
echo "=========================================="
echo ""

if [ "$FAIL" -gt 0 ]; then
  echo "Fix the failures above before Day 1."
  echo "Ask your team lead if you need help with setup."
  exit 1
else
  if [ "$WARN" -gt 0 ]; then
    echo "All critical checks passed. Review warnings above."
  else
    echo "All checks passed. You are ready for Day 1."
  fi
  exit 0
fi
