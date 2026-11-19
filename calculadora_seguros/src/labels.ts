import { InsurancePolicyType, MoralDamageClaimant } from './types';

export const POLICY_TYPE_LABELS: Record<InsurancePolicyType, string> = {
  RCE_Vehiculos: 'RCE Vehículos',
  RCE_Clinica_Medica: 'RCE Clínica / Médica',
  RCE_General_Empresarial: 'RCE General Empresarial',
  RCC_Contractual: 'RC Contractual',
  Todo_Riesgo_Danos: 'Todo Riesgo Daños Materiales',
  Cumplimiento_Contratos: 'Cumplimiento de Contratos',
  Transporte_Mercancias: 'Transporte de Mercancías',
  Vida_Accidentes_Personales: 'Vida / Accidentes Personales',
  Responsabilidad_Directa_Estado: 'Responsabilidad Directa del Estado',
  Otra_Poliza: 'Otra Póliza'
};

export const JURISDICTIONS = ['Civil', 'Administrativo', 'Laboral', 'Comercial / Seguros', 'Civil / Comercial Seguros'];

export const RELATIONSHIP_LABELS: Record<MoralDamageClaimant['relationship'], string> = {
  victima_directa: 'Víctima directa',
  conyuge_companero: 'Cónyuge / Compañero(a)',
  padre_madre: 'Padre / Madre',
  hijo_hija: 'Hijo(a)',
  hermano_hermana: 'Hermano(a)',
  abuelo_abuela: 'Abuelo(a)',
  nieto_nieta: 'Nieto(a)',
  otro_familiar: 'Otro familiar'
};

export const DEGREE_CAPS: Record<MoralDamageClaimant['degree'], number> = {
  'Directo (Hasta 100 SMLMV)': 100,
  '1er Grado (Hasta 100 SMLMV)': 100,
  '2do Grado (Hasta 50 SMLMV)': 50,
  '3er Grado (Hasta 25 SMLMV)': 25
};

/** Grado sugerido según el parentesco (baremo Consejo de Estado, Rad. 32988). */
export const DEFAULT_DEGREE_BY_RELATIONSHIP: Record<MoralDamageClaimant['relationship'], MoralDamageClaimant['degree']> = {
  victima_directa: 'Directo (Hasta 100 SMLMV)',
  conyuge_companero: '1er Grado (Hasta 100 SMLMV)',
  padre_madre: '1er Grado (Hasta 100 SMLMV)',
  hijo_hija: '1er Grado (Hasta 100 SMLMV)',
  hermano_hermana: '2do Grado (Hasta 50 SMLMV)',
  abuelo_abuela: '2do Grado (Hasta 50 SMLMV)',
  nieto_nieta: '2do Grado (Hasta 50 SMLMV)',
  otro_familiar: '3er Grado (Hasta 25 SMLMV)'
};
