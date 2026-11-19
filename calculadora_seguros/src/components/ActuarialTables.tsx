import { ReactNode } from 'react';
import { Sigma } from 'lucide-react';
import { DamagesCalculationBreakdown, DamagesCalculatorInput } from '../types';
import { LEGAL_INTEREST_RATE_MONTHLY } from '../constants';
import { getMonthlyLoss } from '../utils/actuarialCalculations';
import { formatCop, formatNumber } from '../utils/formatters';
import { Card } from './ui';

interface Props {
  input: DamagesCalculatorInput;
  breakdown: DamagesCalculationBreakdown;
}

function FormulaCard({ title, formula, children }: { title: string; formula: string; children: ReactNode }) {
  return (
    <Card className="p-5">
      <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-100">
        <Sigma className="h-4 w-4 text-amber-400" /> {title}
      </div>
      <div className="mb-3 overflow-x-auto rounded-lg bg-slate-950/70 p-3 font-mono text-sm text-amber-400 ring-1 ring-slate-800">{formula}</div>
      <div className="space-y-1 font-mono text-xs text-slate-400">{children}</div>
    </Card>
  );
}

function Bar({ label, value, total, color }: { label: string; value: number; total: number; color: string }) {
  const pct = total > 0 ? (value / total) * 100 : 0;
  return (
    <div>
      <div className="mb-1 flex justify-between text-xs">
        <span className="text-slate-300">{label}</span>
        <span className="font-mono text-slate-400">
          {formatCop(value)} · {pct.toFixed(1)}%
        </span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-slate-800">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${Math.min(100, pct)}%` }} />
      </div>
    </div>
  );
}

