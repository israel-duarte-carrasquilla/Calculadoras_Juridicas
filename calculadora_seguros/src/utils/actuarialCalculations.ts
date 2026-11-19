import {
  DamagesCalculatorInput,
  DamagesCalculationBreakdown
} from '../types';
import {
  CURRENT_SMLMV,
  LEGAL_INTEREST_RATE_MONTHLY,
  LIFE_EXPECTANCY_FEMALE,
  LIFE_EXPECTANCY_MALE,
  DEFAULT_IPC_INDEX_FACTOR
} from '../constants';

export function calculateDamages(input: DamagesCalculatorInput): DamagesCalculationBreakdown {
  const i = LEGAL_INTEREST_RATE_MONTHLY;

  // 1. Cálculo de meses transcurridos (nPasado)
  const incidentD = new Date(input.incidentDate || '2023-01-01');
  const calcD = new Date(input.calculationDate || new Date().toISOString().split('T')[0]);

  let monthsDiff = (calcD.getFullYear() - incidentD.getFullYear()) * 12 + (calcD.getMonth() - incidentD.getMonth());
  if (calcD.getDate() < incidentD.getDate()) {
    monthsDiff -= 1;
  }
  const nPasado = Math.max(1, monthsDiff);

  // 2. Renta mensual afectada (monthlyLoss)
  const effectiveMonthlyBase = Number(input.baseMonthlyIncome || 0) * (input.includeSocialBenefits ? 1.25 : 1.0);
  const pclRatio = Math.max(0, Math.min(100, Number(input.pclPercentage || 0))) / 100;
  const monthlyLoss = effectiveMonthlyBase * pclRatio;

  // 3. Lucro Cesante Consolidado (Pasado)
  // Fórmula de renta vencida capitalizada: S = Ra * [((1 + i)^n - 1) / i]
  const compoundFactorPasado = (Math.pow(1 + i, nPasado) - 1) / i;
  const lucroCesantePasadoGross = monthlyLoss * compoundFactorPasado;
  const lucroCesantePasadoIndexFactor = input.applyIpcIndexation ? DEFAULT_IPC_INDEX_FACTOR : 1.0;
  const lucroCesantePasadoFinal = Math.round(lucroCesantePasadoGross * lucroCesantePasadoIndexFactor);

  // 4. Lucro Cesante Futuro (Valor Presente)
  // VA = Ra * [((1 + i)^n - 1) / (i * (1 + i)^n)]
  const lifeExp = input.victimGender === 'F' ? LIFE_EXPECTANCY_FEMALE : LIFE_EXPECTANCY_MALE;
  const currentAge = Number(input.victimAgeAtIncident || 30) + (nPasado / 12);
  const remainingYears = Math.max(0, lifeExp - currentAge);
  const nFuturo = Math.floor(remainingYears * 12);

  let lucroCesanteFuturoActuarialFactor = 0;
  let lucroCesanteFuturoFinal = 0;

  if (nFuturo > 0 && monthlyLoss > 0) {
    const powFactor = Math.pow(1 + i, nFuturo);
    lucroCesanteFuturoActuarialFactor = (powFactor - 1) / (i * powFactor);
    lucroCesanteFuturoFinal = Math.round(monthlyLoss * lucroCesanteFuturoActuarialFactor);
  }

  // 5. Daño Emergente
  const danoEmergentePasadoIndexFactor = input.applyIpcIndexation ? DEFAULT_IPC_INDEX_FACTOR : 1.0;
  const danoEmergentePasadoFinal = Math.round(Number(input.materialDamagesPast || 0) * danoEmergentePasadoIndexFactor);
  const danoEmergenteFuturoFinal = Math.round(Number(input.materialDamagesFuture || 0));

  const totalPatrimonialDamages =
    lucroCesantePasadoFinal +
    lucroCesanteFuturoFinal +
    danoEmergentePasadoFinal +
    danoEmergenteFuturoFinal;

  // 6. Perjuicios Extrapatrimoniales / Inmateriales
  const totalMoralClaimedSmlmv = (input.moralDamageClaimants || []).reduce(
    (acc, curr) => acc + Number(curr.claimedSmlmv || 0),
    0
  );
  const totalMoralDamagesCop = Math.round(totalMoralClaimedSmlmv * CURRENT_SMLMV);
  const totalHealthDamagesCop = Math.round(Number(input.healthDamageSmlmv || 0) * CURRENT_SMLMV);
  const totalConstitutionalDamagesCop = Math.round(Number(input.constitutionalRightsSmlmv || 0) * CURRENT_SMLMV);

  const totalExtrapatrimonialDamages =
    totalMoralDamagesCop +
    totalHealthDamagesCop +
    totalConstitutionalDamagesCop;

  // 7. Gran Total de Perjuicios
  const grandTotalDamages = totalPatrimonialDamages + totalExtrapatrimonialDamages;

  // 8. Reglas de Póliza, Infraseguro y Deducible
  let infraseguroFactor = 1.0;
  const insuredLimit = Number(input.insuredLimitCop || 0);
  const actualValue = Number(input.actualTotalValueCop || 0);

  if (input.applyInfraseguroRule && actualValue > insuredLimit && insuredLimit > 0) {
    infraseguroFactor = insuredLimit / actualValue;
  }

  const lossSubjectToCoverage = grandTotalDamages * infraseguroFactor;

  const deductiblePercentage = Number(input.deductiblePercentage || 0) / 100;
  const deductibleMin = Number(input.deductibleMinCop || 0);
  const calculatedDeductible = lossSubjectToCoverage * deductiblePercentage;
  const deductibleAppliedCop = Math.round(Math.max(calculatedDeductible, deductibleMin));

  const netLossAfterDeductible = Math.max(0, Math.round(lossSubjectToCoverage - deductibleAppliedCop));
  const insurancePayableLimitCop = Math.min(netLossAfterDeductible, insuredLimit);
  const insuranceUncoveredBalanceCop = Math.max(0, grandTotalDamages - insurancePayableLimitCop);

  // 9. Intereses Moratorios Especiales de Seguros (Art. 1080 C.Co.)
  let art1080DaysElapsed = 0;
  let art1080InterestCop = 0;

  if (input.calculateArt1080Interest && input.claimFilingDate) {
    const claimDate = new Date(input.claimFilingDate);
    // Art. 1077 y 1080: Un mes (30 días) para objetar o pagar
    const moraStartDate = new Date(claimDate.getTime() + 30 * 24 * 60 * 60 * 1000);
    const todayOrCalc = calcD.getTime() > moraStartDate.getTime() ? calcD : null;

    if (todayOrCalc) {
      const diffMs = todayOrCalc.getTime() - moraStartDate.getTime();
      art1080DaysElapsed = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));

      if (art1080DaysElapsed > 0 && insurancePayableLimitCop > 0) {
        const rateEA = Number(input.effectiveAnnualMoratoryRate || 26.5) / 100;
        // Tasa diaria equivalente a tasa efectiva anual: (1 + EA)^(1/365) - 1
        const dailyRate = Math.pow(1 + rateEA, 1 / 365) - 1;
        // Interés moratorio compuesto o simple diario sobre el saldo exigible:
        art1080InterestCop = Math.round(insurancePayableLimitCop * (dailyRate * art1080DaysElapsed));
      }
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

    currentSmlmvCop: CURRENT_SMLMV
  };
}
