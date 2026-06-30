import { createBdd } from 'playwright-bdd';
import * as allure from 'allure-js-commons';

const { Given, When, Then } = createBdd();

const FAILED_CASES = new Set([
  4, 9, 13, 18, 22, 27, 31,
  36, 40, 44, 49, 53, 58,
  71, 76, 79, 82, 88, 94, 99
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
  if (value === 'transfers') return 'Transfer API';
  if (value === 'beneficiaries') return 'Beneficiary API';
  if (value === 'cards') return 'Card API';
  return 'Statement API';
}

function getSeverity(num: number): string {
  if (num <= 20) return 'critical';
  if (num <= 50) return 'normal';
  return 'minor';
}

function getExpected(value: ServiceKey): string {
  if (value === 'transfers') return 'API_TRANSFER_OK';
  if (value === 'beneficiaries') return 'API_BENEFICIARY_OK';
  if (value === 'cards') return 'API_CARD_OK';
  return 'API_STATEMENT_OK';
}

function getFailureMessage(num: number): string {
  if ([4, 36, 71, 94].includes(num)) return 'AUTH_TOKEN_EXPIRED';
  if ([9, 22, 49, 79].includes(num)) return 'PAYMENT_GATEWAY_502';
  if ([13, 31, 58, 99].includes(num)) return 'ORDER_SCHEMA_MISMATCH';
  if ([18, 44, 82, 88].includes(num)) return 'UI_CART_BUTTON_HIDDEN';
  return 'PROFILE_SYNC_TIMEOUT';
}

async function applyMetadata() {
  await allure.displayName(`Validate ${service} API case ${pad(caseNumber)}`);
  await allure.epic('Retail Banking');
  await allure.feature(getFeature(service));
  await allure.story(getStory(service));
  await allure.owner('Amir');
  await allure.severity(getSeverity(caseNumber) as any);
  await allure.tags('gitlab', 'playwright-bdd', 'api');
  await allure.label('layer', 'api');
  await allure.label('Business Unit', 'Retail Banking');
  await allure.label('Service Level 1', 'Daily Banking');
  await allure.label('Service Level 2', getServiceLevel2(service));
  await allure.label('Application Unit', getApplicationUnit(service));
  await allure.label('Release', process.env.RELEASE || '33.3.1');
}

Given(
  /a (transfers|beneficiaries|cards|statements) API payload for case "(.*)"/,
  async ({}, serviceKey: ServiceKey, caseNo: string) => {
    service = serviceKey;
    caseNumber = parseInt(caseNo, 10);
    expectedValue = getExpected(serviceKey);
    actualValue = expectedValue;
    await applyMetadata();
  }
);

When(
  /the (transfers|beneficiaries|cards|statements) API request is processed/,
  async ({}) => {
    await allure.step('Process API request', async () => {
      if (FAILED_CASES.has(caseNumber)) {
        actualValue = getFailureMessage(caseNumber);
      }
    });
  }
);

Then(
  /the (transfers|beneficiaries|cards|statements) API result should match the expected outcome for case "(.*)"/,
  async ({}) => {
    await allure.step('Validate API result', async () => {
      if (actualValue !== expectedValue) {
        throw new Error(actualValue);
      }
    });
  }
);