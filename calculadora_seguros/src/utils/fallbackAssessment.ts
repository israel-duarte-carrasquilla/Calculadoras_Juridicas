import { DamagesCalculatorInput, DamagesCalculationBreakdown, DamagesAiAssessment } from '../types';
import { formatCop } from './formatters';

export function generateDeterministicAssessment(
  input: DamagesCalculatorInput,
  breakdown: DamagesCalculationBreakdown
): DamagesAiAssessment {
  const isLossCovered = breakdown.insurancePayableLimitCop > 0;
  const hasMoratoryInterest = breakdown.art1080InterestCop > 0;
  const isFatalOrSevere = input.pclPercentage >= 50 || input.moralDamageClaimants.length > 2;

  const minSettlement = Math.round(breakdown.insurancePayableLimitCop * 0.75);
  const recSettlement = Math.round(breakdown.insurancePayableLimitCop * 0.90 + (breakdown.art1080InterestCop * 0.5));
  const fullTarget = breakdown.totalInsurerPayableWithInterest;

  return {
    executiveSummary: `Dictamen Pericial de Perjuicios para el caso '${input.caseTitle || 'Siniestro de Seguros'}'. Se liquida un daño patrimonial total de ${formatCop(breakdown.totalPatrimonialDamages)} (Lucro Cesante Consolidado: ${formatCop(breakdown.lucroCesantePasadoFinal)}, Futuro: ${formatCop(breakdown.lucroCesanteFuturoFinal)}, y Daño Emergente: ${formatCop(breakdown.danoEmergentePasadoFinal + breakdown.danoEmergenteFuturoFinal)}) y perjuicios inmateriales por ${formatCop(breakdown.totalExtrapatrimonialDamages)}, consolidando un Gran Total de Perjuicios de ${formatCop(breakdown.grandTotalDamages)}. Tras aplicar las estipulaciones de la póliza No. ${input.policyNumber || 'N/A'} (deducible y límite asegurado), la indemnización líquida a cargo de ${input.insuranceCompanyName || 'la aseguradora'} asciende a ${formatCop(breakdown.insurancePayableLimitCop)}, a la cual se adicionan ${formatCop(breakdown.art1080InterestCop)} por concepto de intereses moratorios del Art. 1080 C.Co., para un total exigible de ${formatCop(breakdown.totalInsurerPayableWithInterest)}.`,

    actuarialLegalBasis: `La liquidación patrimonial se sustenta en la doctrina actuarial unificada de la Sala de Casación Civil de la Corte Suprema de Justicia (Sentencia SC-21822-2017 y SC10214-2017) y del Consejo de Estado (Sección Tercera, Rad. 32988). Para el lucro cesante consolidado se aplicó la fórmula de anualidad vencida capitalizada con tasa de interés puro legal del 6% E.A. (i = 0.004867 mensual), con indexación por IPC. El lucro cesante futuro se cuantificó a valor presente actuarial descontado según la tabla de expectativa de vida del DANE (${breakdown.lifeExpectancyYears} años). Los perjuicios morales y a la salud se tasaron en salarios mínimos legales mensuales conforme a los topes unificados de hasta 100 SMLMV por persona para primer grado de consanguinidad.`,

    insuranceCoverageAnalysis: {
      isCovered: isLossCovered,
      coverageTitle: `Póliza ${input.policyType.replace(/_/g, ' ')} - Amparo Básico y Anexos de Responsabilidad`,
      deductibleAssessment: `Deducible pactado del ${input.deductiblePercentage}% con mínimo de ${formatCop(input.deductibleMinCop)}. Se aplicó un deducible efectivo de ${formatCop(breakdown.deductibleAppliedCop)}, deducible que debe soportar el asegurado/tomador de acuerdo con las condiciones generales.`,
      proportionalRuleApplicability: input.applyInfraseguroRule
        ? `Aplica la regla proporcional del Art. 1089 del Código de Comercio (factor ${breakdown.infraseguroFactor.toFixed(3)}) al haberse pactado valor asegurable inferior al valor real del interés protegido.`
        : `No se configuró infraseguro ni regla proporcional del Art. 1089 C.Co.; la cobertura opera a primer riesgo o dentro de la suficiencia del valor asegurado.`,
      statuteOfLimitationsStatus: `Prescripción Art. 1081 C.Co.: La acción derivada del contrato de seguro prescribe de manera ordinaria en dos (2) años contados desde que el interesado conoció o debió conocer el hecho que da base a la acción, y extraordinariamente en cinco (5) años desde el nacimiento del derecho para toda clase de personas. Se recomienda verificar interrupción mediante reclamación formal radicada.`,
      moratoryInterestApplicability: hasMoratoryInterest
        ? `Se causan intereses moratorios especiales de conformidad con el Art. 1080 C.Co. a una tasa equivalente a 1.5 veces el Interés Bancario Corriente (${input.effectiveAnnualMoratoryRate}% E.A.), habiendo transcurrido ${breakdown.art1080DaysElapsed} días de mora desde el vencimiento del mes legal concedido por el Art. 1077 C.Co. para objetar o indemnizar.`
        : `No se computan intereses moratorios especiales del Art. 1080 C.Co. por encontrarse dentro del término legal o no registrarse fecha de reclamo con formalidades completas.`
    },

    strengthsInClaim: [
      `Acreditación probatoria y técnica consolidada mediante dictamen actuarial con sustento en fórmulas financieras estandarizadas por la Corte Suprema de Justicia.`,
      `Configuración de mora comercial del Art. 1080 del Código de Comercio, lo que genera una presión económica severa contra la aseguradora por tasa sancionatoria de 1.5 veces el IBC.`,
      `Legitimación en la causa directa de la víctima y del grupo familiar en primer grado de parentesco con topes acordes a la jurisprudencia unificada de perjuicios morales.`
    ],

    insurerObjectionRisks: [
      `Exclusión de cobertura o alegación de culpa grave/dolo del asegurado o de la víctima como eximente de responsabilidad civil.`,
      `Objeción respecto al porcentaje de Pérdida de Capacidad Laboral (PCL) o exigencia de dictamen de la Junta Nacional de Calificación de Invalidez.`,
      `Controversia sobre la inclusión del factor prestacional (+25%) o sobre el ingreso base de liquidación real sin soportes tributarios/bancarios concluyentes.`
    ],

    recommendedNegotiationRange: {
      minimumSettlementCop: minSettlement,
      recommendedSettlementCop: recSettlement,
      fullLitigationTargetCop: fullTarget
    },

    applicableJurisprudence: [
      {
        court: 'Corte Suprema de Justicia - Sala de Casación Civil',
        radicado: 'Sentencia SC10214-2017 (Rad. 11001-31-03-010-2005-00547-01)',
        summary: 'Reitera la obligación de indexar el ingreso base de liquidación y aplicar la fórmula matemática-financiera de renta constante con tasa de interés puro del 6% anual en lucro cesante.'
      },
      {
        court: 'Consejo de Estado - Sección Tercera',
        radicado: 'Sentencia de Unificación Rad. 32988 (28 de agosto de 2014)',
        summary: 'Unifica la tasación del daño moral en salarios mínimos legales (100 SMLMV para 1er nivel) y fija la naturaleza del daño a la salud como categoría autónoma del perjuicio inmaterial.'
      },
      {
        court: 'Corte Suprema de Justicia - Sala de Casación Civil',
        radicado: 'Sentencia SC21822-2017 (Rad. 05001-31-03-003-2010-00155-01)',
        summary: 'Obligación imperativa de la aseguradora de pagar intereses moratorios a 1.5 veces el IBC (Art. 1080 C.Co.) si no objeta formalmente dentro del mes siguiente a la radicación de la reclamación.'
      }
    ]
  };
}
