import { useRef, useState } from 'react';
import {
  CalendarClock,
  FileText,
  HeartPulse,
  Mic,
  MicOff,
  Plus,
  ShieldCheck,
  Trash2,
  UserRound,
  Wallet
} from 'lucide-react';
import { DamagesCalculationBreakdown, DamagesCalculatorInput, InsurancePolicyType, MoralDamageClaimant } from '../types';
import { LIFE_EXPECTANCY_FEMALE, LIFE_EXPECTANCY_MALE } from '../constants';
import { DEFAULT_DEGREE_BY_RELATIONSHIP, DEGREE_CAPS, JURISDICTIONS, POLICY_TYPE_LABELS, RELATIONSHIP_LABELS } from '../labels';
import { formatCop } from '../utils/formatters';
import { Field, MoneyInput, NumberInput, Section, Toggle, inputClass } from './ui';

type Update = <K extends keyof DamagesCalculatorInput>(key: K, value: DamagesCalculatorInput[K]) => void;

interface Props {
  input: DamagesCalculatorInput;
  breakdown: DamagesCalculationBreakdown;
  update: Update;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
type SpeechRecognitionLike = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((e: any) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
  start: () => void;
  stop: () => void;
};

function getSpeechRecognition(): (new () => SpeechRecognitionLike) | null {
  const w = window as any;
  return w.SpeechRecognition || w.webkitSpeechRecognition || null;
}

function VoiceDictationButton({ onText }: { onText: (t: string) => void }) {
  const [listening, setListening] = useState(false);
  const recRef = useRef<SpeechRecognitionLike | null>(null);
  const Ctor = getSpeechRecognition();
  if (!Ctor) return null;

  const toggle = () => {
    if (listening) {
      recRef.current?.stop();
      return;
    }
    const rec = new Ctor();
    rec.lang = 'es-CO';
    rec.continuous = true;
    rec.interimResults = false;
    rec.onresult = (e: any) => {
      const chunk = Array.from(e.results as ArrayLike<any>)
        .slice(e.resultIndex)
        .map((r: any) => r[0].transcript)
        .join(' ');
      if (chunk.trim()) onText(chunk.trim());
    };
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);
    recRef.current = rec;
    rec.start();
    setListening(true);
  };

