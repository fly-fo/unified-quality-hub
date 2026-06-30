import { defineConfig } from '@playwright/test';
import { defineBddConfig } from 'playwright-bdd';

const testDir = defineBddConfig({
  features: [
    'features/unit/**/*.feature',
    'features/api/**/*.feature',
    'features/e2e/**/*.feature'
  ],
  steps: [
    'steps/**/*.ts'
  ]
});

export default defineConfig({
  testDir,
  timeout: 30000,
  workers: 1,

  reporter: [
    ['line'],
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['allure-playwright', { resultsDir: 'allure-results' }]
  ],

  outputDir: 'test-results',

  use: {
    headless: true,
    trace: 'on',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure'
  }
});