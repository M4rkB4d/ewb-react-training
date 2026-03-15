#!/usr/bin/env node
/**
 * verify-platform.mjs — Repeatable Platform Integrity Test Suite
 *
 * EastWest Bank React Training Platform
 * Run: node scripts/verify-platform.mjs
 *
 * Exits 0 if all checks pass, 1 if any fail.
 * Designed to be run repeatedly until zero failures remain.
 */

import { execSync } from 'child_process';
import { readFileSync, existsSync, readdirSync } from 'fs';
import { resolve, join, relative } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const ROOT = resolve(__dirname, '..');

// ─── Configuration ──────────────────────────────────────────────────────────

const GUIDE_ORDER = [
  // Level 1
  'guides/level-01-welcome/A01_what-is-react.md',
  'guides/level-01-welcome/A02_typescript-for-react.md',
  'guides/level-01-welcome/A03_thinking-in-compliance.md',
  // Level 2
  'guides/level-02-first-app/B01_project-setup.md',
  'guides/level-02-first-app/B01b_project-tooling.md',
  'guides/level-02-first-app/A04_components-and-jsx.md',
  'guides/level-02-first-app/A05_your-first-test.md',
  // Level 3
  'guides/level-03-building-ui/A06_design-system-foundations.md',
  'guides/level-03-building-ui/A07_forms-and-validation.md',
  'guides/level-03-building-ui/A08_accessibility-essentials.md',
  // Level 4
  'guides/level-04-state-and-routing/A09_state-management.md',
  'guides/level-04-state-and-routing/B02_routing-and-navigation.md',
  'guides/level-04-state-and-routing/A10_testing-components-and-hooks.md',
  // Level 5
  'guides/level-05-data-and-auth/B03_api-integration.md',
  'guides/level-05-data-and-auth/A11_authentication-part1.md',
  'guides/level-05-data-and-auth/B04_authentication-part2.md',
  'guides/level-05-data-and-auth/A12_passkeys-and-webauthn.md',
  // Level 6
  'guides/level-06-quality/A13_error-handling.md',
  'guides/level-06-quality/B05_performance-optimization.md',
  'guides/level-06-quality/A14_testing-advanced.md',
  'guides/level-06-quality/B06_monitoring-and-observability.md',
  // Level 7
  'guides/level-07-production/A15_security-hardening.md',
  'guides/level-07-production/B07_deployment-and-cicd.md',
  'guides/level-07-production/A16_bsp-compliance-framework.md',
  'guides/level-07-production/A17_data-privacy-and-consent.md',
  // Level 8
  'guides/level-08-mastery/A18_architecture-patterns.md',
  'guides/level-08-mastery/B08_internationalization.md',
  'guides/level-08-mastery/B09_integration-capstone.md',
  'guides/level-08-mastery/A19_real-time-patterns.md',
  // Level 9
  'guides/level-09-public-facing/A20_spa-vs-ssr-decision-framework.md',
  'guides/level-09-public-facing/A21_nextjs-project-setup.md',
  'guides/level-09-public-facing/A22_server-components-data-fetching.md',
  'guides/level-09-public-facing/A23_server-components-advanced.md',
  'guides/level-09-public-facing/B10_deploying-nextjs-on-azure.md',
];

const APPENDIX_GUIDES = [
  'guides/appendix/X01_ewb-design-system-reference.md',
  'guides/appendix/X02_bsp-circular-quick-reference.md',
  'guides/appendix/X03_migration-from-v1.md',
];

