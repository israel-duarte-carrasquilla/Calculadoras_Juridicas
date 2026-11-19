import { DamagesCalculatorInput } from './types';

export const CURRENT_SMLMV = 1300000;
export const LEGAL_INTEREST_RATE_MONTHLY = 0.004867; // Tasa mensual pura equivalente al 6% E.A.
export const DEFAULT_IBC_MORATORY_RATE = 26.5; // Tasa moratoria Art. 1080 C.Co. (1.5x IBC)
export const LIFE_EXPECTANCY_FEMALE = 80.4; // DANE
export const LIFE_EXPECTANCY_MALE = 74.8;   // DANE
export const DEFAULT_IPC_INDEX_FACTOR = 1.085;

export const INITIAL_CALCULATOR_INPUT: DamagesCalculatorInput = {
  caseTitle: 'Reclamación Judicial de Siniestro RCE - Vehicular',
  radicado: '11001-31-03-015-2024-00452-00',
  jurisdiction: 'Civil / Comercial Seguros',
  claimantName: 'Carlos Andrés Restrepo Gómez',
  defendantName: 'Transportes Terrestres Andinos S.A.S.',
  insuranceCompanyName: 'Seguros del Estado S.A.',
  policyNumber: 'AUTO-RCE-8849201',
  policyType: 'RCE_Vehiculos',

  incidentDate: '2023-05-15',
  calculationDate: new Date().toISOString().split('T')[0],
  claimFilingDate: '2023-11-20',

  victimAgeAtIncident: 34,
  victimGender: 'M',
  baseMonthlyIncome: 3500000,
  includeSocialBenefits: true,
  pclPercentage: 28.5,

  materialDamagesPast: 18500000,
  materialDamagesFuture: 8000000,
  applyIpcIndexation: true,

  moralDamageClaimants: [
    {
      id: 'claimant-1',
      name: 'Carlos Andrés Restrepo Gómez',
      relationship: 'victima_directa',
      degree: 'Directo (Hasta 100 SMLMV)',
      claimedSmlmv: 60,
      notes: 'Víctima directa por afectación psicofísica y pérdida de movilidad'
    },
    {
      id: 'claimant-2',
      name: 'María Camila Gómez (Madre)',
      relationship: 'padre_madre',
      degree: '1er Grado (Hasta 100 SMLMV)',
      claimedSmlmv: 40,
      notes: 'Madre - Aflicción profunda y alteración del núcleo familiar'
    },
    {
      id: 'claimant-3',
      name: 'Laura Sofía Restrepo (Hija Menor)',
      relationship: 'hijo_hija',
      degree: '1er Grado (Hasta 100 SMLMV)',
      claimedSmlmv: 50,
      notes: 'Hija menor de 6 años al momento del accidente'
    }
  ],
  healthDamageSmlmv: 40,
  constitutionalRightsSmlmv: 15,

  insuredLimitCop: 400000000,
  deductiblePercentage: 10,
  deductibleMinCop: 5000000,
  actualTotalValueCop: 400000000,
  applyInfraseguroRule: false,

  calculateArt1080Interest: true,
  effectiveAnnualMoratoryRate: DEFAULT_IBC_MORATORY_RATE,

  customNotes: 'Colisión lateral en vía intermunicipal provocada por camión de carga pesada. Conductor asegurado omitió señal de pare. Dictamen de Junta Regional de Calificación determinó PCL del 28.5% por secuelas ortopédicas y neurológicas.'
};

