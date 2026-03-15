// Exercise tests for Level 9 — Public-Facing (Next.js)
// These tests run in the portal's vitest but validate knowledge concepts.
// The actual Next.js components are in companion-repo/public-site/
//
// Run: npm run test:exercises -- level-09

import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

// ─── Exercise 1: Product Comparison Page ─────────────────────────────────────

describe('Exercise 1: Product Comparison', () => {
  const publicSiteRoot = resolve(__dirname, '../../../..', 'public-site');

  it('public-site directory exists', () => {
    expect(existsSync(publicSiteRoot)).toBe(true);
  });

  it('products page exists', () => {
    const productsPage = resolve(publicSiteRoot, 'app/products/page.tsx');
    expect(existsSync(productsPage)).toBe(true);
  });

  it('product detail page uses dynamic route', () => {
    const detailPage = resolve(publicSiteRoot, 'app/products/[slug]/page.tsx');
    expect(existsSync(detailPage)).toBe(true);
  });

  it('product detail has not-found page', () => {
    const notFound = resolve(publicSiteRoot, 'app/products/[slug]/not-found.tsx');
    expect(existsSync(notFound)).toBe(true);
  });
});

// ─── Exercise 2: Rates Page with Streaming ───────────────────────────────────

describe('Exercise 2: Rates Page', () => {
  const publicSiteRoot = resolve(__dirname, '../../../..', 'public-site');

  it('rates page exists', () => {
    const ratesPage = resolve(publicSiteRoot, 'app/rates/page.tsx');
    expect(existsSync(ratesPage)).toBe(true);
  });

  it('rates page has loading state', () => {
    const loading = resolve(publicSiteRoot, 'app/rates/loading.tsx');
    expect(existsSync(loading)).toBe(true);
  });

  it('rates page has error boundary', () => {
    const error = resolve(publicSiteRoot, 'app/rates/error.tsx');
    expect(existsSync(error)).toBe(true);
  });

  it('rates API route exists', () => {
    const route = resolve(publicSiteRoot, 'app/api/rates/route.ts');
    expect(existsSync(route)).toBe(true);
  });
});

// ─── Exercise 3: Middleware & Security ────────────────────────────────────────

describe('Exercise 3: Middleware', () => {
  const publicSiteRoot = resolve(__dirname, '../../../..', 'public-site');

  it('middleware.ts exists', () => {
    const middleware = resolve(publicSiteRoot, 'middleware.ts');
    expect(existsSync(middleware)).toBe(true);
  });

  it('middleware exports config with matcher', () => {
    const middleware = resolve(publicSiteRoot, 'middleware.ts');
    const content = readFileSync(middleware, 'utf-8');
    expect(content).toContain('matcher');
  });

  it('health check API route exists', () => {
    const health = resolve(publicSiteRoot, 'app/api/health/route.ts');
    expect(existsSync(health)).toBe(true);
  });
});

// ─── Exercise 4: Deployment Configuration ────────────────────────────────────

describe('Exercise 4: Deployment', () => {
  const publicSiteRoot = resolve(__dirname, '../../../..', 'public-site');

  it('Dockerfile exists', () => {
    expect(existsSync(resolve(publicSiteRoot, 'Dockerfile'))).toBe(true);
  });

  it('azure-pipelines.yml exists', () => {
    expect(existsSync(resolve(publicSiteRoot, 'azure-pipelines.yml'))).toBe(true);
  });

  it('instrumentation.ts exists', () => {
    expect(existsSync(resolve(publicSiteRoot, 'instrumentation.ts'))).toBe(true);
  });

  it('next.config.ts exists and has output config', () => {
    const config = resolve(publicSiteRoot, 'next.config.ts');
    expect(existsSync(config)).toBe(true);
    const content = readFileSync(config, 'utf-8');
    expect(content).toContain('output');
  });
});
