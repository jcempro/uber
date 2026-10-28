/** MPL-2.0; FT-003.40.4c.2b. Correções textuais exatas, revisadas pelo supervisor. */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
const root=fs.realpathSync('.'),base='.ia.rules/state/contexts/FT-001/',target='src/domain/budget-financial-rates.test.ts';
const hash=v=>crypto.createHash('sha256').update(v).digest('hex');
if(root.replaceAll('\\','/').toLowerCase()!=='d:/trampo/jcem.pro-uber')throw Error('root');
function guard(rel){let p=root;for(const part of rel.split('/')){if(!part||part==='..')throw Error('path');p=path.join(p,part);if(fs.existsSync(p)){const s=fs.lstatSync(p);if(s.isSymbolicLink()||s.isFile()&&s.nlink!==1||s.isDirectory()&&fs.existsSync(path.join(p,'.git')))throw Error('linked');}}}
const receipt=base+'budget-financial-rates-core-repair-check.json';
for(const p of ['AGENTS.md','.ia.rules/core/authority.md',base+'budget-financial-rates-core-repair-unit.md',target,'src/domain/budget-financial-rates.ts',receipt]){guard(p);if(p!==receipt)fs.readFileSync(p);}
if(hash(fs.readFileSync('src/domain/budget-financial-rates.ts'))!=='b9bc2ccbe0a7245b5f79e3a3d6847f430e43601a0b70b94c30f44eb03a0b9da4')throw Error('source drift');
const before=fs.readFileSync(target,'utf8');
if(fs.existsSync(receipt)){const r=JSON.parse(fs.readFileSync(receipt));if(hash(before)!==r.afterSha256)throw Error('applied drift');console.log(JSON.stringify({...r,alreadyApplied:true}));process.exit(0);}
if(hash(before)!=='2c901a8c42c393ee05a6b7ba029a7aa71dbe89da8bb7afde6e48b307b030a967')throw Error('preimage');
let after=before;
function replace(old,value,count){if(after.split(old).length-1!==count)throw Error('replacement count:'+old);after=after.replaceAll(old,value);}
replace("import type { BudgetFinancialRatesInput, BudgetFinancialRatesResult, BudgetWorkingRateResult } from './budget-financial-rates';", "import { calculateBudgetFinancialRates } from './budget-financial-rates';\nimport type { BudgetFinancialRatesInput, BudgetWorkingRateResult } from './budget-financial-rates';\nimport type { BudgetAmountResult } from './budget-amount';\nimport type { BudgetPeriod } from './model';",1);
replace('function root(input: BudgetFinancialRatesInput): BudgetFinancialRatesResult {','function root(input: BudgetFinancialRatesInput) {',1);
replace("daysPerWeek: r('7')","daysPerWeek: r('4')",2);
replace("hoursPerWorkingDay: r('8')","hoursPerWorkingDay: r('4')",2);
replace(".unit).toBe('working-day')",".unit).toBe('BRL/working-day')",2);
replace(".unit).toBe('connected-hour')",".unit).toBe('BRL/connected-hour')",2);
replace("describe('budget-financial-rates', () => {",`function verifyAmount(result: BudgetAmountResult, period: BudgetPeriod, amount: string) {
  if (result.status !== 'ready') throw Error(result.reason);
  expect(result.value).toEqual(r(amount));
  expect(result.sourcePeriod).toBe('month');
  expect(result.targetPeriod).toBe(period);
  expect(result.basis).toBe('budget-calendar-period');
}

describe('budget-financial-rates', () => {`,1);
replace('    const result = root(input);',`    const result = root(input);
    expect(result.currency).toBe('BRL');
    expect(result.sourceBasis).toBe('budget-calendar-period');
    expect(result.financialAssessment).toBe('not-evaluated');
    expect(result.source).toEqual({status:'ready',value:r('3200'),sourcePeriod:'month',targetPeriod:'month',basis:'budget-calendar-period'});
    verifyAmount(result.perMonth, 'month', '3200');
    verifyAmount(result.perWeek, 'week', '800');
    verifyAmount(result.perYear, 'year', '38400');`,2);
replace("    expect(perWorkingDay.value).toEqual(r('200', '1'));","    expect(perWorkingDay.value).toEqual(r('200', '1'));\n    expect(perWorkingDay.value).not.toEqual(r('800', '7'));",1);
if((after.match(/\bit\('/g)||[]).length!==2)throw Error('test count');
const r={schema:1,unit:'FT-003.40.4c.2b',beforeSha256:hash(before),afterSha256:hash(after),changes:'import/narrowing; W4/h4; units BRL; identity and independent period assertions; calendar-day negative control',limits:'Somente dois casos centrais; cobertura integral pendente.'};
if(process.argv.includes('--preflight')){console.log(JSON.stringify({...r,readOnly:true}));process.exit(0);}
const backup=base+'budget-financial-rates.failed-1cc.test.ts.txt',report=base+'budget-financial-rates-check.json',reportBackup=base+'budget-financial-rates.failed-1cc.check.json';
for(const p of [backup,report,reportBackup])guard(p);
if(fs.existsSync(backup)||fs.existsSync(reportBackup))throw Error('backup exists');
const reportBytes=fs.readFileSync(report);
fs.writeFileSync(backup,before);fs.writeFileSync(reportBackup,reportBytes);fs.writeFileSync(target,after);fs.writeFileSync(receipt,JSON.stringify(r,null,2)+'\n');console.log(JSON.stringify(r));