// Patterns that must NEVER appear in deliverable content
const FORBIDDEN_PATTERNS = [
  { pattern: /Co-Authored-By/gi, label: 'Co-Authored-By' },
  { pattern: /\bClaude\b/g, label: 'Claude (AI reference)' },
  { pattern: /\bChatGPT\b/gi, label: 'ChatGPT' },
  { pattern: /\bAI-generated\b/gi, label: 'AI-generated' },
  { pattern: /\bAI-assisted\b/gi, label: 'AI-assisted' },
  { pattern: /\bAnthropic\b/gi, label: 'Anthropic' },
  { pattern: /\bOpenAI\b/gi, label: 'OpenAI' },
  { pattern: /Generated with \[?Claude/gi, label: 'Generated with Claude' },
  { pattern: /🤖/g, label: 'Robot emoji' },
  { pattern: /\bCodeium\b/gi, label: 'Codeium' },
  { pattern: /\bTabnine\b/gi, label: 'Tabnine' },
];

// Anti-patterns that must not appear in companion code
const CODE_ANTIPATTERNS = [
  { pattern: /\buseCallback\b/, label: 'useCallback (React Compiler handles this)' },
  { pattern: /\buseMemo\b/, label: 'useMemo (React Compiler handles this)' },
  { pattern: /\bReact\.memo\b/, label: 'React.memo (React Compiler handles this)' },
];

// Version patterns that must be consistent
const VERSION_CHECKS = [
  { pattern: /NodeTool@0/g, label: 'NodeTool@0 (should be @1)' },
  { pattern: /versionSpec:\s*'22'/g, label: "versionSpec '22' (should be '24.x')" },
  { pattern: /versionSpec:\s*'24'(?!\.)/g, label: "versionSpec '24' without .x" },
  { pattern: /ewb-session/g, label: 'ewb-session (should be ewb_session with underscore)' },
];

// ─── Test Infrastructure ────────────────────────────────────────────────────

let totalPassed = 0;
let totalFailed = 0;
const failures = [];

function pass(section, test) {
  totalPassed++;
}

function fail(section, test, detail) {
  totalFailed++;
  failures.push({ section, test, detail });
}

function runSection(name, fn) {
  const before = totalFailed;
  console.log(`\n${'─'.repeat(60)}`);
  console.log(`  ${name}`);
  console.log(`${'─'.repeat(60)}`);
  fn();
  const sectionFails = totalFailed - before;
  if (sectionFails === 0) {
    console.log(`  ✅ All checks passed`);
  } else {
    console.log(`  ❌ ${sectionFails} check(s) failed`);
  }
}

function exec(cmd, options = {}) {
  try {
    return execSync(cmd, {
      cwd: ROOT,
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe'],
      timeout: 120_000,
      ...options,
    }).trim();
  } catch (e) {
    return { error: true, stdout: e.stdout?.trim() || '', stderr: e.stderr?.trim() || '', status: e.status };
  }
}

function readFile(relPath) {
  const full = resolve(ROOT, relPath);
  if (!existsSync(full)) return null;
  return readFileSync(full, 'utf-8');
}

function getAllFiles(dir, extensions, results = []) {
  if (!existsSync(dir)) return results;
  const entries = readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name === '.git') continue;
      getAllFiles(full, extensions, results);
    } else if (extensions.some((ext) => entry.name.endsWith(ext))) {
      results.push(full);
    }
  }
  return results;
}

// ─── Section 1: Type Checks ────────────────────────────────────────────────

function checkTypeChecks() {
  runSection('1. Type Checks', () => {
    // Portal
    const portalResult = exec('npx tsc --noEmit', {
      cwd: resolve(ROOT, 'companion-repo/portal'),
    });
    if (typeof portalResult === 'string' || portalResult === '') {
      pass('type-check', 'Portal tsc --noEmit');
      console.log('  ✓ Portal: tsc --noEmit clean');
    } else {
      fail('type-check', 'Portal tsc --noEmit', portalResult.stderr || portalResult.stdout);
      console.log('  ✗ Portal: type errors found');
    }

    // Public site
    const publicResult = exec('npx tsc --noEmit', {
      cwd: resolve(ROOT, 'companion-repo/public-site'),
    });
    if (typeof publicResult === 'string' || publicResult === '') {
      pass('type-check', 'Public-site tsc --noEmit');
      console.log('  ✓ Public-site: tsc --noEmit clean');
    } else {
      fail('type-check', 'Public-site tsc --noEmit', publicResult.stderr || publicResult.stdout);
      console.log('  ✗ Public-site: type errors found');
    }
  });
}

// ─── Section 2: Test Suites ─────────────────────────────────────────────────

