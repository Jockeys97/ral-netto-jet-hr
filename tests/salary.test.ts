import assert from 'node:assert/strict';
import test from 'node:test';

import { calculateSalary } from '../lib/salary.ts';

function closeTo(actual: number, expected: number, tolerance = 0.01) {
  assert.ok(
    Math.abs(actual - expected) <= tolerance,
    `expected ${actual} to be within ${tolerance} of ${expected}`,
  );
}

const cases = [
  {
    ral: 25_000,
    expected: {
      contributions: 2_297.5,
      taxable: 22_702.5,
      grossIrpef: 5_221.575,
      employeeDeduction: 2_394.925,
      netIrpef: 1_826.65,
      regional: 306.1995,
      municipal: 0,
      totalTaxes: 2_132.8495,
      totalDeductions: 4_430.3495,
      netAnnual: 20_569.6505,
      netMonthly: 1_582.2808076923,
    },
  },
  {
    ral: 30_000,
    expected: {
      contributions: 2_757,
      taxable: 27_243,
      grossIrpef: 6_265.89,
      employeeDeduction: 2_044.2946153846,
      netIrpef: 3_221.5953846154,
      regional: 377.9394,
      municipal: 217.944,
      totalTaxes: 3_817.4787846154,
      totalDeductions: 6_574.4787846154,
      netAnnual: 23_425.5212153846,
      netMonthly: 1_801.9631704142,
    },
  },
  {
    ral: 35_000,
    expected: {
      contributions: 3_216.5,
      taxable: 31_783.5,
      grossIrpef: 7_688.555,
      employeeDeduction: 1_646.5234090909,
      netIrpef: 5_042.0315909091,
      regional: 454.9762,
      municipal: 254.268,
      totalTaxes: 5_751.2757909091,
      totalDeductions: 8_967.7757909091,
      netAnnual: 26_032.2242090909,
      netMonthly: 2_002.4787853147,
    },
  },
  {
    ral: 50_000,
    expected: {
      contributions: 4_595,
      taxable: 45_405,
      grossIrpef: 12_183.65,
      employeeDeduction: 398.9295454545,
      netIrpef: 11_784.7204545455,
      regional: 689.266,
      municipal: 363.24,
      totalTaxes: 12_837.2264545455,
      totalDeductions: 17_432.2264545455,
      netAnnual: 32_567.7735454545,
      netMonthly: 2_505.2133496503,
    },
  },
] as const;

for (const sample of cases) {
  void test(`breakdown for RAL €${sample.ral.toLocaleString('it-IT')}`, () => {
    const result = calculateSalary(sample.ral, 13);
    closeTo(result.socialContributions, sample.expected.contributions);
    closeTo(result.taxableIncome, sample.expected.taxable);
    closeTo(result.grossIrpef, sample.expected.grossIrpef);
    closeTo(result.employeeDeduction, sample.expected.employeeDeduction);
    closeTo(result.netIrpef, sample.expected.netIrpef);
    closeTo(result.regionalTax, sample.expected.regional);
    closeTo(result.municipalTax, sample.expected.municipal);
    closeTo(result.totalTaxes, sample.expected.totalTaxes);
    closeTo(result.totalDeductions, sample.expected.totalDeductions);
    closeTo(result.netAnnual, sample.expected.netAnnual);
    closeTo(result.netMonthly, sample.expected.netMonthly);
  });
}

void test('applies the additional 1% contribution only above the 2026 threshold', () => {
  closeTo(calculateSalary(56_224).additionalContribution, 0);
  closeTo(calculateSalary(60_000).additionalContribution, 37.76);
});

void test('caps the contribution base for the declared post-1995 standard case', () => {
  const atCap = calculateSalary(122_295);
  const overCap = calculateSalary(150_000);
  closeTo(overCap.socialContributions, atCap.socialContributions);
});

void test('includes the integrative treatment only when the low-income capacity test is met', () => {
  closeTo(calculateSalary(15_000).integrativeTreatment, 1_200);
  closeTo(calculateSalary(25_000).integrativeTreatment, 0);
});

void test('treats the Milan €23k exemption as a threshold, not a deductible allowance', () => {
  const exempt = calculateSalary(25_000);
  const liable = calculateSalary(35_000);
  closeTo(exempt.municipalTax, 0);
  closeTo(liable.municipalTax, liable.taxableIncome * 0.008);
});
