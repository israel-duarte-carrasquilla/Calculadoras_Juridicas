import { DamagesCalculatorInput, DamagesCalculationBreakdown } from '../types';
import {
  CURRENT_SMLMV,
  LEGAL_INTEREST_RATE_MONTHLY,
  LIFE_EXPECTANCY_FEMALE,
  LIFE_EXPECTANCY_MALE,
  DEFAULT_IPC_INDEX_FACTOR,
  DEFAULT_IBC_MORATORY_RATE
} from '../constants';

import { parseLocalDate, todayIso, monthsBetween } from './dates';

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const ART_1077_GRACE_DAYS = 30;
const SOCIAL_BENEFITS_FACTOR = 1.25;

const num = (v: unknown, fallback = 0): number => {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
};

export function getSmlmv(input: DamagesCalculatorInput): number {
  const v = num(input.smlmvCop, CURRENT_SMLMV);
  return v > 0 ? v : CURRENT_SMLMV;
}

export function getIpcFactor(input: DamagesCalculatorInput): number {
  const v = num(input.ipcIndexFactor, DEFAULT_IPC_INDEX_FACTOR);
  return v > 0 ? v : DEFAULT_IPC_INDEX_FACTOR;
}

export function calculateDamages(input: DamagesCalculatorInput): DamagesCalculationBreakdown {
  const i = LEGAL_INTEREST_RATE_MONTHLY;
  const smlmv = getSmlmv(input);
  const ipcFactor = getIpcFactor(input);

  // 1. Meses transcurridos (nPasado), mínimo 1
  const incidentD = parseLocalDate(input.incidentDate) ?? new Date();
  const calcD = parseLocalDate(input.calculationDate) ?? parseLocalDate(todayIso())!;
  const nPasado = Math.max(1, monthsBetween(incidentD, calcD));

  // 2. Renta mensual afectada (Ra)
  const effectiveMonthlyBase =
    num(input.baseMonthlyIncome) * (input.includeSocialBenefits ? SOCIAL_BENEFITS_FACTOR : 1.0);
  const pclRatio = Math.max(0, Math.min(100, num(input.pclPercentage))) / 100;
  const monthlyLoss = effectiveMonthlyBase * pclRatio;

  // 3. Lucro Cesante Consolidado: S = Ra * [((1+i)^n - 1) / i] * IPC
  const compoundFactorPasado = (Math.pow(1 + i, nPasado) - 1) / i;
  const lucroCesantePasadoGross = monthlyLoss * compoundFactorPasado;
  const lucroCesantePasadoIndexFactor = input.applyIpcIndexation ? ipcFactor : 1.0;
  const lucroCesantePasadoFinal = Math.round(lucroCesantePasadoGross * lucroCesantePasadoIndexFactor);

  // 4. Lucro Cesante Futuro: VA = Ra * [((1+i)^n - 1) / (i * (1+i)^n)]
  const lifeExp = input.victimGender === 'F' ? LIFE_EXPECTANCY_FEMALE : LIFE_EXPECTANCY_MALE;
  const currentAge = num(input.victimAgeAtIncident, 30) + nPasado / 12;
  const remainingYears = Math.max(0, lifeExp - currentAge);
  const nFuturo = Math.floor(remainingYears * 12);

  let lucroCesanteFuturoActuarialFactor = 0;
  let lucroCesanteFuturoFinal = 0;
  if (nFuturo > 0) {
    const powFactor = Math.pow(1 + i, nFuturo);
    lucroCesanteFuturoActuarialFactor = (powFactor - 1) / (i * powFactor);
    lucroCesanteFuturoFinal = Math.round(monthlyLoss * lucroCesanteFuturoActuarialFactor);
  }

  // 5. Daño Emergente
  const danoEmergentePasadoIndexFactor = input.applyIpcIndexation ? ipcFactor : 1.0;
  const danoEmergentePasadoFinal = Math.round(num(input.materialDamagesPast) * danoEmergentePasadoIndexFactor);
  const danoEmergenteFuturoFinal = Math.round(num(input.materialDamagesFuture));
  const totalPatrimonialDamages =
    lucroCesantePasadoFinal + lucroCesanteFuturoFinal + danoEmergentePasadoFinal + danoEmergenteFuturoFinal;

  // 6. Perjuicios Inmateriales
  const totalMoralSmlmv = (input.moralDamageClaimants || []).reduce((acc, c) => acc + num(c.claimedSmlmv), 0);
  const totalMoralDamagesCop = Math.round(totalMoralSmlmv * smlmv);
  const totalHealthDamagesCop = Math.round(num(input.healthDamageSmlmv) * smlmv);
  const totalConstitutionalDamagesCop = Math.round(num(input.constitutionalRightsSmlmv) * smlmv);
  const totalExtrapatrimonialDamages = totalMoralDamagesCop + totalHealthDamagesCop + totalConstitutionalDamagesCop;

  // 7. Gran Total
  const grandTotalDamages = totalPatrimonialDamages + totalExtrapatrimonialDamages;

  // 8. Póliza: infraseguro (Art. 1089 C.Co.), deducible y límite
  const insuredLimit = num(input.insuredLimitCop);
  const actualValue = num(input.actualTotalValueCop);
  const infraseguroFactor =
    input.applyInfraseguroRule && actualValue > insuredLimit && insuredLimit > 0 ? insuredLimit / actualValue : 1.0;

  const lossSubjectToCoverage = grandTotalDamages * infraseguroFactor;
  const deductibleAppliedCop = Math.round(
    Math.max(lossSubjectToCoverage * (num(input.deductiblePercentage) / 100), num(input.deductibleMinCop))
  );
  const netLossAfterDeductible = Math.max(0, Math.round(lossSubjectToCoverage - deductibleAppliedCop));
  const insurancePayableLimitCop = Math.min(netLossAfterDeductible, insuredLimit);
  const insuranceUncoveredBalanceCop = Math.max(0, grandTotalDamages - insurancePayableLimitCop);

  // 9. Mora Art. 1080 C.Co. (desde reclamo + 30 días del Art. 1077, hasta la fecha de corte)
  let art1080DaysElapsed = 0;
  let art1080InterestCop = 0;
  const claimD = parseLocalDate(input.claimFilingDate);
  if (input.calculateArt1080Interest && claimD) {
    const moraStart = new Date(claimD.getTime() + ART_1077_GRACE_DAYS * MS_PER_DAY);
    if (calcD.getTime() > moraStart.getTime()) {
      art1080DaysElapsed = Math.floor((calcD.getTime() - moraStart.getTime()) / MS_PER_DAY);
      const rateEA = num(input.effectiveAnnualMoratoryRate, DEFAULT_IBC_MORATORY_RATE) / 100;
      const dailyRate = Math.pow(1 + rateEA, 1 / 365) - 1;
      art1080InterestCop = Math.round(insurancePayableLimitCop * (dailyRate * art1080DaysElapsed));
    }
  }
  const totalInsurerPayableWithInterest = insurancePayableLimitCop + art1080InterestCop;

  return {
    lucroCesantePasadoMonths: nPasado,
    lucroCesantePasadoGross: Math.round(lucroCesantePasadoGross),
    lucroCesantePasadoIndexFactor,
    lucroCesantePasadoFinal,

    lifeExpectancyYears: lifeExp,
    lucroCesanteFuturoMonths: nFuturo,
    lucroCesanteFuturoActuarialFactor,
    lucroCesanteFuturoFinal,

    danoEmergentePasadoIndexFactor,
    danoEmergentePasadoFinal,
    danoEmergenteFuturoFinal,
    totalPatrimonialDamages,

    totalMoralDamagesCop,
    totalHealthDamagesCop,
    totalConstitutionalDamagesCop,
    totalExtrapatrimonialDamages,

    grandTotalDamages,

    infraseguroFactor,
    deductibleAppliedCop,
    netLossAfterDeductible,
    insurancePayableLimitCop,
    insuranceUncoveredBalanceCop,

    art1080DaysElapsed,
    art1080InterestCop,
    totalInsurerPayableWithInterest,

    currentSmlmvCop: smlmv
  };
}

/** Ingreso mensual afectado (Ra), expuesto para los cuadros actuariales. */
export function getMonthlyLoss(input: DamagesCalculatorInput): number {
  const base = num(input.baseMonthlyIncome) * (input.includeSocialBenefits ? SOCIAL_BENEFITS_FACTOR : 1.0);
  return base * (Math.max(0, Math.min(100, num(input.pclPercentage))) / 100);
}