function checkTests() {
  runSection('2. Test Suites', () => {
    // Portal reference tests (exclude exercise tests — L1-4 fail by design)
    const portalRef = exec('npx vitest run --exclude "src/test/exercises/**" 2>&1', {
      cwd: resolve(ROOT, 'companion-repo/portal'),
    });
    const portalRefOut = typeof portalRef === 'string' ? portalRef : portalRef.stdout;
    const portalRefPass = portalRefOut.match(/(\d+) passed/);
    const portalRefFail = portalRefOut.match(/Tests\s+.*?(\d+) failed/);
    if (portalRefFail) {
      fail('tests', 'Portal reference tests', `${portalRefFail[1]} test(s) failed`);
      console.log(`  ✗ Portal reference tests: failures detected`);
    } else if (portalRefPass) {
      pass('tests', `Portal reference: ${portalRefPass[1]} tests`);
      console.log(`  ✓ Portal reference tests: ${portalRefPass[1]} passed`);
    }

    // Portal exercise tests L5-9 (must pass — reference implementations exist)
    const exerciseTests = exec('npx vitest run src/test/exercises/level-05.test.ts src/test/exercises/level-06.test.ts src/test/exercises/level-07.test.ts src/test/exercises/level-08.test.ts src/test/exercises/level-09.test.ts 2>&1', {
      cwd: resolve(ROOT, 'companion-repo/portal'),
    });
    const exOut = typeof exerciseTests === 'string' ? exerciseTests : exerciseTests.stdout;
    const exPass = exOut.match(/(\d+) passed/);
    const exFail = exOut.match(/Tests\s+.*?(\d+) failed/);
    if (exFail) {
      fail('tests', 'Exercise tests L5-9', `${exFail[1]} test(s) failed`);
      console.log(`  ✗ Exercise tests L5-9: failures detected`);
    } else if (exPass) {
      pass('tests', `Exercise tests L5-9: ${exPass[1]} tests`);
      console.log(`  ✓ Exercise tests L5-9: ${exPass[1]} passed`);
    } else {
    }

    // Public-site tests
    const pubTests = exec('npx vitest run 2>&1', {
      cwd: resolve(ROOT, 'companion-repo/public-site'),
    });
    const pubOutput = typeof pubTests === 'string' ? pubTests : pubTests.stdout;
    const pubPassMatch = pubOutput.match(/(\d+) passed/);
    const pubFailMatch = pubOutput.match(/(\d+) failed/);
    if (pubFailMatch) {
      fail('tests', 'Public-site tests', `${pubFailMatch[1]} test(s) failed`);
      console.log(`  ✗ Public-site: ${pubFailMatch[1]} test(s) failed`);
    } else if (pubPassMatch) {
      pass('tests', `Public-site: ${pubPassMatch[1]} tests`);
      console.log(`  ✓ Public-site: ${pubPassMatch[1]} tests passed`);
    }
  });
}

// ─── Section 3: AI Trace Sweep ──────────────────────────────────────────────

function checkAITraces() {
  runSection('3. AI Trace Sweep', () => {
    const scanDirs = ['guides', 'training', 'companion-repo', 'reference'];
    const scanFiles = ['README.md'];
    const extensions = ['.md', '.ts', '.tsx', '.js', '.jsx', '.json', '.yml', '.yaml', '.css'];
    let traceCount = 0;

    // Collect all files to scan
    let filesToScan = [];
    for (const dir of scanDirs) {
      const fullPath = resolve(ROOT, dir);
      if (existsSync(fullPath)) {
        filesToScan.push(...getAllFiles(fullPath, extensions));
      }
    }
    for (const f of scanFiles) {
      const fullPath = resolve(ROOT, f);
      if (existsSync(fullPath)) filesToScan.push(fullPath);
    }

    for (const file of filesToScan) {
      if (file.includes('node_modules') || file.includes('package-lock')) continue;
      const content = readFileSync(file, 'utf-8');
      const relPath = relative(ROOT, file);

      for (const { pattern, label } of FORBIDDEN_PATTERNS) {
        pattern.lastIndex = 0;
        const matches = content.match(pattern);
        if (matches) {
          traceCount++;
          fail('ai-traces', `${label} in ${relPath}`, `Found ${matches.length} occurrence(s)`);
          console.log(`  ✗ ${label} found in ${relPath}`);
        }
      }
    }

    if (traceCount === 0) {
      pass('ai-traces', 'No AI traces found');
      console.log('  ✓ Zero AI traces in deliverable content');
    }

    // Check git log
    const gitLog = exec('git log --format="%B" 2>/dev/null');
    const logStr = typeof gitLog === 'string' ? gitLog : '';
    const gitPatterns = [/co-authored-by/gi, /\bclaude\b/gi, /\bchatgpt\b/gi, /\bcopilot\b/gi, /\banthropicb/gi];
    let gitTraces = false;
    for (const p of gitPatterns) {
      if (p.test(logStr)) {
        fail('ai-traces', 'AI trace in git log', `Pattern: ${p.source}`);
        console.log(`  ✗ AI trace in git commit history: ${p.source}`);
        gitTraces = true;
      }
    }
    if (!gitTraces) {
      pass('ai-traces', 'Git log clean');
      console.log('  ✓ Git commit history clean');
    }

    // Check PROJECT_CONTEXT.md is not tracked
    const tracked = exec('git ls-files PROJECT_CONTEXT.md 2>/dev/null');
    const trackedStr = typeof tracked === 'string' ? tracked : '';
    if (trackedStr.includes('PROJECT_CONTEXT.md')) {
      fail('ai-traces', 'PROJECT_CONTEXT.md is tracked', 'Must be removed before shipping');
      console.log('  ✗ PROJECT_CONTEXT.md is still tracked in git');
    } else {
      pass('ai-traces', 'PROJECT_CONTEXT.md not tracked');
      console.log('  ✓ PROJECT_CONTEXT.md not tracked');
    }
  });
}