  return (
    <button
      type="button"
      onClick={toggle}
      className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium ring-1 transition ${
        listening
          ? 'animate-pulse bg-rose-500/15 text-rose-400 ring-rose-500/40'
          : 'bg-slate-800 text-slate-300 ring-slate-700 hover:text-amber-400'
      }`}
    >
      {listening ? <MicOff className="h-3.5 w-3.5" /> : <Mic className="h-3.5 w-3.5" />}
      {listening ? 'Detener dictado' : 'Dictar por voz'}
    </button>
  );
}

export default function CalculatorForm({ input, breakdown, update }: Props) {
  const smlmv = breakdown.currentSmlmvCop;
  const claimants = input.moralDamageClaimants;

  const setClaimants = (next: MoralDamageClaimant[]) => update('moralDamageClaimants', next);
  const patchClaimant = (id: string, patch: Partial<MoralDamageClaimant>) =>
    setClaimants(claimants.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  const addClaimant = () =>
    setClaimants([
      ...claimants,
      {
        id: `claimant-${Date.now()}`,
        name: '',
        relationship: 'otro_familiar',
        degree: DEFAULT_DEGREE_BY_RELATIONSHIP.otro_familiar,
        claimedSmlmv: 10
      }
    ]);

  return (
    <div className="space-y-6">
      {/* 1. Identificación */}
      <Section
        number={1}
        title="Identificación del Siniestro y Póliza"
        subtitle="Datos del proceso, partes, aseguradora y fechas relevantes (Arts. 1077, 1080 y 1081 C.Co.)"
        icon={<FileText className="h-5 w-5" />}
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Título del caso" className="sm:col-span-2">
            <input className={inputClass} value={input.caseTitle} onChange={(e) => update('caseTitle', e.target.value)} />
          </Field>
          <Field label="Radicado / N° siniestro">
            <input className={`${inputClass} font-mono`} value={input.radicado || ''} onChange={(e) => update('radicado', e.target.value)} />
          </Field>
          <Field label="Jurisdicción">
            <select className={inputClass} value={input.jurisdiction} onChange={(e) => update('jurisdiction', e.target.value)}>
              {[...new Set([input.jurisdiction, ...JURISDICTIONS])].map((j) => (
                <option key={j}>{j}</option>
              ))}
            </select>
          </Field>
          <Field label="Reclamante / Víctima">
            <input className={inputClass} value={input.claimantName} onChange={(e) => update('claimantName', e.target.value)} />
          </Field>
          <Field label="Demandado / Asegurado responsable">
            <input className={inputClass} value={input.defendantName} onChange={(e) => update('defendantName', e.target.value)} />
          </Field>
          <Field label="Compañía aseguradora">
            <input className={inputClass} value={input.insuranceCompanyName} onChange={(e) => update('insuranceCompanyName', e.target.value)} />
          </Field>
          <Field label="N° de póliza">
            <input className={`${inputClass} font-mono`} value={input.policyNumber} onChange={(e) => update('policyNumber', e.target.value)} />
          </Field>
          <Field label="Ramo de la póliza" className="sm:col-span-2">
            <select
              className={inputClass}
              value={input.policyType}
              onChange={(e) => update('policyType', e.target.value as InsurancePolicyType)}
            >
              {Object.entries(POLICY_TYPE_LABELS).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
          </Field>
          <div className="grid grid-cols-1 gap-4 sm:col-span-2 sm:grid-cols-3">
            <Field label="Fecha del siniestro">
              <input type="date" className={inputClass} value={input.incidentDate} onChange={(e) => update('incidentDate', e.target.value)} />
            </Field>
            <Field label="Fecha de reclamo radicado" hint="Inicia el mes del Art. 1077 C.Co.">
              <input
                type="date"
                className={inputClass}
                value={input.claimFilingDate || ''}
                onChange={(e) => update('claimFilingDate', e.target.value)}
              />
            </Field>
            <Field label="Fecha de corte / liquidación">
              <input type="date" className={inputClass} value={input.calculationDate} onChange={(e) => update('calculationDate', e.target.value)} />
            </Field>
          </div>
          <div className="sm:col-span-2">
            <div className="mb-1.5 flex items-center justify-between">
              <span className="text-xs font-medium uppercase tracking-wide text-slate-400">Antecedentes / Hechos</span>
              <VoiceDictationButton
                onText={(t) => update('customNotes', `${input.customNotes ? `${input.customNotes.trim()} ` : ''}${t}`)}
              />
            </div>
            <textarea
              rows={4}
              className={inputClass}
              value={input.customNotes || ''}
              onChange={(e) => update('customNotes', e.target.value)}
              placeholder="Describa las circunstancias de tiempo, modo y lugar del siniestro…"
            />
          </div>
        </div>
      </Section>

      {/* 2. Víctima & Lucro Cesante */}
      <Section
        number={2}
        title="Perfil de la Víctima & Lucro Cesante"
        subtitle="Ingreso base, factor prestacional y Pérdida de Capacidad Laboral (PCL)"
        icon={<UserRound className="h-5 w-5" />}
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Field label="Edad al siniestro">
            <NumberInput value={input.victimAgeAtIncident} onChange={(v) => update('victimAgeAtIncident', v)} min={0} max={110} suffix="años" />
          </Field>
          <Field label="Género" hint={`Vida probable DANE: ${input.victimGender === 'F' ? LIFE_EXPECTANCY_FEMALE : LIFE_EXPECTANCY_MALE} años`}>
            <select className={inputClass} value={input.victimGender} onChange={(e) => update('victimGender', e.target.value as 'M' | 'F')}>
              <option value="M">Masculino ({LIFE_EXPECTANCY_MALE} años)</option>
              <option value="F">Femenino ({LIFE_EXPECTANCY_FEMALE} años)</option>
            </select>
          </Field>
          <Field label="PCL" hint="Dictamen Junta de Calificación">
            <NumberInput value={input.pclPercentage} onChange={(v) => update('pclPercentage', v)} min={0} max={100} step={0.5} suffix="%" />
          </Field>
          <Field label="Ingreso mensual base">
            <MoneyInput value={input.baseMonthlyIncome} onChange={(v) => update('baseMonthlyIncome', v)} />
          </Field>
        </div>
        <div className="mt-4">
          <Toggle
            checked={input.includeSocialBenefits}
            onChange={(v) => update('includeSocialBenefits', v)}
            label="+25% Prestaciones de Ley"
            description="Incrementa el ingreso base por factor prestacional (primas, cesantías, vacaciones)."
          />
        </div>
      </Section>

      {/* 3. Daño Emergente */}
      <Section
        number={3}
        title="Daño Emergente"
        subtitle="Gastos médicos, reparaciones, exequias y erogaciones acreditadas"
        icon={<Wallet className="h-5 w-5" />}
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Daño emergente consolidado (pasado)">
            <MoneyInput value={input.materialDamagesPast} onChange={(v) => update('materialDamagesPast', v)} />
          </Field>
          <Field label="Daño emergente futuro">
            <MoneyInput value={input.materialDamagesFuture} onChange={(v) => update('materialDamagesFuture', v)} />
          </Field>
        </div>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
          <Toggle
            checked={input.applyIpcIndexation}
            onChange={(v) => update('applyIpcIndexation', v)}
            label="Aplicar Indexación IPC"
            description="Actualiza el daño emergente y el lucro cesante consolidados (Vf = Vh × IPC final / IPC inicial)."
          />
          <Field label="Factor IPC" className="sm:w-36">
            <NumberInput value={input.ipcIndexFactor ?? 1.085} onChange={(v) => update('ipcIndexFactor', v)} min={1} step={0.001} />
          </Field>
        </div>
      </Section>

      {/* 4. Inmateriales */}
      <Section
        number={4}
        title="Perjuicios Inmateriales"
        subtitle="Baremo unificado en SMLMV (Consejo de Estado, Sección Tercera, Rad. 32988)"
        icon={<HeartPulse className="h-5 w-5" />}
      >
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h4 className="text-sm font-semibold text-slate-200">Daño moral – reclamantes</h4>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            SMLMV de referencia
            <div className="w-40">
              <MoneyInput value={smlmv} onChange={(v) => update('smlmvCop', v)} />
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {claimants.length === 0 && (
            <p className="rounded-lg border border-dashed border-slate-700 p-4 text-center text-sm text-slate-500">
              Sin reclamantes de daño moral. Agregue la víctima directa y su núcleo familiar.
            </p>
          )}
          {claimants.map((c) => {
            const cap = DEGREE_CAPS[c.degree];
            const overCap = c.claimedSmlmv > cap;
            return (
              <div key={c.id} className="grid grid-cols-1 gap-3 rounded-xl border border-slate-800 bg-slate-950/60 p-3 md:grid-cols-12 md:items-end">
                <Field label="Nombre" className="md:col-span-3">
                  <input className={inputClass} value={c.name} onChange={(e) => patchClaimant(c.id, { name: e.target.value })} />
                </Field>
                <Field label="Parentesco" className="md:col-span-3">
                  <select
                    className={inputClass}
                    value={c.relationship}
                    onChange={(e) => {
                      const relationship = e.target.value as MoralDamageClaimant['relationship'];
                      patchClaimant(c.id, { relationship, degree: DEFAULT_DEGREE_BY_RELATIONSHIP[relationship] });
                    }}
                  >
                    {Object.entries(RELATIONSHIP_LABELS).map(([k, v]) => (
                      <option key={k} value={k}>
                        {v}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Grado" className="md:col-span-3">
                  <select
                    className={inputClass}
                    value={c.degree}
                    onChange={(e) => patchClaimant(c.id, { degree: e.target.value as MoralDamageClaimant['degree'] })}
                  >
                    {Object.keys(DEGREE_CAPS).map((d) => (
                      <option key={d}>{d}</option>
                    ))}
                  </select>
                </Field>
                <Field
                  label="SMLMV"
                  className="md:col-span-2"
                  hint={<span className={overCap ? 'text-rose-400' : 'text-emerald-400'}>{overCap ? `Excede tope (${cap})` : formatCop(c.claimedSmlmv * smlmv)}</span>}
                >
                  <NumberInput value={c.claimedSmlmv} onChange={(v) => patchClaimant(c.id, { claimedSmlmv: v })} min={0} max={1000} />
                </Field>
                <div className="flex md:col-span-1 md:justify-end md:pb-5">
                  <button
                    type="button"
                    onClick={() => setClaimants(claimants.filter((x) => x.id !== c.id))}
                    className="rounded-lg p-2 text-slate-500 hover:bg-rose-500/10 hover:text-rose-400"
                    aria-label={`Eliminar ${c.name || 'reclamante'}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <button
          type="button"
          onClick={addClaimant}
          className="mt-3 inline-flex items-center gap-2 rounded-lg border border-dashed border-amber-500/40 px-3 py-2 text-sm font-medium text-amber-400 hover:bg-amber-500/10"
        >
          <Plus className="h-4 w-4" /> Agregar Familiar
        </button>

        <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">
          {(
            [
              ['healthDamageSmlmv', 'Daño a la Salud / Vida de Relación', breakdown.totalHealthDamagesCop],
              ['constitutionalRightsSmlmv', 'Bienes Constitucionales Protegidos', breakdown.totalConstitutionalDamagesCop]
            ] as const
          ).map(([key, label, cop]) => (
            <div key={key} className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
              <div className="mb-2 flex items-baseline justify-between">
                <span className="text-sm font-medium text-slate-200">{label}</span>
                <span className="font-mono text-sm text-amber-400">{input[key]} SMLMV</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                step={5}
                value={input[key]}
                onChange={(e) => update(key, Number(e.target.value))}
                className="w-full"
              />
              <div className="mt-1 text-right font-mono text-xs text-emerald-400">{formatCop(cop)}</div>
            </div>
          ))}
        </div>
      </Section>

      {/* 5. Póliza */}
      <Section
        number={5}
        title="Parámetros Técnicos de Póliza & Aseguradora"
        subtitle="Límite asegurado, deducible, infraseguro (Art. 1089) y mora comercial (Art. 1080 C.Co.)"
        icon={<ShieldCheck className="h-5 w-5" />}
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Field label="Límite asegurado">
            <MoneyInput value={input.insuredLimitCop} onChange={(v) => update('insuredLimitCop', v)} />
          </Field>
          <Field label="Deducible">
            <NumberInput value={input.deductiblePercentage} onChange={(v) => update('deductiblePercentage', v)} min={0} max={100} step={0.5} suffix="%" />
          </Field>
          <Field label="Deducible mínimo">
            <MoneyInput value={input.deductibleMinCop} onChange={(v) => update('deductibleMinCop', v)} />
          </Field>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-3">
            <Toggle
              checked={input.applyInfraseguroRule}
              onChange={(v) => update('applyInfraseguroRule', v)}
              label="Regla proporcional por infraseguro (Art. 1089 C.Co.)"
              description="Si el valor real del interés asegurable supera el valor asegurado, la indemnización se reduce proporcionalmente."
            />
            {input.applyInfraseguroRule && (
              <Field label="Valor real asegurable" hint={`Factor de infraseguro: ${breakdown.infraseguroFactor.toFixed(4)}`}>
                <MoneyInput value={input.actualTotalValueCop} onChange={(v) => update('actualTotalValueCop', v)} />
              </Field>
            )}
          </div>
          <div className="space-y-3">
            <Toggle
              checked={input.calculateArt1080Interest}
              onChange={(v) => update('calculateArt1080Interest', v)}
              label="Intereses moratorios Art. 1080 C.Co."
              description="Desde el vencimiento del mes siguiente a la reclamación (Art. 1077), a 1.5× el IBC certificado."
            />
            {input.calculateArt1080Interest && (
              <div className="grid grid-cols-2 gap-3">
                <Field label="Tasa mora E.A.">
                  <NumberInput
                    value={input.effectiveAnnualMoratoryRate}
                    onChange={(v) => update('effectiveAnnualMoratoryRate', v)}
                    min={0}
                    max={100}
                    step={0.01}
                    suffix="% EA"
                  />
                </Field>
                <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-3">
                  <div className="flex items-center gap-1.5 text-xs uppercase tracking-wide text-slate-400">
                    <CalendarClock className="h-3.5 w-3.5" /> Días de mora
                  </div>
                  <div className="mt-1 font-mono text-lg font-semibold text-sky-400">{breakdown.art1080DaysElapsed}</div>
                  {!input.claimFilingDate && <div className="text-[11px] text-rose-400">Falta fecha de reclamo</div>}
                </div>
              </div>
            )}
          </div>
        </div>
      </Section>
    </div>
  );
}
