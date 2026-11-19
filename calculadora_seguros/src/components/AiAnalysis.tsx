import { AlertTriangle, BadgeCheck, Gavel, Hourglass, Loader2, Percent, Scale, ShieldCheck, ShieldX, Sparkles, ThumbsUp } from 'lucide-react';
import { ReactNode } from 'react';
import { AiResult } from '../utils/aiClient';
import { formatCop } from '../utils/formatters';
import { Badge, Card } from './ui';

interface Props {
  result: AiResult | null;
  loading: boolean;
  stale: boolean;
  onGenerate: () => void;
}

function InfoCard({ icon, title, children }: { icon: ReactNode; title: string; children: ReactNode }) {
  return (
    <Card className="p-5">
      <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-100">
        {icon} {title}
      </div>
      <div className="space-y-2 text-sm leading-relaxed text-slate-300">{children}</div>
    </Card>
  );
}

export default function AiAnalysis({ result, loading, stale, onGenerate }: Props) {
  const a = result?.assessment;

  return (
    <div className="space-y-6">
      <Card className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="font-display text-lg font-semibold text-amber-400">Análisis de Cobertura & Dictamen Estratégico</h3>
          <p className="text-xs text-slate-400">Gemini analiza la liquidación actual y la póliza. Si la IA no está disponible se genera un dictamen determinístico con las cifras reales.</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {result && <Badge tone={result.source === 'gemini' ? 'emerald' : 'sky'}>{result.source === 'gemini' ? 'Generado con Gemini' : 'Dictamen de respaldo'}</Badge>}
            {stale && result && <Badge tone="rose">Los parámetros cambiaron: actualice el análisis</Badge>}
          </div>
          {result?.note && <p className="mt-2 text-[11px] text-slate-500">{result.note}</p>}
        </div>
        <button
          onClick={onGenerate}
          disabled={loading}
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-amber-500 px-4 py-2.5 text-sm font-semibold text-slate-950 hover:bg-amber-400 disabled:cursor-wait disabled:opacity-60"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          {loading ? 'Analizando…' : result ? 'Actualizar análisis' : 'Generar análisis con IA'}
        </button>
      </Card>

      {!a && !loading && (
        <Card className="p-10 text-center text-sm text-slate-500">Genere el análisis para ver el dictamen estratégico, la cobertura y el rango de negociación.</Card>
      )}

      {a && (
        <>
          <InfoCard icon={<Gavel className="h-4 w-4 text-amber-400" />} title="Dictamen Estratégico Ejecutivo">
            <p>{a.executiveSummary}</p>
          </InfoCard>
          <InfoCard icon={<Scale className="h-4 w-4 text-sky-400" />} title="Sustento Actuarial y Legal">
            <p>{a.actuarialLegalBasis}</p>
          </InfoCard>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <InfoCard
              icon={a.insuranceCoverageAnalysis.isCovered ? <ShieldCheck className="h-4 w-4 text-emerald-400" /> : <ShieldX className="h-4 w-4 text-rose-400" />}
              title="Cobertura y deducible"
            >
              <Badge tone={a.insuranceCoverageAnalysis.isCovered ? 'emerald' : 'rose'}>
                {a.insuranceCoverageAnalysis.isCovered ? 'Siniestro cubierto' : 'Cobertura en discusión'}
              </Badge>
              <p className="font-medium text-slate-200">{a.insuranceCoverageAnalysis.coverageTitle}</p>
              <p>{a.insuranceCoverageAnalysis.deductibleAssessment}</p>
              <p className="text-xs text-slate-400">{a.insuranceCoverageAnalysis.proportionalRuleApplicability}</p>
            </InfoCard>
            <InfoCard icon={<Hourglass className="h-4 w-4 text-amber-400" />} title="Prescripción Art. 1081 C.Co. (2/5 años)">
              <p>{a.insuranceCoverageAnalysis.statuteOfLimitationsStatus}</p>
            </InfoCard>
            <InfoCard icon={<Percent className="h-4 w-4 text-sky-400" />} title="Intereses Moratorios Art. 1080 C.Co.">
              <p>{a.insuranceCoverageAnalysis.moratoryInterestApplicability}</p>
            </InfoCard>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <InfoCard icon={<ThumbsUp className="h-4 w-4 text-emerald-400" />} title="Fortalezas Probatorias">
              <ul className="space-y-2">
                {a.strengthsInClaim.map((s, idx) => (
                  <li key={idx} className="flex gap-2">
                    <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" /> <span>{s}</span>
                  </li>
                ))}
              </ul>
            </InfoCard>
            <InfoCard icon={<AlertTriangle className="h-4 w-4 text-rose-400" />} title="Riesgos de Objeción por la Aseguradora">
              <ul className="space-y-2">
                {a.insurerObjectionRisks.map((s, idx) => (
                  <li key={idx} className="flex gap-2">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-rose-400" /> <span>{s}</span>
                  </li>
                ))}
              </ul>
            </InfoCard>
          </div>

          <Card className="p-5">
            <h3 className="mb-4 text-sm font-semibold text-slate-100">Rango Estratégico de Negociación</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {[
                ['Piso mínimo (≈75%)', a.recommendedNegotiationRange.minimumSettlementCop, 'text-rose-400 ring-rose-500/30'],
                ['Acuerdo recomendado (≈90%)', a.recommendedNegotiationRange.recommendedSettlementCop, 'text-amber-400 ring-amber-500/30'],
                ['Meta en juicio (con mora)', a.recommendedNegotiationRange.fullLitigationTargetCop, 'text-emerald-400 ring-emerald-500/30']
              ].map(([label, value, tone]) => (
                <div key={label as string} className={`rounded-xl bg-slate-950/60 p-4 ring-1 ${tone}`}>
                  <div className="text-xs text-slate-400">{label}</div>
                  <div className="mt-1 font-mono text-lg font-bold">{formatCop(Number(value))}</div>
                </div>
              ))}
            </div>
          </Card>

          <div>
            <h3 className="mb-3 text-sm font-semibold text-slate-100">Jurisprudencia Aplicable</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {a.applicableJurisprudence.map((j, idx) => (
                <Card key={idx} className="p-4">
                  <div className="text-[11px] font-semibold uppercase tracking-wide text-sky-400">{j.court}</div>
                  <div className="mt-1 font-mono text-xs text-amber-400">{j.radicado}</div>
                  <p className="mt-2 text-sm text-slate-300">{j.summary}</p>
                </Card>
              ))}
            </div>
            {result?.source === 'gemini' && (
              <p className="mt-2 text-[11px] text-slate-500">
                Las citas generadas por IA deben verificarse en las relatorías oficiales antes de incorporarlas a un escrito judicial.
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