// ─── Section 4: Version Consistency ─────────────────────────────────────────

function checkVersions() {
  runSection('4. Version Consistency', () => {
    const scanDirs = ['guides', 'training', 'companion-repo'];
    const extensions = ['.md', '.ts', '.tsx', '.yml', '.yaml', '.json'];
    let issues = 0;

    for (const dir of scanDirs) {
      const files = getAllFiles(resolve(ROOT, dir), extensions);
      for (const file of files) {
        if (file.includes('node_modules') || file.includes('package-lock')) continue;
        const content = readFileSync(file, 'utf-8');
        const relPath = relative(ROOT, file);

        for (const { pattern, label } of VERSION_CHECKS) {
          pattern.lastIndex = 0;
          const matches = content.match(pattern);
          if (matches) {
            issues++;
            fail('versions', `${label} in ${relPath}`, `${matches.length} occurrence(s)`);
            console.log(`  ✗ ${label} in ${relPath}`);
          }
        }
      }
    }

    // Check Next.js version in package.json
    const pkgJson = readFile('companion-repo/public-site/package.json');
    if (pkgJson) {
      const pkg = JSON.parse(pkgJson);
      if (pkg.dependencies?.next && !pkg.dependencies.next.includes('16')) {
        issues++;
        fail('versions', 'Next.js version', `Expected ^16.x, found ${pkg.dependencies.next}`);
        console.log(`  ✗ Next.js version: ${pkg.dependencies.next} (expected ^16.x)`);
      } else {
        pass('versions', 'Next.js ^16.x');
        console.log(`  ✓ Next.js version: ${pkg.dependencies?.next}`);
      }
    }

    if (issues === 0) {
      pass('versions', 'All version patterns consistent');
      console.log('  ✓ All version patterns consistent');
    }
  });
}

// ─── Section 5: Code Anti-Patterns ──────────────────────────────────────────

function checkAntiPatterns() {
  runSection('5. Code Anti-Patterns', () => {
    const codeFiles = getAllFiles(resolve(ROOT, 'companion-repo'), ['.ts', '.tsx']);
    let issues = 0;

    for (const file of codeFiles) {
      if (file.includes('node_modules') || file.includes('.test.')) continue;
      const content = readFileSync(file, 'utf-8');
      const relPath = relative(ROOT, file);

      for (const { pattern, label } of CODE_ANTIPATTERNS) {
        if (pattern.test(content)) {
          issues++;
          fail('anti-patterns', `${label} in ${relPath}`, 'Remove — React Compiler handles optimization');
          console.log(`  ✗ ${label} in ${relPath}`);
        }
      }
    }

    // Check for GitHub Actions (should be Azure Pipelines)
    const allMd = getAllFiles(resolve(ROOT, 'guides'), ['.md']);
    for (const file of allMd) {
      const content = readFileSync(file, 'utf-8');
      if (/github\s+actions/gi.test(content)) {
        const relPath = relative(ROOT, file);
        issues++;
        fail('anti-patterns', `GitHub Actions in ${relPath}`, 'Should use Azure Pipelines');
        console.log(`  ✗ GitHub Actions reference in ${relPath}`);
      }
    }

    if (issues === 0) {
      pass('anti-patterns', 'No anti-patterns found');
      console.log('  ✓ No code anti-patterns found');
    }
  });
}

// ─── Section 6: Guide Structure ─────────────────────────────────────────────

