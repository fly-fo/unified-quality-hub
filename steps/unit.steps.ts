import { createBdd } from 'playwright-bdd';
import * as allure from 'allure-js-commons';

const { Given, When, Then } = createBdd();

const FAILED_CASES = new Set([
  4, 9, 13, 18, 22, 27, 31,
  36, 40, 44, 49, 53, 58,
  71, 76, 79, 82, 88, 94, 99
]);

/**
 * Unit flaky demo cases.
 *
 * We make 5 Unit tests flaky:
 * one case from each failure category.
 *
 * AUTH_TOKEN_EXPIRED       → 071
 * PAYMENT_GATEWAY_502      → 049
 * ORDER_SCHEMA_MISMATCH    → 058
 * UI_CART_BUTTON_HIDDEN    → 082
 * PROFILE_SYNC_TIMEOUT     → 053
 *
 * API:  5 flaky tests
 * E2E:  5 flaky tests
 * Unit: 5 flaky tests
 *
 * Total across the project: 15 flaky tests.
 */
const FLAKY_CASES = new Set([
  71, 49, 58, 82, 53
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

function getApplicationUnit(value: ServiceKey): string {
  if (value === 'transfers') return 'UA-Payments-Orchestrator';
  if (value === 'beneficiaries') return 'UA-Beneficiary-Service';
  if (value === 'cards') return 'UA-Card-Control-Service';
  return 'UA-Statement-Service';
}

function getFeature(value: ServiceKey): string {
  if (value === 'transfers') return 'Payments';
  if (value === 'beneficiaries') return 'Beneficiaries';
  if (value === 'cards') return 'Cards';
  return 'Statements';
}

function getStory(value: ServiceKey): string {
  if (value === 'transfers') return 'Transfer Validation';
  if (value === 'beneficiaries') return 'Beneficiary Validation';
  if (value === 'cards') return 'Card Rules';
  return 'Statement Rules';
}

function getSeverity(num: number): string {
  if (num <= 20) return 'critical';
  if (num <= 50) return 'normal';
  return 'minor';
}

function getExpected(value: ServiceKey): string {
  if (value === 'transfers') return 'TRANSFER_RULE_OK';
  if (value === 'beneficiaries') return 'BENEFICIARY_RULE_OK';
  if (value === 'cards') return 'CARD_RULE_OK';
  return 'STATEMENT_RULE_OK';
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
  await allure.displayName(`Validate ${service} rule ${pad(caseNumber)}`);
  await allure.epic('Retail Banking');
  await allure.feature(getFeature(service));
  await allure.story(getStory(service));
  await allure.owner('Amir');
  await allure.severity(getSeverity(caseNumber) as any);
  await allure.tags('gitlab', 'playwright-bdd', 'unit');
  await allure.label('layer', 'unit');
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
  /a (transfers|beneficiaries|cards|statements) validation request for case "(.*)"/,
  async ({}, serviceKey: ServiceKey, caseNo: string) => {
    service = serviceKey;
    caseNumber = parseInt(caseNo, 10);
    expectedValue = getExpected(serviceKey);
    actualValue = expectedValue;
    await applyMetadata();
  }
);

When(
  /the (transfers|beneficiaries|cards|statements) validation engine evaluates the request/,
  async ({}) => {
    await allure.step('Evaluate validation rule', async () => {
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
  /the (transfers|beneficiaries|cards|statements) rule result should match the expected outcome for case "(.*)"/,
  async ({}) => {
    await allure.step('Validate unit result', async () => {
      if (actualValue !== expectedValue) {
        throw new Error(actualValue);
      }
    });
  }
);