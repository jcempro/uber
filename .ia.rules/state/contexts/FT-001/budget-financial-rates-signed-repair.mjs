/** MPL-2.0; FT-003.40.4c.2c.1. Patch textual pinado de testes existentes. */
import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';
const root=fs.realpathSync('.'),base='.ia.rules/state/contexts/FT-001/',target='src/domain/budget-financial-rates-signed.test.ts',hash=v=>crypto.createHash('sha256').update(v).digest('hex');
if(root.replaceAll('\\','/').toLowerCase()!=='d:/trampo/jcem.pro-uber')throw Error('root');
function guard(rel){let p=root;for(const part of rel.split('/')){if(!part||part==='..')throw Error('path');p=path.join(p,part);if(fs.existsSync(p)){const s=fs.lstatSync(p);if(s.isSymbolicLink()||s.isFile()&&s.nlink!==1||s.isDirectory()&&fs.existsSync(path.join(p,'.git')))throw Error('linked');}}}
function read(p){guard(p);return fs.readFileSync(p,'utf8');}
for(const p of ['AGENTS.md','.ia.rules/core/authority.md',base+'budget-financial-rates-signed-repair-unit.md'])read(p);
if(hash(read('src/domain/budget-financial-rates.ts'))!=='b9bc2ccbe0a7245b5f79e3a3d6847f430e43601a0b70b94c30f44eb03a0b9da4'||hash(read('src/domain/budget-financial-rates.test.ts'))!=='7fb27476a464ef3837c2026a1a2c929c65a7865c3f16d9461e63a1626916e858')throw Error('accepted drift');
const before=read(target),receipt=base+'budget-financial-rates-signed-repair-check.json';guard(receipt);
if(fs.existsSync(receipt)){const r=JSON.parse(read(receipt));if(hash(before)!==r.afterSha256)throw Error('applied drift');console.log(JSON.stringify({...r,alreadyApplied:true}));process.exit(0);}
if(hash(before)!=='cc51b5663bb36cad403f5c8b2010ac65bf1ff0dbee900169bc79ff7dfa135a36')throw Error('preimage');
let after=before;
function replace(a,b,count){if(after.split(a).length-1!==count)throw Error('match:'+a);after=after.replaceAll(a,b);}
replace("import type { ExactRational } from 'decimal.js';", "import type { ExactRational } from './exact';\nimport type { BudgetFinancialRatesInput } from './budget-financial-rates';",1);
replace("from './budget-financial-rates-signed'", "from './budget-financial-rates'",1);
replace('const input = {','const input: BudgetFinancialRatesInput = {',2);
replace(' as const','',6);
replace('      calendar: {',"      calendar: {\n        kind: 'budget',\n        daysPerMonth: r('28'),\n        monthsPerYear: r('12'),",2);
replace("daysPerWeek: r('7')","daysPerWeek: r('4')",2);
replace("    expect(result.status).toBe('conditional');","    if (result.status !== 'conditional') throw Error(result.reason);",2);
for(const[key,period]of [['perMonth','month'],['perWeek','week'],['perYear','year'],['perWorkingDay',null],['perConnectedHour',null]]){
  let replacement=`    if (result.${key}.status !== 'ready') throw Error(result.${key}.reason);`;
  if(period)replacement+=`\n    expect(result.${key}.sourcePeriod).toBe(input.sourcePeriod);\n    expect(result.${key}.targetPeriod).toBe('${period}');\n    expect(result.${key}.basis).toBe('budget-calendar-period');`;
  replace(`    expect(result.${key}.status).toBe('ready');`,replacement,2);
}
let pairs=0;
after=after.replace(/    expect\((result\.[\w.]+)\.numerator\)\.toBe\('([^']+)'\);\n    expect\(\1\.denominator\)\.toBe\('([^']+)'\);/g,(_m,p,n,d)=>{pairs++;return `    expect(${p}).toEqual(r('${n}', '${d}'));`;});
if(pairs!==20)throw Error('rational pair count:'+pairs);
replace("    expect(result.perWorkingDay.value).toEqual(r('175', '1'));", "    expect(result.perWorkingDay.value).toEqual(r('175', '1'));\n    expect(result.source.value).not.toEqual(result.perWorkingDay.value);",1);
if((after.match(/\bit\('/g)||[]).length!==2)throw Error('case count');
const r={schema:1,unit:'FT-003.40.4c.2c.1',beforeSha256:hash(before),afterSha256:hash(after),changes:'imports/typed fixture W4D28M12/kind; root and result guards;20whole rational comparisons; period metadata and day identity control',limits:'Somente2casos de sinal/origem diária; demais grupos pendentes.'};
if(process.argv.includes('--preflight')){console.log(JSON.stringify({...r,readOnly:true}));process.exit(0);}
const backup=base+'budget-financial-rates-signed.failed-215.test.ts.txt',oldReport=base+'budget-financial-rates-signed-check.json',backupReport=base+'budget-financial-rates-signed.failed-215.check.json';
for(const p of [backup,oldReport,backupReport])guard(p);if(fs.existsSync(backup)||fs.existsSync(backupReport))throw Error('backup exists');const reportBytes=fs.readFileSync(oldReport);
fs.writeFileSync(backup,before);fs.writeFileSync(backupReport,reportBytes);fs.writeFileSync(target,after);fs.writeFileSync(receipt,JSON.stringify(r,null,2)+'\n');console.log(JSON.stringify(r));