function checkGuideStructure() {
  runSection('6. Guide Structure', () => {
    let issues = 0;

    for (const guidePath of GUIDE_ORDER) {
      const content = readFile(guidePath);
      if (!content) {
        issues++;
        fail('structure', `Guide missing: ${guidePath}`, 'File does not exist');
        console.log(`  ✗ Missing: ${guidePath}`);
        continue;
      }

      const guideId = guidePath.split('/').pop().split('_')[0];
      const checks = [
        { test: /^#\s+[A-BX]\d+\w*\s*—/m.test(content), label: 'Title with guide ID' },
        { test: /EastWest Bank/i.test(content), label: 'EWB banner' },
        { test: /What You Will Learn|Learning Objectives/i.test(content), label: 'Learning objectives' },
        { test: /Prerequisites|Before You Start/i.test(content), label: 'Prerequisites' },
        {
          test: /Key Takeaways|Summary|Checkpoint|What.s Next|What Comes Next/i.test(content),
          label: 'Summary/Takeaways',
        },
      ];

      for (const check of checks) {
        if (!check.test) {
          issues++;
          fail('structure', `${guideId}: missing ${check.label}`, guidePath);
          console.log(`  ✗ ${guideId}: missing ${check.label}`);
        }
      }
    }

    // Verify all guide files exist
    for (const guidePath of [...GUIDE_ORDER, ...APPENDIX_GUIDES]) {
      if (!existsSync(resolve(ROOT, guidePath))) {
        issues++;
        fail('structure', `File missing: ${guidePath}`, 'Guide file does not exist');
        console.log(`  ✗ Missing file: ${guidePath}`);
      }
    }

    if (issues === 0) {
      pass('structure', 'All 37 guides have required sections');
      console.log('  ✓ All 37 guides present with required structural sections');
    }
  });
}

// ─── Section 7: Navigation Chain ────────────────────────────────────────────

function checkNavigationChain() {
  runSection('7. Navigation Chain', () => {
    let issues = 0;

    for (let i = 0; i < GUIDE_ORDER.length - 1; i++) {
      const currentPath = GUIDE_ORDER[i];
      const nextPath = GUIDE_ORDER[i + 1];
      const content = readFile(currentPath);
      if (!content) continue;

      const currentId = currentPath.split('/').pop().split('_')[0];
      const nextId = nextPath.split('/').pop().split('_')[0];
      const nextFileName = nextPath.split('/').pop();

      // Check if the guide links to the next guide
      const hasNextLink = content.includes(nextFileName) || content.includes(nextId);
      if (!hasNextLink) {
        issues++;
        fail('navigation', `${currentId} → ${nextId}`, `No link to next guide found`);
        console.log(`  ✗ ${currentId} does not link to ${nextId}`);
      }
    }

    if (issues === 0) {
      pass('navigation', 'All forward links intact');
      console.log('  ✓ All 33 forward navigation links intact');
    }
  });
}

// ─── Section 8: Training Material Completeness ──────────────────────────────

function checkTrainingMaterials() {
  runSection('8. Training Materials', () => {
    let issues = 0;

    for (let level = 1; level <= 9; level++) {
      const padded = String(level).padStart(2, '0');

      // Quiz exists
      const quizPath = `training/quizzes/level-${padded}-quiz.md`;
      if (!existsSync(resolve(ROOT, quizPath))) {
        issues++;
        fail('training', `Missing quiz: ${quizPath}`);
        console.log(`  ✗ Missing: ${quizPath}`);
      }

      // Answer key exists
      const answerPath = `training/answer-keys/level-${padded}-answers.md`;
      if (!existsSync(resolve(ROOT, answerPath))) {
        issues++;
        fail('training', `Missing answer key: ${answerPath}`);
        console.log(`  ✗ Missing: ${answerPath}`);
      }

      // Exercises exist
      const exercisePath = `training/exercises/level-${padded}-exercises.md`;
      if (!existsSync(resolve(ROOT, exercisePath))) {
        issues++;
        fail('training', `Missing exercises: ${exercisePath}`);
        console.log(`  ✗ Missing: ${exercisePath}`);
      }

      // Quiz has 12 questions
      const quizContent = readFile(quizPath);
      if (quizContent) {
        const questionCount = (quizContent.match(/###\s+Question\s+\d+/g) || []).length;
        if (questionCount !== 12) {
          issues++;
          fail('training', `${quizPath}: ${questionCount} questions`, 'Expected 12');
          console.log(`  ✗ Level ${level} quiz: ${questionCount} questions (expected 12)`);
        }
      }

      // Answer key has 12 answers
      const answerContent = readFile(answerPath);
      if (answerContent) {
        const answerCount = (answerContent.match(/###\s+Question\s+\d+/g) || []).length;
        if (answerCount !== 12) {
          issues++;
          fail('training', `${answerPath}: ${answerCount} answers`, 'Expected 12');
          console.log(`  ✗ Level ${level} answers: ${answerCount} answers (expected 12)`);
        }
      }

      // Slides exist
      const slidesPath = `training/slides/level-${padded}-slides.md`;
      if (!existsSync(resolve(ROOT, slidesPath))) {
        issues++;
        fail('training', `Missing slides: ${slidesPath}`);
        console.log(`  ✗ Missing: ${slidesPath}`);
      }

      // Demo exists
      const demoPath = `training/demos/level-${padded}-demo.md`;
      if (!existsSync(resolve(ROOT, demoPath))) {
        issues++;
        fail('training', `Missing demo: ${demoPath}`);
        console.log(`  ✗ Missing: ${demoPath}`);
      }
    }

    // Instructor guide
    if (!existsSync(resolve(ROOT, 'training/INSTRUCTOR_GUIDE.md'))) {
      issues++;
      fail('training', 'Missing INSTRUCTOR_GUIDE.md');
      console.log('  ✗ Missing: training/INSTRUCTOR_GUIDE.md');
    }

    // Onboarding
    if (!existsSync(resolve(ROOT, 'training/ONBOARDING.md'))) {
      issues++;
      fail('training', 'Missing ONBOARDING.md');
      console.log('  ✗ Missing: training/ONBOARDING.md');
    }

    // Quick start
    if (!existsSync(resolve(ROOT, 'training/QUICK_START.md'))) {
      issues++;
      fail('training', 'Missing QUICK_START.md');
      console.log('  ✗ Missing: training/QUICK_START.md');
    }

    if (issues === 0) {
      pass('training', 'All training materials complete');
      console.log('  ✓ All 9 levels: quizzes, answers, exercises, slides, demos present');
      console.log('  ✓ All quizzes have 12 questions, all answer keys have 12 answers');
      console.log('  ✓ Instructor guide, onboarding, quick start present');
    }
  });
}

// ─── Section 9: Cross-Reference Validation ──────────────────────────────────

function checkCrossReferences() {
  runSection('9. Cross-References', () => {
    let issues = 0;

    // Build a map of guide ID → actual title from INDEX.md
    const indexContent = readFile('reference/INDEX.md');
    const guideTitles = {};
    if (indexContent) {
      const titlePattern = /\|\s*([\w]+)\s*\|\s*\[([^\]]+)\]/g;
      let match;
      while ((match = titlePattern.exec(indexContent)) !== null) {
        guideTitles[match[1]] = match[2];
      }
    }

    // Check prerequisites in each guide reference correct titles
    for (const guidePath of GUIDE_ORDER) {
      const content = readFile(guidePath);
      if (!content) continue;
      const guideId = guidePath.split('/').pop().split('_')[0];

      // Find prerequisite references like "Completed B03 — Something"
      const prereqPattern = /Completed\s+([\w]+)\s*—\s*([^\n|]+)/g;
      let prereqMatch;
      while ((prereqMatch = prereqPattern.exec(content)) !== null) {
        const refId = prereqMatch[1].trim();
        const refTitle = prereqMatch[2].trim();
        const actualTitle = guideTitles[refId];

        // Allow shortened titles — e.g. "Authentication Part 1" matches "Authentication Part 1: Concepts"
        if (actualTitle && actualTitle !== refTitle && !actualTitle.startsWith(refTitle.replace(/ \(.*\)$/, ''))) {
          issues++;
          fail('cross-refs', `${guideId} prereq: ${refId}`, `Says "${refTitle}" but actual title is "${actualTitle}"`);
          console.log(`  ✗ ${guideId}: prereq ${refId} says "${refTitle}", should be "${actualTitle}"`);
        }
      }
    }

    if (issues === 0) {
      pass('cross-refs', 'All cross-references match');
      console.log('  ✓ All prerequisite guide titles match INDEX.md');
    }
  });
}

// ─── Section 10: Zod 4 Compatibility ────────────────────────────────────────

function checkZod4() {
  runSection('10. Zod 4 Compatibility', () => {
    let issues = 0;
    const scanDirs = ['companion-repo', 'guides', 'training/answer-keys'];
    const extensions = ['.ts', '.tsx', '.md'];

    for (const dir of scanDirs) {
      const files = getAllFiles(resolve(ROOT, dir), extensions);
      for (const file of files) {
        if (file.includes('node_modules') || file.includes('package-lock')) continue;
        const content = readFileSync(file, 'utf-8');
        const relPath = relative(ROOT, file);

        // Check for error.errors (Zod 3) instead of error.issues (Zod 4)
        if (/error\.errors\b/.test(content) && /ZodError/.test(content)) {
          issues++;
          fail('zod4', `${relPath}`, 'Uses error.errors (Zod 3) — should be error.issues (Zod 4)');
          console.log(`  ✗ ${relPath}: error.errors should be error.issues`);
        }
      }
    }

    if (issues === 0) {
      pass('zod4', 'No Zod 3 patterns found');
      console.log('  ✓ No Zod 3 patterns (error.errors) found');
    }
  });
}

// ─── Section 11: Level Branches ─────────────────────────────────────────────

function checkLevelBranches() {
  runSection('11. Level Branches', () => {
    let issues = 0;

    for (let level = 1; level <= 9; level++) {
      const padded = String(level).padStart(2, '0');
      for (const suffix of ['start', 'complete']) {
        const branchName = `level-${padded}-${suffix}`;
        const result = exec(`git branch --list ${branchName}`);
        const resultStr = typeof result === 'string' ? result.trim() : '';
        if (!resultStr.includes(branchName)) {
          issues++;
          fail('branches', `Missing branch: ${branchName}`);
          console.log(`  ✗ Missing: ${branchName}`);
        }
      }
    }

    if (issues === 0) {
      pass('branches', 'All 18 level branches exist');
      console.log('  ✓ All 18 level branches exist (level-01-start through level-09-complete)');
    }
  });
}

// ─── Section 12: Naming Consistency ─────────────────────────────────────────

function checkNaming() {
  runSection('12. Naming Consistency', () => {
    let issues = 0;
    const codeFiles = getAllFiles(resolve(ROOT, 'companion-repo'), ['.ts', '.tsx']);

    for (const file of codeFiles) {
      if (file.includes('node_modules')) continue;
      const content = readFileSync(file, 'utf-8');
      const relPath = relative(ROOT, file);

      // Check cookie name consistency
      if (/ewb-session/.test(content)) {
        issues++;
        fail('naming', `${relPath}`, 'ewb-session should be ewb_session');
        console.log(`  ✗ ${relPath}: ewb-session → ewb_session`);
      }
    }

    if (issues === 0) {
      pass('naming', 'All naming conventions consistent');
      console.log('  ✓ Cookie naming (ewb_session) consistent');
    }
  });
}

// ─── Run All Checks ─────────────────────────────────────────────────────────

console.log('╔════════════════════════════════════════════════════════════╗');
console.log('║  EWB React Training — Platform Integrity Verification    ║');
console.log('╚════════════════════════════════════════════════════════════╝');
console.log(`\nRoot: ${ROOT}`);
console.log(`Time: ${new Date().toISOString()}`);

checkTypeChecks();
checkTests();
checkAITraces();
checkVersions();
checkAntiPatterns();
checkGuideStructure();
checkNavigationChain();
checkTrainingMaterials();
checkCrossReferences();
checkZod4();
checkLevelBranches();
checkNaming();

// ─── Summary ────────────────────────────────────────────────────────────────

console.log(`\n${'═'.repeat(60)}`);
console.log(`  RESULTS: ${totalPassed} passed, ${totalFailed} failed`);
console.log(`${'═'.repeat(60)}`);

if (failures.length > 0) {
  console.log('\nFailures:');
  for (const f of failures) {
    console.log(`  [${f.section}] ${f.test}${f.detail ? ` — ${f.detail}` : ''}`);
  }
  console.log(`\nRe-run after fixing: node scripts/verify-platform.mjs`);
  process.exit(1);
} else {
  console.log('\n✅ Platform is clean. All checks passed.');
  console.log('   Ready for shipping when authorized.');
  process.exit(0);
}
