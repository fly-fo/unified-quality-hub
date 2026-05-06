import { createBdd } from 'playwright-bdd';
import * as allure from 'allure-js-commons';

const { Given, When, Then } = createBdd();

const FAILED_CASES = new Set([
  4, 9, 13, 18, 22, 27, 31,
  36, 40, 44, 49, 53, 58,
  71, 76, 79, 82, 88, 94, 99
]);

/**
 * E2E flaky demo cases.
 *
 * We make 5 E2E tests flaky:
 * one case from each failure category.
 *
 * AUTH_TOKEN_EXPIRED       → 036
 * PAYMENT_GATEWAY_502      → 022
 * ORDER_SCHEMA_MISMATCH    → 031
 * UI_CART_BUTTON_HIDDEN    → 044
 * PROFILE_SYNC_TIMEOUT     → 040
 *
 * API:  5 flaky tests
 * E2E:  5 flaky tests
 * Unit: 5 flaky tests
 *
 * Total across the project: 15 flaky tests.
 */
const FLAKY_CASES = new Set([
  36, 22, 31, 44, 40
]);

type ServiceKey = 'transfers' | 'beneficiaries' | 'cards' | 'statements';

let caseNumber = 0;
let service: ServiceKey = 'transfers';
let expectedValue = '';
let actualValue = '';

function pad(num: number): string {
  return String(num).padStart(3, '0');
}

function getServiceLevel2(value: ServiceKey): string {
  if (value === 'transfers') return 'Transfers';
  if (value === 'beneficiaries') return 'Beneficiaries';
  if (value === 'cards') return 'Card Management';
  return 'Statements';
}

function getApplicationUnit(_: ServiceKey): string {
  return 'UA-Digital-Banking-Portal';
}

function getFeature(_: ServiceKey): string {
  return 'Portal Journeys';
}

function getStory(value: ServiceKey): string {
  if (value === 'transfers') return 'Transfer Journey';
  if (value === 'beneficiaries') return 'Beneficiary Journey';
  if (value === 'cards') return 'Card Journey';
  return 'Statement Journey';
}

function getSeverity(num: number): string {
  if (num <= 20) return 'critical';
  if (num <= 50) return 'normal';
  return 'minor';
}

function getExpected(value: ServiceKey): string {
  if (value === 'transfers') return 'PORTAL_TRANSFER_OK';
  if (value === 'beneficiaries') return 'PORTAL_BENEFICIARY_OK';
  if (value === 'cards') return 'PORTAL_CARD_OK';
  return 'PORTAL_STATEMENT_OK';
}

function getFailureMessage(num: number): string {
  if ([4, 36, 71, 94].includes(num)) return 'AUTH_TOKEN_EXPIRED';
  if ([9, 22, 49, 79].includes(num)) return 'PAYMENT_GATEWAY_502';
  if ([13, 31, 58, 99].includes(num)) return 'ORDER_SCHEMA_MISMATCH';
  if ([18, 44, 82, 88].includes(num)) return 'UI_CART_BUTTON_HIDDEN';
  return 'PROFILE_SYNC_TIMEOUT';
}

function isFlakyModeEnabled(): boolean {
  return process.env.DEMO_FLAKY_MODE !== 'off';
}

function getFlakyFailureRate(): number {
  const value = process.env.DEMO_FLAKY_RATE;

  if (!value) {
    return 0.5;
  }

  const parsedValue = Number(value);

  if (Number.isNaN(parsedValue)) {
    return 0.5;
  }

  if (parsedValue < 0) {
    return 0;
  }

  if (parsedValue > 1) {
    return 1;
  }

  return parsedValue;
}

function shouldFailFlakyCase(): boolean {
  if (!isFlakyModeEnabled()) {
    return false;
  }

  return Math.random() < getFlakyFailureRate();
}

async function applyMetadata() {
  await allure.displayName(`Validate ${service} portal case ${pad(caseNumber)}`);
  await allure.epic('Retail Banking');
  await allure.feature(getFeature(service));
  await allure.story(getStory(service));
  await allure.owner('Amir');
  await allure.severity(getSeverity(caseNumber) as any);
  await allure.tags('gitlab', 'playwright-bdd', 'e2e');
  await allure.label('layer', 'e2e');
  await allure.label('Business Unit', 'Retail Banking');
  await allure.label('Service Level 1', 'Daily Banking');
  await allure.label('Service Level 2', getServiceLevel2(service));
  await allure.label('Application Unit', getApplicationUnit(service));
  await allure.label('Release', process.env.RELEASE || '33.3.1');

  if (FLAKY_CASES.has(caseNumber)) {
    await allure.tag('flaky-demo');
    await allure.label('stability', 'flaky-demo');
  }
}

Given(
  /a (transfers|beneficiaries|cards|statements) portal journey for case "(.*)" is prepared/,
  async ({}, serviceKey: ServiceKey, caseNo: string) => {
    service = serviceKey;
    caseNumber = parseInt(caseNo, 10);
    expectedValue = getExpected(serviceKey);
    actualValue = expectedValue;
    await applyMetadata();
  }
);

When(
  /the (transfers|beneficiaries|cards|statements) portal journey is executed/,
  async ({}) => {
    await allure.step('Execute portal journey', async () => {
      if (!FAILED_CASES.has(caseNumber)) {
        actualValue = expectedValue;
        return;
      }

      if (FLAKY_CASES.has(caseNumber)) {
        await allure.step('Apply demo flaky behavior', async () => {
          if (shouldFailFlakyCase()) {
            actualValue = getFailureMessage(caseNumber);
          } else {
            actualValue = expectedValue;
          }
        });

        return;
      }

      actualValue = getFailureMessage(caseNumber);
    });
  }
);

Then(
  /the (transfers|beneficiaries|cards|statements) portal result should match the expected outcome for case "(.*)"/,
  async ({}) => {
    await allure.step('Validate portal result', async () => {
      if (actualValue !== expectedValue) {
        throw new Error(actualValue);
      }
    });
  }
);