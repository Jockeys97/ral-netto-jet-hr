export type SalaryResult = {
  grossAnnual: number;
  months: 12 | 13 | 14;
  ordinaryContributions: number;
  additionalContribution: number;
  socialContributions: number;
  taxableIncome: number;
  grossIrpef: number;
  employeeDeduction: number;
  additionalDeduction: number;
  netIrpef: number;
  regionalTax: number;
  municipalTax: number;
  taxFreeBenefit: number;
  integrativeTreatment: number;
  netAnnual: number;
  netMonthly: number;
};

type Bracket = { limit: number; rate: number };

// Model reviewed on 31 August 2026. Official traceability is documented in README.md.
const ORDINARY_EMPLOYEE_RATE = 0.0919;
const ADDITIONAL_RATE = 0.01;
const ADDITIONAL_THRESHOLD_2026 = 56_224;
const POST_1995_CONTRIBUTION_CAP_2026 = 122_295;

function progressiveTax(income: number, brackets: Bracket[]) {
  let tax = 0;
  let previousLimit = 0;
  for (const bracket of brackets) {
    const taxableSlice = Math.max(
      0,
      Math.min(income, bracket.limit) - previousLimit,
    );
    tax += taxableSlice * bracket.rate;
    previousLimit = bracket.limit;
    if (income <= bracket.limit) break;
  }
  return tax;
}

function employeeTaxDeduction(income: number) {
  if (income <= 0) return 0;
  let deduction = 0;
  if (income <= 15_000) deduction = 1_955;
  else if (income <= 28_000)
    deduction = 1_910 + 1_190 * ((28_000 - income) / 13_000);
  else if (income <= 50_000) deduction = 1_910 * ((50_000 - income) / 22_000);
  if (income > 25_000 && income <= 35_000) deduction += 65;
  return Math.max(0, deduction);
}

function taxWedgeRelief(income: number) {
  if (income <= 0) return { taxFreeBenefit: 0, additionalDeduction: 0 };
  if (income <= 20_000) {
    const rate = income <= 8_500 ? 0.071 : income <= 15_000 ? 0.053 : 0.048;
    return { taxFreeBenefit: income * rate, additionalDeduction: 0 };
  }
  if (income <= 32_000)
    return { taxFreeBenefit: 0, additionalDeduction: 1_000 };
  if (income <= 40_000)
    return {
      taxFreeBenefit: 0,
      additionalDeduction: 1_000 * ((40_000 - income) / 8_000),
    };
  return { taxFreeBenefit: 0, additionalDeduction: 0 };
}

export function calculateSalary(
  grossAnnual: number,
  months: 12 | 13 | 14 = 13,
): SalaryResult {
  const gross = Math.max(0, grossAnnual);
  // Standard case: non-managerial private employee first insured after 31/12/1995.
  const contributionBase = Math.min(gross, POST_1995_CONTRIBUTION_CAP_2026);
  const ordinaryContributions = contributionBase * ORDINARY_EMPLOYEE_RATE;
  const additionalContribution =
    Math.max(0, contributionBase - ADDITIONAL_THRESHOLD_2026) * ADDITIONAL_RATE;
  const socialContributions = ordinaryContributions + additionalContribution;
  const taxableIncome = Math.max(0, gross - socialContributions);
  const grossIrpef = progressiveTax(taxableIncome, [
    { limit: 28_000, rate: 0.23 },
    { limit: 50_000, rate: 0.33 },
    { limit: Number.POSITIVE_INFINITY, rate: 0.43 },
  ]);
  const statutoryEmployeeDeduction = employeeTaxDeduction(taxableIncome);
  const employeeDeduction = Math.min(grossIrpef, statutoryEmployeeDeduction);
  const relief = taxWedgeRelief(taxableIncome);
  const additionalDeduction = Math.min(
    Math.max(0, grossIrpef - employeeDeduction),
    relief.additionalDeduction,
  );
  const netIrpef = Math.max(
    0,
    grossIrpef - employeeDeduction - additionalDeduction,
  );
  const regionalTax =
    netIrpef > 0
      ? progressiveTax(taxableIncome, [
          { limit: 15_000, rate: 0.0123 },
          { limit: 28_000, rate: 0.0158 },
          { limit: 50_000, rate: 0.0172 },
          { limit: Number.POSITIVE_INFINITY, rate: 0.0173 },
        ])
      : 0;
  const municipalTax =
    netIrpef > 0 && taxableIncome > 23_000 ? taxableIncome * 0.008 : 0;
  // Permanent €1,200 treatment: included only below €15k when the statutory capacity test is met.
  const integrativeTreatment =
    taxableIncome <= 15_000 && grossIrpef > statutoryEmployeeDeduction - 75
      ? 1_200
      : 0;
  const netAnnual = Math.max(
    0,
    gross -
      socialContributions -
      netIrpef -
      regionalTax -
      municipalTax +
      relief.taxFreeBenefit +
      integrativeTreatment,
  );
  return {
    grossAnnual: gross,
    months,
    ordinaryContributions,
    additionalContribution,
    socialContributions,
    taxableIncome,
    grossIrpef,
    employeeDeduction,
    additionalDeduction,
    netIrpef,
    regionalTax,
    municipalTax,
    taxFreeBenefit: relief.taxFreeBenefit,
    integrativeTreatment,
    netAnnual,
    netMonthly: netAnnual / months,
  };
}
