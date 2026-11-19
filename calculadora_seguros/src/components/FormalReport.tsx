import { useMemo, useState } from 'react';
import { Check, Copy, FileDown, Printer } from 'lucide-react';
import { DamagesCalculationBreakdown, DamagesCalculatorInput } from '../types';
import { buildReportHtml, buildReportText, copyToClipboard, downloadWordDoc } from '../utils/reportExport';

interface Props {
  input: DamagesCalculatorInput;
  breakdown: DamagesCalculationBreakdown;
}

export default function FormalReport({ input, breakdown }: Props) {
  const [copied, setCopied] = useState(false);
  // Todo valor de usuario se escapa dentro de buildReportHtml.
  const html = useMemo(() => buildReportHtml(input, breakdown), [input, breakdown]);

  const handleCopy = async () => {
    if (await copyToClipboard(buildReportText(input, breakdown))) {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    }
  };

  const btn = 'inline-flex items-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-200 hover:border-amber-500/60 hover:text-amber-400';

  return (
    <div className="space-y-4">
      <div className="no-print flex flex-wrap justify-end gap-2">
        <button className={btn} onClick={() => window.print()}>
          <Printer className="h-4 w-4" /> Imprimir / PDF
        </button>
        <button className={btn} onClick={handleCopy}>
          {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />} {copied ? 'Copiado' : 'Copiar texto'}
        </button>
        <button className={btn} onClick={() => downloadWordDoc(input, breakdown)}>
          <FileDown className="h-4 w-4" /> Descargar Word (.doc)
        </button>
      </div>
      <article
        id="formal-report"
        className="report-sheet mx-auto max-w-[850px] rounded-sm bg-white p-8 font-serif text-slate-900 shadow-2xl sm:p-14"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}
