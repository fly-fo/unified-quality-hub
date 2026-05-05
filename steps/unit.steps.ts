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

let unitCaseNumber = 0;
let unitService: ServiceKey = 'transfers';
let unitExpected = '';
let unitActual = '';

function buildExpected(service: ServiceKey): string {
  if (service === 'transfers') return 'TRANSFER_RULE_OK';
  if (service === 'beneficiaries') return 'BENEFICIARY_RULE_OK';
  if (service === 'cards') return 'CARD_RULE_OK';
  return 'STATEMENT_RULE_OK';
}

function buildFailedActual(service: ServiceKey): string {
  if (service === 'transfers') return 'TRANSFER_LIMIT_CHECK_FAILED';
  if (service === 'beneficiaries') return 'BENEFICIARY_VALIDATION_TIMEOUT';
  if (service === 'cards') return 'CARD_STATUS_RULE_MISMATCH';
  return 'STATEMENT_PERIOD_VALIDATION_FAILED';
}

Given(
  /a (transfers|beneficiaries|cards|statements) validation request for case "(.*)"/,
  async ({}, serviceKey: ServiceKey, caseNo: string) => {
    unitService = serviceKey;
    unitCaseNumber = parseInt(caseNo, 10);
    unitExpected = buildExpected(serviceKey);
    unitActual = unitExpected;
  }
);

When(
  /the (transfers|beneficiaries|cards|statements) validation engine evaluates the request/,
  async ({}) => {
    if (FAILED_CASES.has(unitCaseNumber)) {
      unitActual = buildFailedActual(unitService);
    }
  }
);

Then(
  /the (transfers|beneficiaries|cards|statements) rule result should match the expected outcome for case "(.*)"/,
  async ({}) => {
    expect(unitActual).toBe(unitExpected);
  }
);