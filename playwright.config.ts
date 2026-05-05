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
    ['allure-playwright', { outputFolder: 'allure-results' }]
  ],
  use: {
    headless: true
  }
});