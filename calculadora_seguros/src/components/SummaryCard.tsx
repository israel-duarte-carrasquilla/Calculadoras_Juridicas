import { useState } from 'react';
import { Check, Copy, FileDown, FileText, Sparkles } from 'lucide-react';
import { DamagesCalculationBreakdown, DamagesCalculatorInput } from '../types';
import { formatCop } from '../utils/formatters';
import { buildReportText, copyToClipboard, downloadWordDoc } from '../utils/reportExport';
import { Card } from './ui';

interface Props {
  input: DamagesCalculatorInput;
  breakdown: DamagesCalculationBreakdown;
  onAi: () => void;
  onOpenReport: () => void;
}

function Line({ label, value, tone = 'text-slate-200', strong = false }: { label: string; value: string; tone?: string; strong?: boolean }) {
  return (
    <div className={`flex items-baseline justify-between gap-3 py-1.5 ${strong ? 'border-t border-slate-800 pt-2.5' : ''}`}>
      <span className={`text-xs ${strong ? 'font-semibold text-slate-200' : 'text-slate-400'}`}>{label}</span>
      <span className={`font-mono text-sm ${strong ? 'font-bold' : ''} ${tone}`}>{value}</span>
    </div>
  );
}

export default function SummaryCard({ input, breakdown: b, onAi, onOpenReport }: Props) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (await copyToClipboard(buildReportText(input, b))) {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    }
  };

  return (
    <Card className="p-5 lg:sticky lg:top-6">
      <h3 className="font-display text-lg font-semibold text-amber-400">Resumen Ejecutivo</h3>
      <p className="mb-3 text-xs text-slate-500">Recalculado en tiempo real</p>

      <div className="text-[11px] font-semibold uppercase tracking-wider text-sky-400">Patrimoniales</div>
      <Line label={`Lucro cesante consolidado (${b.lucroCesantePasadoMonths} m)`} value={formatCop(b.lucroCesantePasadoFinal)} />
      <Line label={`Lucro cesante futuro (${b.lucroCesanteFuturoMonths} m)`} value={formatCop(b.lucroCesanteFuturoFinal)} />
      <Line label="Daño emergente consolidado" value={formatCop(b.danoEmergentePasadoFinal)} />
      <Line label="Daño emergente futuro" value={formatCop(b.danoEmergenteFuturoFinal)} />

      <div className="mt-3 text-[11px] font-semibold uppercase tracking-wider text-violet-400">Inmateriales</div>
      <Line label="Daño moral" value={formatCop(b.totalMoralDamagesCop)} />
      <Line label="Daño a la salud" value={formatCop(b.totalHealthDamagesCop)} />
      <Line label="Bienes constitucionales" value={formatCop(b.totalConstitutionalDamagesCop)} />

      <Line label="Gran total perjuicios" value={formatCop(b.grandTotalDamages)} tone="text-amber-400" strong />

      <div className="mt-3 text-[11px] font-semibold uppercase tracking-wider text-emerald-400">Ajustes de póliza</div>
      {b.infraseguroFactor < 1 && <Line label="Factor infraseguro" value={b.infraseguroFactor.toFixed(4)} />}
      <Line label="Deducible" value={`− ${formatCop(b.deductibleAppliedCop)}`} tone="text-rose-400" />
      <Line label="Indemnización neta" value={formatCop(b.insurancePayableLimitCop)} />
      <Line label={`Mora Art. 1080 (${b.art1080DaysElapsed} d)`} value={`+ ${formatCop(b.art1080InterestCop)}`} tone="text-sky-400" />
      <Line label="Exigible a aseguradora" value={formatCop(b.totalInsurerPayableWithInterest)} tone="text-emerald-400" strong />
      <Line label="Saldo no cubierto" value={formatCop(b.insuranceUncoveredBalanceCop)} tone="text-slate-400" />
      {input.insuredLimitCop > 0 && b.netLossAfterDeductible > input.insuredLimitCop && (
        <p className="mt-2 rounded-md bg-amber-500/10 p-2 text-[11px] text-amber-400">
          La pérdida neta supera el límite asegurado: la indemnización queda topada en {formatCop(input.insuredLimitCop)}.
        </p>
      )}

      <div className="mt-5 grid grid-cols-2 gap-2">
        <button
          onClick={onAi}
          className="col-span-2 inline-flex items-center justify-center gap-2 rounded-lg bg-amber-500 px-3 py-2.5 text-sm font-semibold text-slate-950 hover:bg-amber-400"
        >
          <Sparkles className="h-4 w-4" /> Dictamen Pericial con IA
        </button>
        <button
          onClick={onOpenReport}
          className="col-span-2 inline-flex items-center justify-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-sm font-medium text-slate-200 hover:border-amber-500/60 hover:text-amber-400"
        >
          <FileText className="h-4 w-4" /> Ver Dictamen Formal (Docs)
        </button>
        <button
          onClick={() => downloadWordDoc(input, b)}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-200 hover:border-sky-500/60 hover:text-sky-400"
        >
          <FileDown className="h-4 w-4" /> Word (.doc)
        </button>
        <button
          onClick={handleCopy}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-200 hover:border-emerald-500/60 hover:text-emerald-400"
        >
          {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />} {copied ? 'Copiado' : 'Copiar'}
        </button>
      </div>
    </Card>
  );
}
