import { useCallback, useEffect, useMemo, useState } from 'react';
import { BarChart3, Briefcase, Calculator, Car, FileText, HeartCrack, Moon, Scale, ShieldCheck, Sparkles, Stethoscope, Sun } from 'lucide-react';
import { DamagesCalculatorInput } from './types';
import { INITIAL_CALCULATOR_INPUT, PRESET_CASES } from './constants';
import { calculateDamages } from './utils/actuarialCalculations';
import { requestAiAssessment, AiResult } from './utils/aiClient';
import { formatCop } from './utils/formatters';
import CalculatorForm from './components/CalculatorForm';
import SummaryCard from './components/SummaryCard';
import ActuarialTables from './components/ActuarialTables';
import FormalReport from './components/FormalReport';
import AiAnalysis from './components/AiAnalysis';
import { Badge } from './components/ui';

type Tab = 'calc' | 'tables' | 'report' | 'ai';

const TABS: { id: Tab; label: string; icon: typeof Calculator }[] = [
  { id: 'calc', label: 'Parámetros & Calculadora', icon: Calculator },
  { id: 'tables', label: 'Cuadros Actuariales & Gráficos', icon: BarChart3 },
  { id: 'report', label: 'Dictamen & Documento Docs', icon: FileText },
  { id: 'ai', label: 'Análisis de Cobertura & IA', icon: Sparkles }
];

const PRESET_ICONS: Record<string, typeof Car> = {
  transito: Car,
  medica: Stethoscope,
  cumplimiento: Briefcase,
  fatal: HeartCrack
};

const THEME_KEY = 'calc-seguros-theme';

export default function App() {
  const [input, setInput] = useState<DamagesCalculatorInput>(INITIAL_CALCULATOR_INPUT);
  const [tab, setTab] = useState<Tab>('calc');
  const [dark, setDark] = useState(() => localStorage.getItem(THEME_KEY) !== 'light');
  const [aiResult, setAiResult] = useState<AiResult | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiInputSnapshot, setAiInputSnapshot] = useState<DamagesCalculatorInput | null>(null);

  const breakdown = useMemo(() => calculateDamages(input), [input]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem(THEME_KEY, dark ? 'dark' : 'light');
  }, [dark]);

  const update = useCallback(<K extends keyof DamagesCalculatorInput>(key: K, value: DamagesCalculatorInput[K]) => {
    setInput((prev) => ({ ...prev, [key]: value }));
  }, []);

  const applyPreset = (key: string) => {
    const preset = PRESET_CASES[key];
    if (!preset) return;
    setInput((prev) => ({
      ...preset.data,
      moralDamageClaimants: preset.data.moralDamageClaimants.map((c) => ({ ...c })),
      smlmvCop: prev.smlmvCop,
      ipcIndexFactor: prev.ipcIndexFactor
    }));
    setAiResult(null);
    setAiInputSnapshot(null);
  };

  const runAi = async () => {
    setTab('ai');
    setAiLoading(true);
    const snapshot = input;
    const result = await requestAiAssessment(snapshot, breakdown);
    setAiResult(result);
    setAiInputSnapshot(snapshot);
    setAiLoading(false);
  };

  const kpis = [
    { label: 'Perjuicios Patrimoniales', sub: 'Daño emergente + Lucro cesante', value: breakdown.totalPatrimonialDamages, tone: 'text-sky-400', ring: 'ring-sky-500/20' },
    { label: 'Perjuicios Inmateriales', sub: 'Moral + Salud + Bienes constitucionales', value: breakdown.totalExtrapatrimonialDamages, tone: 'text-violet-400', ring: 'ring-violet-500/20' },
    { label: 'Total Perjuicio Liquidado', sub: '100% tasación pericial', value: breakdown.grandTotalDamages, tone: 'text-amber-400', ring: 'ring-amber-500/30' },
    { label: 'Exigible a Aseguradora', sub: 'Límite póliza + Mora Art. 1080 C.Co.', value: breakdown.totalInsurerPayableWithInterest, tone: 'text-emerald-400', ring: 'ring-emerald-500/30' }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="no-print border-b border-slate-800 bg-slate-950/70 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 ring-1 ring-amber-500/40">
                <ShieldCheck className="h-7 w-7 text-amber-400" />
              </div>
              <div>
                <h1 className="font-display text-2xl font-bold leading-tight text-slate-100 sm:text-3xl">
                  Calculadora de Perjuicios, Daños e Indemnizaciones de Seguros
                </h1>
                <div className="mt-2 flex flex-wrap gap-2">
                  <Badge>
                    <Scale className="h-3 w-3" /> Derecho de Seguros & Responsabilidad Civil
                  </Badge>
                  <Badge tone="sky">Fórmulas CSJ & Consejo de Estado</Badge>
                </div>
              </div>
            </div>
            <button
              onClick={() => setDark((d) => !d)}
              className="self-start rounded-lg border border-slate-700 p-2 text-slate-300 hover:text-amber-400"
              aria-label={dark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
              title={dark ? 'Modo claro' : 'Modo oscuro'}
            >
              {dark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-2">
            <span className="mr-1 text-xs uppercase tracking-wider text-slate-500">Plantillas:</span>
            {Object.entries(PRESET_CASES).map(([key, p]) => {
              const Icon = PRESET_ICONS[key] ?? Car;
              return (
                <button
                  key={key}
                  onClick={() => applyPreset(key)}
                  title={p.description}
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-sm text-slate-200 hover:border-amber-500/60 hover:text-amber-400"
                >
                  <Icon className="h-4 w-4" /> {p.label}
                </button>
              );
            })}
          </div>

          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {kpis.map((k) => (
              <div key={k.label} className={`rounded-xl border border-slate-800 bg-slate-900/90 p-4 ring-1 ${k.ring}`}>
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">{k.label}</div>
                <div className={`mt-1 font-mono text-xl font-bold sm:text-2xl ${k.tone}`}>{formatCop(k.value)}</div>
                <div className="mt-0.5 text-[11px] text-slate-500">{k.sub}</div>
              </div>
            ))}
          </div>
        </div>

        <nav className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-4 sm:px-6" role="tablist">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              role="tab"
              aria-selected={tab === id}
              onClick={() => setTab(id)}
              className={`inline-flex shrink-0 items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition ${
                tab === id ? 'border-amber-500 text-amber-400' : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className="h-4 w-4" /> {label}
            </button>
          ))}
        </nav>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        {tab === 'calc' && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <CalculatorForm input={input} breakdown={breakdown} update={update} />
            </div>
            <div className="lg:col-span-1">
              <SummaryCard input={input} breakdown={breakdown} onAi={runAi} onOpenReport={() => setTab('report')} />
            </div>
          </div>
        )}
        {tab === 'tables' && <ActuarialTables input={input} breakdown={breakdown} />}
        {tab === 'report' && <FormalReport input={input} breakdown={breakdown} />}
        {tab === 'ai' && <AiAnalysis result={aiResult} loading={aiLoading} stale={aiInputSnapshot !== null && aiInputSnapshot !== input} onGenerate={runAi} />}
      </main>

      <footer className="no-print border-t border-slate-800 py-6 text-center text-xs text-slate-500">
        Herramienta de apoyo pericial. Constantes: interés puro 6% E.A. (0,4867% mensual) · Vida probable DANE (H {74.8} / M {80.4}) · Arts. 1077, 1080, 1081 y 1089 C.Co.
      </footer>
    </div>
  );
}
