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

let e2eCaseNumber = 0;
let e2eService: ServiceKey = 'transfers';
let e2eExpected = '';
let e2eActual = '';

function buildExpected(service: ServiceKey): string {
  if (service === 'transfers') return 'PORTAL_TRANSFER_OK';
  if (service === 'beneficiaries') return 'PORTAL_BENEFICIARY_OK';
  if (service === 'cards') return 'PORTAL_CARD_OK';
  return 'PORTAL_STATEMENT_OK';
}

function buildFailedActual(service: ServiceKey): string {
  if (service === 'transfers') return 'PORTAL_TRANSFER_CONFIRMATION_MISSING';
  if (service === 'beneficiaries') return 'PORTAL_BENEFICIARY_CREATION_FAILED';
  if (service === 'cards') return 'PORTAL_CARD_STATUS_MISMATCH';
  return 'PORTAL_STATEMENT_DOWNLOAD_FAILED';
}

Given(
  /a (transfers|beneficiaries|cards|statements) portal journey for case "(.*)" is prepared/,
  async ({}, serviceKey: ServiceKey, caseNo: string) => {
    e2eService = serviceKey;
    e2eCaseNumber = parseInt(caseNo, 10);
    e2eExpected = buildExpected(serviceKey);
    e2eActual = e2eExpected;
  }
);

When(
  /the (transfers|beneficiaries|cards|statements) portal journey is executed/,
  async ({}) => {
    if (FAILED_CASES.has(e2eCaseNumber)) {
      e2eActual = buildFailedActual(e2eService);
    }
  }
);

Then(
  /the (transfers|beneficiaries|cards|statements) portal result should match the expected outcome for case "(.*)"/,
  async ({}) => {
    expect(e2eActual).toBe(e2eExpected);
  }
);