export default function ActuarialTables({ input, breakdown: b }: Props) {
  const i = LEGAL_INTEREST_RATE_MONTHLY;
  const ra = getMonthlyLoss(input);
  const compoundPasado = (Math.pow(1 + i, b.lucroCesantePasadoMonths) - 1) / i;

  const rows: { cat: 'Patrimonial' | 'Extrapatrimonial'; concept: string; basis: string; value: number }[] = [
    { cat: 'Patrimonial', concept: 'Lucro cesante consolidado', basis: `${b.lucroCesantePasadoMonths} meses · IPC ${b.lucroCesantePasadoIndexFactor}`, value: b.lucroCesantePasadoFinal },
    { cat: 'Patrimonial', concept: 'Lucro cesante futuro', basis: `${b.lucroCesanteFuturoMonths} meses · vida prob. ${b.lifeExpectancyYears} años`, value: b.lucroCesanteFuturoFinal },
    { cat: 'Patrimonial', concept: 'Daño emergente consolidado', basis: `IPC ${b.danoEmergentePasadoIndexFactor}`, value: b.danoEmergentePasadoFinal },
    { cat: 'Patrimonial', concept: 'Daño emergente futuro', basis: 'Valor acreditado', value: b.danoEmergenteFuturoFinal },
    {
      cat: 'Extrapatrimonial',
      concept: 'Daño moral',
      basis: `${formatNumber(input.moralDamageClaimants.reduce((a, c) => a + c.claimedSmlmv, 0))} SMLMV · ${input.moralDamageClaimants.length} reclamantes`,
      value: b.totalMoralDamagesCop
    },
    { cat: 'Extrapatrimonial', concept: 'Daño a la salud / vida de relación', basis: `${input.healthDamageSmlmv} SMLMV`, value: b.totalHealthDamagesCop },
    { cat: 'Extrapatrimonial', concept: 'Bienes constitucionales protegidos', basis: `${input.constitutionalRightsSmlmv} SMLMV`, value: b.totalConstitutionalDamagesCop }
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <FormulaCard title="Lucro Cesante Consolidado (renta vencida capitalizada)" formula="S = Ra × [((1 + i)^n − 1) / i] × IPC">
          <div>Ra = {formatCop(ra)} (ingreso {input.includeSocialBenefits ? '× 1.25 ' : ''}× PCL {formatNumber(input.pclPercentage)}%)</div>
          <div>i = {i} mensual · n = {b.lucroCesantePasadoMonths} meses</div>
          <div>[((1 + i)^n − 1) / i] = {compoundPasado.toFixed(4)}</div>
          <div>
            S = {formatCop(ra)} × {compoundPasado.toFixed(4)} × {b.lucroCesantePasadoIndexFactor} ={' '}
            <span className="text-emerald-400">{formatCop(b.lucroCesantePasadoFinal)}</span>
          </div>
        </FormulaCard>
        <FormulaCard title="Lucro Cesante Futuro (valor presente actuarial)" formula="VA = Ra × [((1 + i)^n − 1) / (i × (1 + i)^n)]">
          <div>Ra = {formatCop(ra)} · i = {i}</div>
          <div>
            n = {b.lucroCesanteFuturoMonths} meses (vida probable {b.lifeExpectancyYears} − edad actual)
          </div>
          <div>Factor actuarial = {b.lucroCesanteFuturoActuarialFactor.toFixed(4)}</div>
          <div>
            VA = {formatCop(ra)} × {b.lucroCesanteFuturoActuarialFactor.toFixed(4)} ={' '}
            <span className="text-emerald-400">{formatCop(b.lucroCesanteFuturoFinal)}</span>
          </div>
        </FormulaCard>
      </div>

      <Card className="overflow-hidden">
        <div className="border-b border-slate-800 px-5 py-4">
          <h3 className="text-sm font-semibold text-slate-100">Cuadro de liquidación por categoría</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-950/60 text-left text-xs uppercase tracking-wide text-slate-400">
              <tr>
                <th className="px-5 py-3">Categoría</th>
                <th className="px-5 py-3">Concepto</th>
                <th className="px-5 py-3">Base de cálculo</th>
                <th className="px-5 py-3 text-right">Valor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {rows.map((r) => (
                <tr key={r.concept} className="hover:bg-slate-800/40">
                  <td className={`px-5 py-2.5 text-xs font-semibold ${r.cat === 'Patrimonial' ? 'text-sky-400' : 'text-violet-400'}`}>{r.cat}</td>
                  <td className="px-5 py-2.5 text-slate-200">{r.concept}</td>
                  <td className="px-5 py-2.5 font-mono text-xs text-slate-400">{r.basis}</td>
                  <td className="px-5 py-2.5 text-right font-mono text-slate-100">{formatCop(r.value)}</td>
                </tr>
              ))}
              <tr className="bg-slate-950/60 text-slate-300">
                <td colSpan={3} className="px-5 py-2.5 text-right text-xs uppercase">Subtotal patrimonial</td>
                <td className="px-5 py-2.5 text-right font-mono">{formatCop(b.totalPatrimonialDamages)}</td>
              </tr>
              <tr className="bg-slate-950/60 text-slate-300">
                <td colSpan={3} className="px-5 py-2.5 text-right text-xs uppercase">Subtotal extrapatrimonial</td>
                <td className="px-5 py-2.5 text-right font-mono">{formatCop(b.totalExtrapatrimonialDamages)}</td>
              </tr>
              <tr className="bg-amber-500/10">
                <td colSpan={3} className="px-5 py-3 text-right text-sm font-bold uppercase text-amber-400">Gran total</td>
                <td className="px-5 py-3 text-right font-mono text-base font-bold text-amber-400">{formatCop(b.grandTotalDamages)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="space-y-3 p-5">
          <h3 className="text-sm font-semibold text-slate-100">Composición del perjuicio</h3>
          {rows.map((r) => (
            <Bar key={r.concept} label={r.concept} value={r.value} total={b.grandTotalDamages} color={r.cat === 'Patrimonial' ? 'bg-sky-500' : 'bg-violet-500'} />
          ))}
        </Card>
        <Card className="space-y-3 p-5">
          <h3 className="text-sm font-semibold text-slate-100">Afectación de la póliza</h3>
          <Bar label="Indemnización a cargo de la aseguradora" value={b.insurancePayableLimitCop} total={b.grandTotalDamages} color="bg-emerald-500" />
          <Bar label="Deducible a cargo del asegurado" value={b.deductibleAppliedCop} total={b.grandTotalDamages} color="bg-rose-500" />
          <Bar label="Saldo no cubierto por la póliza" value={b.insuranceUncoveredBalanceCop} total={b.grandTotalDamages} color="bg-slate-500" />
          <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
            <div className="rounded-lg bg-slate-950/60 p-3">
              <div className="text-slate-400">Factor infraseguro</div>
              <div className="font-mono text-base text-slate-100">{b.infraseguroFactor.toFixed(4)}</div>
            </div>
            <div className="rounded-lg bg-slate-950/60 p-3">
              <div className="text-slate-400">Mora Art. 1080 ({b.art1080DaysElapsed} d)</div>
              <div className="font-mono text-base text-sky-400">{formatCop(b.art1080InterestCop)}</div>
            </div>
            <div className="col-span-2 rounded-lg bg-emerald-500/10 p-3">
              <div className="text-emerald-400">Total exigible a la aseguradora</div>
              <div className="font-mono text-lg font-bold text-emerald-400">{formatCop(b.totalInsurerPayableWithInterest)}</div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
