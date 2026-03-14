#!/usr/bin/env node

/**
 * Validates that every file path referenced in guide code blocks
 * exists in the companion repo.
 *
 * Usage: node scripts/validate-guide-paths.mjs
 *
 * Parses all .md files in guides/ for file path comments like:
 *   // src/components/ui/button.tsx
 *   // app/api/health/route.ts
 *   // middleware.ts
 *   // vite.config.ts
 *   # Dockerfile
 *
 * Level 9 guides (A21, A22, B10) map to companion-repo/public-site/
 * All other guides map to companion-repo/portal/
 */

import { readdir, readFile, access } from 'node:fs/promises';
import { join, resolve, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const GUIDES_DIR = join(ROOT, 'guides');
const COMPANION_DIR = join(ROOT, 'companion-repo');
const PORTAL_DIR = join(COMPANION_DIR, 'portal');
const PUBLIC_SITE_DIR = join(COMPANION_DIR, 'public-site');

// Level 9 guides → public-site, everything else → portal
const LEVEL_9_GUIDES = new Set([
  'A20_spa-vs-ssr-decision-framework.md',
  'A21_nextjs-project-setup.md',
  'A22_server-components-data-fetching.md',
  'A23_server-components-advanced.md',
  'B10_deploying-nextjs-on-azure.md',
]);

// Root-level config files (no src/ or app/ prefix)
const ROOT_CONFIG_PATTERN = /^\/\/\s+(middleware|instrumentation|next\.config|next-env\.d|vite\.config|tsconfig[\w.-]*|eslint\.config|vitest\.config|postcss\.config)\.\w+$/;

// Standard file path comments: // src/... or // app/...
const PATH_COMMENT_PATTERN = /^\/\/\s+((?:src|app|public)\/[\w./@[\]-]+\.\w+)/;

// Non-JS path comments: # Dockerfile, # .dockerignore
const HASH_PATH_PATTERN = /^#\s+(Dockerfile|\.dockerignore|\.env[\w.]*)/;

// Paths to intentionally skip (not real files, just examples)
const SKIP_PATTERNS = [
  /\.env\.example/,
  /\.env\.local/,
  /\.env$/,
  /\.test\.(tsx?|jsx?)$/,      // test files (deferred — Phase 3 of plan)
  /\.a11y\.test\./,            // accessibility test files
  /\.spec\./,                  // spec files
  /tsconfig\.json$/,           // root tsconfig (not a source file)
  /tsconfig\.app\.json$/,      // tsconfig variant
];

function shouldSkip(filePath) {
  return SKIP_PATTERNS.some((p) => p.test(filePath));
}

async function fileExists(filePath) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function getMarkdownFiles(dir) {
  const files = [];

  async function walk(current) {
    const entries = await readdir(current, { withFileTypes: true });
    for (const entry of entries) {
      const full = join(current, entry.name);
      if (entry.isDirectory()) {
        await walk(full);
      } else if (entry.name.endsWith('.md')) {
        files.push(full);
      }
    }
  }

  await walk(dir);
  return files;
}

function extractPaths(content, guideFile) {
  const paths = [];
  const lines = content.split('\n');
  let inCodeBlock = false;

  for (const line of lines) {
    const trimmed = line.trim();

    if (trimmed.startsWith('```')) {
      inCodeBlock = !inCodeBlock;
      continue;
    }

    if (!inCodeBlock) continue;

    // Check // src/... or // app/...
    const pathMatch = trimmed.match(PATH_COMMENT_PATTERN);
    if (pathMatch) {
      // Clean up annotations like "(addition)" or "(addition from A22)"
      const clean = pathMatch[1].replace(/\s*\(.*\)\s*$/, '').trim();
      paths.push(clean);
      continue;
    }

    // Check root-level config: // vite.config.ts, // middleware.ts, etc.
    const configMatch = trimmed.match(ROOT_CONFIG_PATTERN);
    if (configMatch) {
      const clean = trimmed.replace(/^\/\/\s+/, '').replace(/\s*\(.*\)\s*$/, '').trim();
      paths.push(clean);
      continue;
    }

    // Check # Dockerfile, # .dockerignore
    const hashMatch = trimmed.match(HASH_PATH_PATTERN);
    if (hashMatch) {
      paths.push(hashMatch[1]);
    }
  }

  return paths;
}

async function main() {
  console.log('Guide Path Validator');
  console.log('====================\n');

  const guideFiles = await getMarkdownFiles(GUIDES_DIR);
  console.log(`Found ${guideFiles.length} guide files\n`);

  const isLevel9 = (file) => LEVEL_9_GUIDES.has(basename(file));

  let totalPaths = 0;
  let foundPaths = 0;
  let missingPaths = 0;
  let skippedPaths = 0;
  const missing = [];

  for (const guideFile of guideFiles.sort()) {
    const content = await readFile(guideFile, 'utf-8');
    const guideName = basename(guideFile);
    const paths = extractPaths(content, guideFile);

    if (paths.length === 0) continue;

    const baseDir = isLevel9(guideFile) ? PUBLIC_SITE_DIR : PORTAL_DIR;
    const project = isLevel9(guideFile) ? 'public-site' : 'portal';

    for (const filePath of paths) {
      totalPaths++;

      if (shouldSkip(filePath)) {
        skippedPaths++;
        continue;
      }

      const fullPath = join(baseDir, filePath);
      const exists = await fileExists(fullPath);

      if (exists) {
        foundPaths++;
      } else {
        missingPaths++;
        missing.push({
          guide: guideName,
          path: filePath,
          project,
          expectedAt: fullPath,
        });
      }
    }
  }

  // Summary
  const coverage = totalPaths - skippedPaths > 0
    ? ((foundPaths / (totalPaths - skippedPaths)) * 100).toFixed(1)
    : '0.0';

  console.log('Results');
  console.log('-------');
  console.log(`Total paths extracted:  ${totalPaths}`);
  console.log(`Found in companion:    ${foundPaths}`);
  console.log(`Missing:               ${missingPaths}`);
  console.log(`Skipped (tests/env):   ${skippedPaths}`);
  console.log(`Coverage:              ${coverage}%\n`);

  if (missing.length > 0) {
    console.log('Missing Files');
    console.log('-------------');

    // Group by guide
    const byGuide = {};
    for (const m of missing) {
      if (!byGuide[m.guide]) byGuide[m.guide] = [];
      byGuide[m.guide].push(m);
    }

    for (const [guide, items] of Object.entries(byGuide)) {
      console.log(`\n  ${guide} → ${items[0].project}/`);
      for (const item of items) {
        console.log(`    ✗ ${item.path}`);
      }
    }
  } else {
    console.log('All guide-referenced paths exist in the companion repo.');
  }

  console.log('');
  process.exit(missingPaths > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error('Validation failed:', err);
  process.exit(2);
});
