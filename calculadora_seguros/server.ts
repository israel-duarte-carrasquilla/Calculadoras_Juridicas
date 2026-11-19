import 'dotenv/config';
import express, { Request, Response } from 'express';
import cors from 'cors';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer } from 'node:http';
import { GoogleGenAI } from '@google/genai';
import { generateDeterministicAssessment } from './src/utils/fallbackAssessment';
import type { DamagesAiAssessment, DamagesCalculationBreakdown, DamagesCalculatorInput } from './src/types';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT || 3000);
const IS_PROD = process.env.NODE_ENV === 'production' || process.argv.includes('--prod');
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
const AI_TIMEOUT_MS = 45_000;

const ai = process.env.GEMINI_API_KEY ? new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY }) : null;

function buildPrompt(input: Partial<DamagesCalculatorInput>, breakdown: Partial<DamagesCalculationBreakdown>): string {
  return `Eres la IA Especialista en Derecho de Seguros, Actuaria Forense y Responsabilidad Civil de Colombia.
Analiza la siguiente liquidación pericial de perjuicios y afectación de póliza de seguro:

CASO: ${input?.caseTitle || 'Sin título'}
RADICADO / SINIESTRO: ${input?.radicado || 'Por asignar'}
JURISDICCIÓN: ${input?.jurisdiction || 'Civil'}
RECLAMANTE / VÍCTIMA: ${input?.claimantName || 'Víctima'} (${input?.victimAgeAtIncident || 30} años, Género ${input?.victimGender || 'M'}, PCL: ${input?.pclPercentage || 0}%)
DEMANDADO / RESPONSABLE: ${input?.defendantName || 'Responsable'}
COMPAÑÍA ASEGURADORA: ${input?.insuranceCompanyName || 'Aseguradora'}
PÓLIZA No.: ${input?.policyNumber || 'N/A'} (Ramo: ${input?.policyType || 'RCE_Vehiculos'})
LÍMITE ASEGURADO: $${input?.insuredLimitCop || 0} COP | DEDUCIBLE: ${input?.deductiblePercentage || 0}% (Mínimo $${input?.deductibleMinCop || 0} COP)
FECHA DEL SINIESTRO: ${input?.incidentDate || 'N/A'} | FECHA RECLAMO RADICADO: ${input?.claimFilingDate || 'N/A'}
ANTECEDENTES / HECHOS: ${input?.customNotes || 'Siniestro con afectación corporal y material.'}

LIQUIDACIÓN ACTUARIAL CALCULADA:
- Daño Emergente Pasado (Indexado IPC): $${breakdown?.danoEmergentePasadoFinal || 0} COP
- Daño Emergente Futuro: $${breakdown?.danoEmergenteFuturoFinal || 0} COP
- Lucro Cesante Consolidado (${breakdown?.lucroCesantePasadoMonths || 0} meses): $${breakdown?.lucroCesantePasadoFinal || 0} COP
- Lucro Cesante Futuro (${breakdown?.lucroCesanteFuturoMonths || 0} meses): $${breakdown?.lucroCesanteFuturoFinal || 0} COP
- Total Perjuicios Extrapatrimoniales (Moral + Salud): $${breakdown?.totalExtrapatrimonialDamages || 0} COP
- GRAN TOTAL DE PERJUICIOS: $${breakdown?.grandTotalDamages || 0} COP
- Cobertura Neta Aseguradora: $${breakdown?.insurancePayableLimitCop || 0} COP
- Intereses Moratorios Art. 1080 C.Co. (${breakdown?.art1080DaysElapsed || 0} días): $${breakdown?.art1080InterestCop || 0} COP
- Total Exigible a Aseguradora: $${breakdown?.totalInsurerPayableWithInterest || 0} COP

INSTRUCCIÓN:
Genera un dictamen y análisis estratégico forense en formato JSON estricto con las siguientes claves:
{
  "executiveSummary": "string con resumen ejecutivo del dictamen pericial y valor final",
  "actuarialLegalBasis": "string detallando la fórmula financiera aplicada y jurisprudencia unificada de la CSJ Sala Civil y Consejo de Estado",
  "insuranceCoverageAnalysis": {
    "isCovered": true/false,
    "coverageTitle": "string",
    "deductibleAssessment": "string sobre el deducible aplicado",
    "proportionalRuleApplicability": "string sobre si aplica o no infraseguro Art. 1089 C.Co.",
    "statuteOfLimitationsStatus": "string evaluando prescripción ordinaria de 2 años y extraordinaria de 5 años según Art. 1081 C.Co.",
    "moratoryInterestApplicability": "string evaluando la causación de intereses moratorios a 1.5x IBC según Art. 1080 C.Co."
  },
  "strengthsInClaim": ["3 fortalezas clave para el cobro judicial o extrajudicial"],
  "insurerObjectionRisks": ["3 riesgos o argumentos típicos de objeción por parte de la aseguradora"],
  "recommendedNegotiationRange": {
    "minimumSettlementCop": number,
    "recommendedSettlementCop": number,
    "fullLitigationTargetCop": number
  },
  "applicableJurisprudence": [
    {
      "court": "Corte Suprema de Justicia - Sala de Casación Civil / Consejo de Estado",
      "radicado": "Sentencia Radicado y Ponente",
      "summary": "Sub-regla de tasación de perjuicios"
    }
  ]
}

Responde ÚNICAMENTE en JSON válido.`;
}

