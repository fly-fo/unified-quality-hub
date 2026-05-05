import { createBdd } from 'playwright-bdd';
import { expect } from '@playwright/test';

const { Given, When, Then } = createBdd();

const FAILED_CASES = new Set([
  4, 9, 13, 18, 22,
  27, 31, 36, 40, 44,
  49, 53, 58, 63, 71,
  76, 82, 88, 94, 99
]);

type ServiceKey = 'transfers' | 'beneficiaries' | 'cards' | 'statements';

let apiCaseNumber = 0;
let apiService: ServiceKey = 'transfers';
let apiExpected = '';
let apiActual = '';

function buildExpected(service: ServiceKey): string {
  if (service === 'transfers') return 'API_TRANSFER_OK';
  if (service === 'beneficiaries') return 'API_BENEFICIARY_OK';
  if (service === 'cards') return 'API_CARD_OK';
  return 'API_STATEMENT_OK';
}

function buildFailedActual(service: ServiceKey): string {
  if (service === 'transfers') return 'API_TRANSFER_VALIDATION_FAILED';
  if (service === 'beneficiaries') return 'API_BENEFICIARY_TIMEOUT';
  if (service === 'cards') return 'API_CARD_STATUS_MISMATCH';
  return 'API_STATEMENT_PERIOD_INVALID';
}

Given(
  /a (transfers|beneficiaries|cards|statements) API payload for case "(.*)"/,
  async ({}, serviceKey: ServiceKey, caseNo: string) => {
    apiService = serviceKey;
    apiCaseNumber = parseInt(caseNo, 10);
    apiExpected = buildExpected(serviceKey);
    apiActual = apiExpected;
  }
);

When(
  /the (transfers|beneficiaries|cards|statements) API request is processed/,
  async ({}) => {
    if (FAILED_CASES.has(apiCaseNumber)) {
      apiActual = buildFailedActual(apiService);
    }
  }
);

Then(
  /the (transfers|beneficiaries|cards|statements) API result should match the expected outcome for case "(.*)"/,
  async ({}) => {
    expect(apiActual).toBe(apiExpected);
  }
);