export const PRESET_CASES: Record<string, { label: string; description: string; data: DamagesCalculatorInput }> = {
  transito: {
    label: 'RCE Tránsito',
    description: 'Accidente vehicular, PCL 28.5%, póliza RCE $400M, deducible 10%',
    data: {
      ...INITIAL_CALCULATOR_INPUT,
      caseTitle: 'Colisión Vehicular RCE - Conductor Afectado',
      policyType: 'RCE_Vehiculos',
      victimAgeAtIncident: 34,
      victimGender: 'M',
      baseMonthlyIncome: 3500000,
      includeSocialBenefits: true,
      pclPercentage: 28.5,
      materialDamagesPast: 18500000,
      materialDamagesFuture: 8000000,
      insuredLimitCop: 400000000,
      deductiblePercentage: 10,
      deductibleMinCop: 5000000,
      healthDamageSmlmv: 35,
      constitutionalRightsSmlmv: 15
    }
  },
  medica: {
    label: 'RCE Médica',
    description: 'Mala praxis quirúrgica, mujer 45 años, PCL 52%, póliza $800M, deducible 5%',
    data: {
      caseTitle: 'Responsabilidad Civil Profesional Médica e Institucional',
      radicado: '05001-31-03-008-2023-00911-00',
      jurisdiction: 'Civil',
      claimantName: 'Dra. Beatriz Helena Morales',
      defendantName: 'Clínica Quirúrgica Santa María S.A.',
      insuranceCompanyName: 'Chubb Seguros Colombia S.A.',
      policyNumber: 'MED-MAL-2023-4902',
      policyType: 'RCE_Clinica_Medica',
      incidentDate: '2023-02-10',
      calculationDate: new Date().toISOString().split('T')[0],
      claimFilingDate: '2023-09-01',
      victimAgeAtIncident: 45,
      victimGender: 'F',
      baseMonthlyIncome: 8500000,
      includeSocialBenefits: true,
      pclPercentage: 52.0,
      materialDamagesPast: 45000000,
      materialDamagesFuture: 32000000,
      applyIpcIndexation: true,
      moralDamageClaimants: [
        {
          id: 'claimant-m1',
          name: 'Beatriz Helena Morales (Víctima)',
          relationship: 'victima_directa',
          degree: 'Directo (Hasta 100 SMLMV)',
          claimedSmlmv: 80,
          notes: 'Pérdida total del ejercicio profesional como cirujana'
        },
        {
          id: 'claimant-m2',
          name: 'Felipe Vargas (Cónyuge)',
          relationship: 'conyuge_companero',
          degree: '1er Grado (Hasta 100 SMLMV)',
          claimedSmlmv: 60,
          notes: 'Afectación a la vida conyugal'
        },
        {
          id: 'claimant-m3',
          name: 'Alejandro Vargas (Hijo)',
          relationship: 'hijo_hija',
          degree: '1er Grado (Hasta 100 SMLMV)',
          claimedSmlmv: 50
        }
      ],
      healthDamageSmlmv: 70,
      constitutionalRightsSmlmv: 30,
      insuredLimitCop: 800000000,
      deductiblePercentage: 5,
      deductibleMinCop: 10000000,
      actualTotalValueCop: 800000000,
      applyInfraseguroRule: false,
      calculateArt1080Interest: true,
      effectiveAnnualMoratoryRate: 26.5,
      customNotes: 'Falla médica durante intervención laparoscópica abdominal con perforación de asa intestinal y choque séptico consecuente. Dejó secuelas funcionales irreversibles con PCL del 52%.'
    }
  },
  cumplimiento: {
    label: 'Cumplimiento',
    description: 'Incumplimiento de contrato de obra pública/privada, daño patrimonial puro $225M, póliza $250M',
    data: {
      caseTitle: 'Reclamación Siniestro Póliza de Cumplimiento de Contrato',
      radicado: 'CUMP-2024-OBRA-034',
      jurisdiction: 'Comercial / Seguros',
      claimantName: 'Consorcio Vial Metropolitano (Asegurado / Beneficiario)',
      defendantName: 'Constructora Cimientos Andinos S.A.S. (Afianzado)',
      insuranceCompanyName: 'Aseguradora Solidaria de Colombia',
      policyNumber: 'CUMP-9948201-2023',
      policyType: 'Cumplimiento_Contratos',
      incidentDate: '2023-08-15',
      calculationDate: new Date().toISOString().split('T')[0],
      claimFilingDate: '2023-10-10',
      victimAgeAtIncident: 40,
      victimGender: 'M',
      baseMonthlyIncome: 0,
      includeSocialBenefits: false,
      pclPercentage: 0,
      materialDamagesPast: 180000000,
      materialDamagesFuture: 45000000,
      applyIpcIndexation: true,
      moralDamageClaimants: [],
      healthDamageSmlmv: 0,
      constitutionalRightsSmlmv: 0,
      insuredLimitCop: 250000000,
      deductiblePercentage: 0,
      deductibleMinCop: 0,
      actualTotalValueCop: 250000000,
      applyInfraseguroRule: false,
      calculateArt1080Interest: true,
      effectiveAnnualMoratoryRate: 26.5,
      customNotes: 'Abandono injustificado de obra de pavimentación vial e incumplimiento del cronograma pactado. El beneficiario tuvo que contratar sobrecostos de estabilización y penalidades a terceros.'
    }
  },
  fatal: {
    label: 'Siniestro Fatal',
    description: 'Fallecimiento (PCL 100%), 5 beneficiarios en 1er grado (80-100 SMLMV c/u), póliza $600M',
    data: {
      caseTitle: 'Siniestro Fatal RCE - Muerte en Accidente de Tránsito',
      radicado: '68001-31-03-004-2023-00512-00',
      jurisdiction: 'Civil',
      claimantName: 'Familia Morales Quintero (Sucesores y Damnificados)',
      defendantName: 'Empresa de Transporte Interdepartamental Los Andes',
      insuranceCompanyName: 'Seguros Bolívar S.A.',
      policyNumber: 'RCE-COLECTIVO-77301',
      policyType: 'RCE_Vehiculos',
      incidentDate: '2023-03-20',
      calculationDate: new Date().toISOString().split('T')[0],
      claimFilingDate: '2023-07-15',
      victimAgeAtIncident: 38,
      victimGender: 'M',
      baseMonthlyIncome: 4800000,
      includeSocialBenefits: true,
      pclPercentage: 100.0,
      materialDamagesPast: 22000000,
      materialDamagesFuture: 15000000,
      applyIpcIndexation: true,
      moralDamageClaimants: [
        {
          id: 'fat-1',
          name: 'Andrea Quintero (Cónyuge Supérstite)',
          relationship: 'conyuge_companero',
          degree: '1er Grado (Hasta 100 SMLMV)',
          claimedSmlmv: 100,
          notes: 'Cónyuge supérstite, unión matrimonial 14 años'
        },
        {
          id: 'fat-2',
          name: 'Mateo Morales Quintero (Hijo Menor 1)',
          relationship: 'hijo_hija',
          degree: '1er Grado (Hasta 100 SMLMV)',
          claimedSmlmv: 100,
          notes: 'Hijo de 8 años'
        },
        {
          id: 'fat-3',
          name: 'Valentina Morales Quintero (Hija Menor 2)',
          relationship: 'hijo_hija',
          degree: '1er Grado (Hasta 100 SMLMV)',
          claimedSmlmv: 100,
          notes: 'Hija de 11 años'
        },
        {
          id: 'fat-4',
          name: 'Guillermo Morales (Padre)',
          relationship: 'padre_madre',
          degree: '1er Grado (Hasta 100 SMLMV)',
          claimedSmlmv: 80,
          notes: 'Padre dependiente'
        },
        {
          id: 'fat-5',
          name: 'Esperanza Duarte (Madre)',
          relationship: 'padre_madre',
          degree: '1er Grado (Hasta 100 SMLMV)',
          claimedSmlmv: 80,
          notes: 'Madre de la víctima'
        }
      ],
      healthDamageSmlmv: 0,
      constitutionalRightsSmlmv: 50,
      insuredLimitCop: 600000000,
      deductiblePercentage: 10,
      deductibleMinCop: 5000000,
      actualTotalValueCop: 600000000,
      applyInfraseguroRule: false,
      calculateArt1080Interest: true,
      effectiveAnnualMoratoryRate: 26.5,
      customNotes: 'Volcamiento de bus intermunicipal por exceso de velocidad y falla en el sistema de frenos. Fallecimiento instantáneo de padre de familia de 38 años, sostén único del hogar.'
    }
  }
};
