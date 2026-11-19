import { calculateDamages } from '../src/utils/actuarialCalculations';
import { PRESET_CASES } from '../src/constants';

let failures = 0;
const check = (name: string, cond: boolean, detail = '') => {
  console.log(`${cond ? 'PASS' : 'FAIL'} ${name} ${detail}`);
  if (!cond) failures++;
};

const base = { ...PRESET_CASES.transito.data, incidentDate: '2023-05-15', calculationDate: '2025-05-15', claimFilingDate: '2024-01-01' };
const b = calculateDamages(base);
const i = 0.004867;
const ra = 3500000 * 1.25 * 0.285;
const expPasado = Math.round(ra * ((Math.pow(1 + i, 24) - 1) / i) * 1.085);
check('nPasado = 24', b.lucroCesantePasadoMonths === 24);
check('lucro cesante pasado', b.lucroCesantePasadoFinal === expPasado, `${b.lucroCesantePasadoFinal} vs ${expPasado}`);
const nF = Math.floor((74.8 - (34 + 2)) * 12);
check('nFuturo', b.lucroCesanteFuturoMonths === nF, `${b.lucroCesanteFuturoMonths} vs ${nF}`);
check('gran total = patrimonial + extra', b.grandTotalDamages === b.totalPatrimonialDamages + b.totalExtrapatrimonialDamages);
check('pago <= limite', b.insurancePayableLimitCop <= base.insuredLimitCop);
const moraDays = Math.floor((new Date(2025, 4, 15).getTime() - new Date(2024, 0, 31).getTime()) / 86400000);
check('dias mora (reclamo + 30)', b.art1080DaysElapsed === moraDays, `${b.art1080DaysElapsed} vs ${moraDays}`);

const infra = calculateDamages({ ...base, applyInfraseguroRule: true, insuredLimitCop: 100_000_000, actualTotalValueCop: 200_000_000 });
check('infraseguro factor 0.5', infra.infraseguroFactor === 0.5);

const noLoss = calculateDamages({ ...PRESET_CASES.cumplimiento.data, calculationDate: '2025-01-01' });
check('cumplimiento sin lucro cesante', noLoss.lucroCesantePasadoFinal === 0 && noLoss.lucroCesanteFuturoFinal === 0);
check('cumplimiento DE pasado indexado', noLoss.danoEmergentePasadoFinal === Math.round(180_000_000 * 1.085));

const smlmv = calculateDamages({ ...base, smlmvCop: 1_750_905 });
check('SMLMV editable', smlmv.totalHealthDamagesCop === Math.round(base.healthDamageSmlmv * 1_750_905));

process.exit(failures ? 1 : 0);
