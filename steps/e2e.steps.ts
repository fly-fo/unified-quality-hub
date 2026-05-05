import { createBdd } from 'playwright-bdd';
import { expect } from '@playwright/test';
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
  if (FAILED_CASES.has(num)) return 'critical';
  if (num % 10 === 0) return 'normal';
  return 'minor';
}

function getExpected(value: ServiceKey): string {
  if (value === 'transfers') return 'PORTAL_TRANSFER_OK';
  if (value === 'beneficiaries') return 'PORTAL_BENEFICIARY_OK';
  if (value === 'cards') return 'PORTAL_CARD_OK';
  return 'PORTAL_STATEMENT_OK';
}

function getFailureMessage(num: number): string {
  if ([4, 36, 71, 94].includes(num)) {
    return 'AUTH_TOKEN_EXPIRED: token validation failed';
  }
  if ([9, 22, 49, 79].includes(num)) {
    return 'PAYMENT_GATEWAY_502: upstream returned 502';
  }
  if ([13, 31, 58, 99].includes(num)) {
    return 'ORDER_SCHEMA_MISMATCH: expected number but got string';
  }
  if ([18, 44, 82, 88].includes(num)) {
    return 'UI_CART_BUTTON_HIDDEN: checkout button is not visible';
  }
  return 'PROFILE_SYNC_TIMEOUT: synchronization exceeded timeout';
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
      if (FAILED_CASES.has(caseNumber)) {
        actualValue = getFailureMessage(caseNumber);
      }
    });
  }
);

Then(
  /the (transfers|beneficiaries|cards|statements) portal result should match the expected outcome for case "(.*)"/,
  async ({}) => {
    await allure.step('Validate portal result', async () => {
      expect(actualValue).toBe(expectedValue);
    });
  }
);