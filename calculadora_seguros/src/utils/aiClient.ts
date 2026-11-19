import { DamagesAiAssessment, DamagesCalculationBreakdown, DamagesCalculatorInput } from '../types';
import { generateDeterministicAssessment } from './fallbackAssessment';

export interface AiResult {
  assessment: DamagesAiAssessment;
  source: 'gemini' | 'fallback';
  note?: string;
}

const CLIENT_TIMEOUT_MS = 60_000;

export async function requestAiAssessment(
  input: DamagesCalculatorInput,
  breakdown: DamagesCalculationBreakdown
): Promise<AiResult> {
  try {
    const res = await fetch('/api/calculate-damages-ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ input, breakdown }),
      signal: AbortSignal.timeout(CLIENT_TIMEOUT_MS)
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!data?.assessment) throw new Error('Respuesta sin dictamen');
    return { assessment: data.assessment, source: data.source === 'gemini' ? 'gemini' : 'fallback', note: data.reason };
  } catch (err) {
    return {
      assessment: generateDeterministicAssessment(input, breakdown),
      source: 'fallback',
      note: `Sin conexión con el servidor de IA (${(err as Error).message}). Se usa el dictamen determinístico local.`
    };
  }
}
