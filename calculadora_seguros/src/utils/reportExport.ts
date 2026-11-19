import { DamagesCalculationBreakdown, DamagesCalculatorInput } from '../types';
import { POLICY_TYPE_LABELS, RELATIONSHIP_LABELS } from '../labels';
import { LEGAL_INTEREST_RATE_MONTHLY } from '../constants';
import { formatCop, formatDateSpanish, formatNumber } from './formatters';
import { getMonthlyLoss } from './actuarialCalculations';

const esc = (v: unknown): string =>
  String(v ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const TD = 'style="border:1px solid #94a3b8;padding:6px 8px;"';
const TDR = 'style="border:1px solid #94a3b8;padding:6px 8px;text-align:right;white-space:nowrap;"';
const TH = 'style="border:1px solid #94a3b8;padding:6px 8px;background:#e2e8f0;text-align:left;"';
const THR = 'style="border:1px solid #94a3b8;padding:6px 8px;background:#e2e8f0;text-align:right;"';
const TABLE = 'style="width:100%;border-collapse:collapse;font-size:12px;margin:8px 0 16px;"';
const H2 = 'style="font-size:14px;margin:20px 0 6px;text-transform:uppercase;letter-spacing:.04em;border-bottom:2px solid #0f172a;padding-bottom:4px;"';

function row(label: string, value: string, bold = false): string {
  const b = bold ? 'font-weight:700;background:#f1f5f9;' : '';
  return `<tr><td style="border:1px solid #94a3b8;padding:6px 8px;${b}">${label}</td><td style="border:1px solid #94a3b8;padding:6px 8px;text-align:right;white-space:nowrap;${b}">${value}</td></tr>`;
}

export function buildReportHtml(input: DamagesCalculatorInput, b: DamagesCalculationBreakdown): string {
  const ra = getMonthlyLoss(input);
  const i = LEGAL_INTEREST_RATE_MONTHLY;
  const claimants = input.moralDamageClaimants
    .map(
      (c) =>
        `<tr><td ${TD}>${esc(c.name || '—')}</td><td ${TD}>${esc(RELATIONSHIP_LABELS[c.relationship])}</td><td ${TD}>${esc(c.degree)}</td><td ${TDR}>${formatNumber(c.claimedSmlmv)}</td><td ${TDR}>${formatCop(c.claimedSmlmv * b.currentSmlmvCop)}</td></tr>`
    )
    .join('');

  return `
<div style="text-align:center;margin-bottom:18px;">
  <div style="font-size:11px;letter-spacing:.2em;text-transform:uppercase;color:#475569;">República de Colombia · Dictamen Pericial (Art. 226 CGP)</div>
  <h1 style="font-size:20px;margin:8px 0 4px;">DICTAMEN PERICIAL DE LIQUIDACIÓN DE PERJUICIOS Y AFECTACIÓN DE PÓLIZA DE SEGURO</h1>
  <div style="font-size:13px;font-style:italic;">${esc(input.caseTitle)}</div>
</div>

<table ${TABLE}>
  <tr><th ${TH}>Radicado / Siniestro</th><td ${TD}>${esc(input.radicado || 'Por asignar')}</td><th ${TH}>Jurisdicción</th><td ${TD}>${esc(input.jurisdiction)}</td></tr>
  <tr><th ${TH}>Reclamante / Víctima</th><td ${TD}>${esc(input.claimantName)}</td><th ${TH}>Demandado</th><td ${TD}>${esc(input.defendantName)}</td></tr>
  <tr><th ${TH}>Aseguradora</th><td ${TD}>${esc(input.insuranceCompanyName)}</td><th ${TH}>Póliza N°</th><td ${TD}>${esc(input.policyNumber)} (${esc(POLICY_TYPE_LABELS[input.policyType])})</td></tr>
  <tr><th ${TH}>Fecha del siniestro</th><td ${TD}>${formatDateSpanish(input.incidentDate)}</td><th ${TH}>Fecha de reclamo</th><td ${TD}>${formatDateSpanish(input.claimFilingDate)}</td></tr>
  <tr><th ${TH}>Fecha de corte</th><td ${TD}>${formatDateSpanish(input.calculationDate)}</td><th ${TH}>SMLMV de referencia</th><td ${TD}>${formatCop(b.currentSmlmvCop)}</td></tr>
</table>

<h2 ${H2}>1. Antecedentes y objeto del dictamen</h2>
<p style="font-size:12.5px;line-height:1.6;text-align:justify;">${esc(input.customNotes || 'Sin antecedentes registrados.')}</p>
<p style="font-size:12.5px;line-height:1.6;text-align:justify;">El presente dictamen tasa, con fundamento técnico-actuarial, los perjuicios patrimoniales y extrapatrimoniales derivados del siniestro, y determina la porción exigible a la compañía aseguradora conforme a las condiciones de la póliza y a los artículos 1077, 1080, 1081 y 1089 del Código de Comercio.</p>

<h2 ${H2}>2. Perjuicios patrimoniales</h2>
<p style="font-size:12px;">Víctima de ${esc(input.victimAgeAtIncident)} años (${input.victimGender === 'F' ? 'mujer' : 'hombre'}), vida probable ${b.lifeExpectancyYears} años, PCL ${formatNumber(input.pclPercentage)}%. Ingreso base ${formatCop(input.baseMonthlyIncome)}${input.includeSocialBenefits ? ' + 25% prestacional' : ''}. Renta afectada (Ra): <b>${formatCop(ra)}</b>. Interés puro i = ${i} mensual (6% E.A.).</p>
<table ${TABLE}>
  <tr><th ${TH}>Concepto</th><th ${THR}>Valor</th></tr>
  ${row(`Lucro cesante consolidado: S = Ra × [((1+i)^n − 1)/i] × IPC — n = ${b.lucroCesantePasadoMonths} meses, IPC ${b.lucroCesantePasadoIndexFactor}`, formatCop(b.lucroCesantePasadoFinal))}
  ${row(`Lucro cesante futuro: VA = Ra × [((1+i)^n − 1)/(i(1+i)^n)] — n = ${b.lucroCesanteFuturoMonths} meses, factor ${b.lucroCesanteFuturoActuarialFactor.toFixed(4)}`, formatCop(b.lucroCesanteFuturoFinal))}
  ${row(`Daño emergente consolidado (IPC ${b.danoEmergentePasadoIndexFactor})`, formatCop(b.danoEmergentePasadoFinal))}
  ${row('Daño emergente futuro', formatCop(b.danoEmergenteFuturoFinal))}
  ${row('TOTAL PERJUICIOS PATRIMONIALES', formatCop(b.totalPatrimonialDamages), true)}
</table>

<h2 ${H2}>3. Perjuicios extrapatrimoniales</h2>
<table ${TABLE}>
  <tr><th ${TH}>Reclamante</th><th ${TH}>Parentesco</th><th ${TH}>Grado</th><th ${TH}>SMLMV</th><th ${TH}>Valor</th></tr>
  ${claimants || `<tr><td ${TD} colspan="5">Sin reclamantes de daño moral.</td></tr>`}
</table>
<table ${TABLE}>
  ${row('Total daño moral', formatCop(b.totalMoralDamagesCop))}
  ${row(`Daño a la salud / vida de relación (${formatNumber(input.healthDamageSmlmv)} SMLMV)`, formatCop(b.totalHealthDamagesCop))}
  ${row(`Bienes constitucionales protegidos (${formatNumber(input.constitutionalRightsSmlmv)} SMLMV)`, formatCop(b.totalConstitutionalDamagesCop))}
  ${row('TOTAL PERJUICIOS EXTRAPATRIMONIALES', formatCop(b.totalExtrapatrimonialDamages), true)}
</table>

<h2 ${H2}>4. Afectación de la póliza y obligación de la aseguradora</h2>
<table ${TABLE}>
  ${row('GRAN TOTAL DE PERJUICIOS LIQUIDADOS', formatCop(b.grandTotalDamages), true)}
  ${row(`Factor infraseguro Art. 1089 C.Co.`, b.infraseguroFactor.toFixed(4))}
  ${row(`Deducible (${formatNumber(input.deductiblePercentage)}%, mínimo ${formatCop(input.deductibleMinCop)})`, `− ${formatCop(b.deductibleAppliedCop)}`)}
  ${row('Pérdida neta tras deducible', formatCop(b.netLossAfterDeductible))}
  ${row(`Límite asegurado`, formatCop(input.insuredLimitCop))}
  ${row('Indemnización a cargo de la aseguradora', formatCop(b.insurancePayableLimitCop), true)}
  ${row(`Intereses moratorios Art. 1080 C.Co. (${b.art1080DaysElapsed} días a ${formatNumber(input.effectiveAnnualMoratoryRate)}% E.A.)`, formatCop(b.art1080InterestCop))}
  ${row('TOTAL EXIGIBLE A LA ASEGURADORA', formatCop(b.totalInsurerPayableWithInterest), true)}
  ${row('Saldo no cubierto (a cargo del responsable directo)', formatCop(b.insuranceUncoveredBalanceCop))}
</table>

<p style="font-size:11px;color:#475569;text-align:justify;">Declaración: el perito manifiesta bajo juramento que su opinión es independiente y corresponde a su real convicción profesional (Art. 226 CGP). Las cifras se calculan con las fórmulas acogidas por la Sala de Casación Civil de la Corte Suprema de Justicia y la Sección Tercera del Consejo de Estado; deben verificarse contra los soportes probatorios del proceso.</p>

<table style="width:100%;margin-top:56px;font-size:12px;"><tr>
  <td style="width:50%;text-align:center;padding:0 16px;"><div style="border-top:1px solid #0f172a;padding-top:6px;">Perito Actuarial / Liquidador</div><div style="color:#64748b;">C.C. / T.P.</div></td>
  <td style="width:50%;text-align:center;padding:0 16px;"><div style="border-top:1px solid #0f172a;padding-top:6px;">Apoderado Judicial Reclamante</div><div style="color:#64748b;">C.C. / T.P.</div></td>
</tr></table>`;
}

export function buildReportText(input: DamagesCalculatorInput, b: DamagesCalculationBreakdown): string {
  const lines = [
    'DICTAMEN PERICIAL DE LIQUIDACIÓN DE PERJUICIOS Y AFECTACIÓN DE PÓLIZA',
    input.caseTitle,
    `Radicado: ${input.radicado || 'Por asignar'} | Jurisdicción: ${input.jurisdiction}`,
    `Reclamante: ${input.claimantName} | Demandado: ${input.defendantName}`,
    `Aseguradora: ${input.insuranceCompanyName} | Póliza: ${input.policyNumber} (${POLICY_TYPE_LABELS[input.policyType]})`,
    `Siniestro: ${formatDateSpanish(input.incidentDate)} | Reclamo: ${formatDateSpanish(input.claimFilingDate)} | Corte: ${formatDateSpanish(input.calculationDate)}`,
    '',
    'PERJUICIOS PATRIMONIALES',
    `- Lucro cesante consolidado (${b.lucroCesantePasadoMonths} meses): ${formatCop(b.lucroCesantePasadoFinal)}`,
    `- Lucro cesante futuro (${b.lucroCesanteFuturoMonths} meses): ${formatCop(b.lucroCesanteFuturoFinal)}`,
    `- Daño emergente consolidado: ${formatCop(b.danoEmergentePasadoFinal)}`,
    `- Daño emergente futuro: ${formatCop(b.danoEmergenteFuturoFinal)}`,
    `= Total patrimonial: ${formatCop(b.totalPatrimonialDamages)}`,
    '',
    'PERJUICIOS EXTRAPATRIMONIALES',
    ...input.moralDamageClaimants.map(
      (c) => `- ${c.name || '—'} (${RELATIONSHIP_LABELS[c.relationship]}, ${c.degree}): ${c.claimedSmlmv} SMLMV = ${formatCop(c.claimedSmlmv * b.currentSmlmvCop)}`
    ),
    `- Daño a la salud: ${formatCop(b.totalHealthDamagesCop)}`,
    `- Bienes constitucionales: ${formatCop(b.totalConstitutionalDamagesCop)}`,
    `= Total extrapatrimonial: ${formatCop(b.totalExtrapatrimonialDamages)}`,
    '',
    `GRAN TOTAL DE PERJUICIOS: ${formatCop(b.grandTotalDamages)}`,
    `Deducible aplicado: ${formatCop(b.deductibleAppliedCop)} | Factor infraseguro: ${b.infraseguroFactor.toFixed(4)}`,
    `Indemnización a cargo de la aseguradora: ${formatCop(b.insurancePayableLimitCop)}`,
    `Intereses Art. 1080 C.Co. (${b.art1080DaysElapsed} días): ${formatCop(b.art1080InterestCop)}`,
    `TOTAL EXIGIBLE A LA ASEGURADORA: ${formatCop(b.totalInsurerPayableWithInterest)}`,
    `Saldo no cubierto: ${formatCop(b.insuranceUncoveredBalanceCop)}`
  ];
  return lines.join('\n');
}

export function downloadWordDoc(input: DamagesCalculatorInput, b: DamagesCalculationBreakdown): void {
  const html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
<head><meta charset="utf-8"><title>Dictamen Pericial</title>
<!--[if gte mso 9]><xml><w:WordDocument><w:View>Print</w:View><w:Zoom>100</w:Zoom></w:WordDocument></xml><![endif]-->
<style>@page{size:21.59cm 27.94cm;margin:2.5cm 2cm;} body{font-family:'Times New Roman',serif;color:#0f172a;}</style>
</head><body>${buildReportHtml(input, b)}</body></html>`;
  const blob = new Blob(['\ufeff', html], { type: 'application/msword' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const safeName = (input.radicado || input.caseTitle || 'dictamen').replace(/[^\w\-]+/g, '_').slice(0, 60);
  a.href = url;
  a.download = `Dictamen_Perjuicios_${safeName}.doc`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
