export type InsurancePolicyType =
  | 'RCE_Vehiculos'
  | 'RCE_Clinica_Medica'
  | 'RCE_General_Empresarial'
  | 'RCC_Contractual'
  | 'Todo_Riesgo_Danos'
  | 'Cumplimiento_Contratos'
  | 'Transporte_Mercancias'
  | 'Vida_Accidentes_Personales'
  | 'Responsabilidad_Directa_Estado'
  | 'Otra_Poliza';

export interface MoralDamageClaimant {
  id: string;
  name: string;
  relationship:
    | 'victima_directa'
    | 'conyuge_companero'
    | 'padre_madre'
    | 'hijo_hija'
    | 'hermano_hermana'
    | 'abuelo_abuela'
    | 'nieto_nieta'
    | 'otro_familiar';
  degree:
    | '1er Grado (Hasta 100 SMLMV)'
    | '2do Grado (Hasta 50 SMLMV)'
    | '3er Grado (Hasta 25 SMLMV)'
    | 'Directo (Hasta 100 SMLMV)';
  claimedSmlmv: number;
  notes?: string;
}

export interface DamagesCalculatorInput {
  caseTitle: string;
  radicado?: string;
  jurisdiction: string; // Civil | Administrativo | Laboral | Comercial / Seguros
  claimantName: string;
  defendantName: string;
  insuranceCompanyName: string;
  policyNumber: string;
  policyType: InsurancePolicyType;

  incidentDate: string;      // YYYY-MM-DD
  calculationDate: string;   // YYYY-MM-DD
  claimFilingDate?: string;  // YYYY-MM-DD (para Art. 1077 y 1080 C.Co.)

  victimAgeAtIncident: number;
  victimGender: 'M' | 'F';
  baseMonthlyIncome: number;
  includeSocialBenefits: boolean; // +25% factor prestacional
  pclPercentage: number;          // 0 - 100% Pérdida de Capacidad Laboral

  materialDamagesPast: number;    // Daño Emergente Consolidado
  materialDamagesFuture: number;  // Daño Emergente Futuro
  applyIpcIndexation: boolean;

  moralDamageClaimants: MoralDamageClaimant[];
  healthDamageSmlmv: number;        // 0 a 100 SMLMV
  constitutionalRightsSmlmv: number;// 0 a 100 SMLMV

  insuredLimitCop: number;
  deductiblePercentage: number;
  deductibleMinCop: number;
  actualTotalValueCop: number;
  applyInfraseguroRule: boolean;    // Art. 1089 C.Co.

  calculateArt1080Interest: boolean;
  effectiveAnnualMoratoryRate: number;

  customNotes?: string;

  /** Opcional: SMLMV de referencia editable (por defecto CURRENT_SMLMV). */
  smlmvCop?: number;
  /** Opcional: factor de indexación IPC editable (por defecto 1.085). */
  ipcIndexFactor?: number;
}

export interface DamagesCalculationBreakdown {
  lucroCesantePasadoMonths: number;
  lucroCesantePasadoGross: number;
  lucroCesantePasadoIndexFactor: number;
  lucroCesantePasadoFinal: number;

  lifeExpectancyYears: number;
  lucroCesanteFuturoMonths: number;
  lucroCesanteFuturoActuarialFactor: number;
  lucroCesanteFuturoFinal: number;

  danoEmergentePasadoIndexFactor: number;
  danoEmergentePasadoFinal: number;
  danoEmergenteFuturoFinal: number;
  totalPatrimonialDamages: number;

  totalMoralDamagesCop: number;
  totalHealthDamagesCop: number;
  totalConstitutionalDamagesCop: number;
  totalExtrapatrimonialDamages: number;

  grandTotalDamages: number;

  infraseguroFactor: number;
  deductibleAppliedCop: number;
  netLossAfterDeductible: number;
  insurancePayableLimitCop: number;
  insuranceUncoveredBalanceCop: number;

  art1080DaysElapsed: number;
  art1080InterestCop: number;
  totalInsurerPayableWithInterest: number;

  currentSmlmvCop: number;
}

export interface DamagesAiAssessment {
  executiveSummary: string;
  actuarialLegalBasis: string;
  insuranceCoverageAnalysis: {
    isCovered: boolean;
    coverageTitle: string;
    deductibleAssessment: string;
    proportionalRuleApplicability: string;
    statuteOfLimitationsStatus: string;
    moratoryInterestApplicability: string;
  };
  strengthsInClaim: string[];
  insurerObjectionRisks: string[];
  recommendedNegotiationRange: {
    minimumSettlementCop: number;
    recommendedSettlementCop: number;
    fullLitigationTargetCop: number;
  };
  applicableJurisprudence: {
    court: string;
    radicado: string;
    summary: string;
  }[];
}