function isValidAssessment(value: unknown): value is DamagesAiAssessment {
  const v = value as DamagesAiAssessment;
  return (
    !!v &&
    typeof v.executiveSummary === 'string' &&
    typeof v.actuarialLegalBasis === 'string' &&
    !!v.insuranceCoverageAnalysis &&
    Array.isArray(v.strengthsInClaim) &&
    Array.isArray(v.insurerObjectionRisks) &&
    !!v.recommendedNegotiationRange &&
    Array.isArray(v.applicableJurisprudence)
  );
}

function stripCodeFences(text: string): string {
  return text.replace(/^\s*```(?:json)?\s*/i, '').replace(/\s*```\s*$/, '').trim();
}

async function main() {
  const app = express();
  const httpServer = createServer(app);

  app.use(cors());
  app.use(express.json({ limit: '1mb' }));

  app.post('/api/calculate-damages-ai', async (req: Request, res: Response) => {
    const { input, breakdown } = (req.body || {}) as {
      input?: DamagesCalculatorInput;
      breakdown?: DamagesCalculationBreakdown;
    };

    if (!input || !breakdown || typeof breakdown.grandTotalDamages !== 'number') {
      res.status(400).json({ error: 'Se requieren los objetos "input" y "breakdown" válidos.' });
      return;
    }

    const fallback = () => generateDeterministicAssessment(input, breakdown);

    if (!ai) {
      res.json({ source: 'fallback', reason: 'GEMINI_API_KEY no configurada', assessment: fallback() });
      return;
    }

    try {
      const response = await ai.models.generateContent({
        model: GEMINI_MODEL,
        contents: buildPrompt(input, breakdown),
        config: {
          responseMimeType: 'application/json',
          temperature: 0.2,
          abortSignal: AbortSignal.timeout(AI_TIMEOUT_MS)
        }
      });
      const parsed = JSON.parse(stripCodeFences(response.text || ''));
      if (!isValidAssessment(parsed)) throw new Error('Estructura JSON incompleta');
      res.json({ source: 'gemini', model: GEMINI_MODEL, assessment: parsed });
    } catch (err) {
      console.error('[calculate-damages-ai] Gemini falló, usando respaldo determinístico:', (err as Error).message);
      res.json({ source: 'fallback', reason: 'Error o timeout en Gemini', assessment: fallback() });
    }
  });

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true, ai: !!ai, model: GEMINI_MODEL });
  });

  if (IS_PROD) {
    const distDir = path.resolve(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => res.sendFile(path.join(distDir, 'index.html')));
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: { server: httpServer } },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  }

  httpServer.listen(PORT, () => {
    console.log(`Calculadora de Seguros en http://localhost:${PORT} (${IS_PROD ? 'producción' : 'desarrollo'}) | IA: ${ai ? GEMINI_MODEL : 'respaldo determinístico'}`);
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
