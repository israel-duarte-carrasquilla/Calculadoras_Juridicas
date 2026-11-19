import { ReactNode, useEffect, useState } from 'react';
import { formatNumber } from '../utils/formatters';

export const inputClass =
  'w-full rounded-lg border border-slate-700 bg-slate-950/70 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500/60';

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-slate-800 bg-slate-900/90 shadow-xl shadow-black/20 ${className}`}>
      {children}
    </div>
  );
}

export function Section({
  number,
  title,
  subtitle,
  icon,
  children
}: {
  number: number;
  title: string;
  subtitle?: string;
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <Card className="p-5 sm:p-6">
      <div className="mb-5 flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/30">
          {icon}
        </div>
        <div>
          <h3 className="text-base font-semibold text-slate-100">
            <span className="mr-2 font-mono text-amber-400">{String(number).padStart(2, '0')}</span>
            {title}
          </h3>
          {subtitle && <p className="mt-0.5 text-xs text-slate-400">{subtitle}</p>}
        </div>
      </div>
      {children}
    </Card>
  );
}

export function Field({
  label,
  hint,
  children,
  className = ''
}: {
  label: string;
  hint?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-400">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-[11px] text-slate-500">{hint}</span>}
    </label>
  );
}

/** Input de moneda COP con separadores de miles es-CO. */
export function MoneyInput({
  value,
  onChange,
  placeholder
}: {
  value: number;
  onChange: (v: number) => void;
  placeholder?: string;
}) {
  const [text, setText] = useState(formatNumber(value));
  useEffect(() => {
    setText(value ? new Intl.NumberFormat('es-CO', { maximumFractionDigits: 0 }).format(value) : '');
  }, [value]);

  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-500">$</span>
      <input
        inputMode="numeric"
        className={`${inputClass} pl-7 font-mono`}
        value={text}
        placeholder={placeholder ?? '0'}
        onChange={(e) => {
          const digits = e.target.value.replace(/\D/g, '');
          const n = digits ? Number(digits) : 0;
          setText(digits ? new Intl.NumberFormat('es-CO').format(n) : '');
          onChange(n);
        }}
      />
    </div>
  );
}

export function NumberInput({
  value,
  onChange,
  min,
  max,
  step = 1,
  suffix
}: {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
  suffix?: string;
}) {
  return (
    <div className="relative">
      <input
        type="number"
        className={`${inputClass} font-mono ${suffix ? 'pr-14' : ''}`}
        value={Number.isFinite(value) ? value : 0}
        min={min}
        max={max}
        step={step}
        onChange={(e) => {
          let n = e.target.value === '' ? 0 : Number(e.target.value);
          if (min !== undefined) n = Math.max(min, n);
          if (max !== undefined) n = Math.min(max, n);
          onChange(n);
        }}
      />
      {suffix && (
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500">
          {suffix}
        </span>
      )}
    </div>
  );
}

export function Toggle({
  checked,
  onChange,
  label,
  description
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  description?: string;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-slate-800 bg-slate-950/60 p-3 hover:border-slate-700">
      <input
        type="checkbox"
        className="mt-0.5 h-4 w-4 shrink-0 accent-amber-500"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span>
        <span className="block text-sm font-medium text-slate-200">{label}</span>
        {description && <span className="mt-0.5 block text-xs text-slate-400">{description}</span>}
      </span>
    </label>
  );
}

export function Badge({ children, tone = 'amber' }: { children: ReactNode; tone?: 'amber' | 'sky' | 'emerald' | 'rose' }) {
  const tones = {
    amber: 'bg-amber-500/10 text-amber-400 ring-amber-500/30',
    sky: 'bg-sky-500/10 text-sky-400 ring-sky-500/30',
    emerald: 'bg-emerald-500/10 text-emerald-400 ring-emerald-500/30',
    rose: 'bg-rose-500/10 text-rose-400 ring-rose-500/30'
  };
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ${tones[tone]}`}>
      {children}
    </span>
  );
}
