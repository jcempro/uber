/** MPL-2.0; FT-003.40.4c.2e.1. Patch textual e catálogo de expectativas já declarado. */
import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';
const root=fs.realpathSync('.'),base='.ia.rules/state/contexts/FT-001/',target='src/domain/budget-financial-rates-calendar.test.ts',scaffoldPath=base+'budget-financial-rates-calendar.skeleton',hash=v=>crypto.createHash('sha256').update(v).digest('hex');
if(root.replaceAll('\\','/').toLowerCase()!=='d:/trampo/jcem.pro-uber')throw Error('root');
function guard(rel){let p=root;for(const part of rel.split('/')){if(!part||part==='..')throw Error('path');p=path.join(p,part);if(fs.existsSync(p)){const s=fs.lstatSync(p);if(s.isSymbolicLink()||s.isFile()&&s.nlink!==1||s.isDirectory()&&fs.existsSync(path.join(p,'.git')))throw Error('linked');}}}
function read(p){guard(p);return fs.readFileSync(p,'utf8');}
for(const p of ['AGENTS.md','.ia.rules/core/authority.md',base+'budget-financial-rates-calendar-repair-unit.md'])read(p);
const baseline=JSON.parse(read(base+'budget-financial-rates-calendar-baseline.json'));if(Object.keys(baseline.files).length!==94)throw Error('baseline');for(const[p,h]of Object.entries(baseline.files))if(hash(read(p))!==h)throw Error('accepted drift:'+p);
if(hash(read('src/domain/budget-financial-rates.ts'))!=='b9bc2ccbe0a7245b5f79e3a3d6847f430e43601a0b70b94c30f44eb03a0b9da4')throw Error('source drift');
const before=read(target),oldScaffold=read(scaffoldPath),receipt=base+'budget-financial-rates-calendar-repair-check.json';guard(receipt);
if(fs.existsSync(receipt)){const r=JSON.parse(read(receipt));if(hash(before)!==r.afterSha256||hash(oldScaffold)!==r.scaffoldAfterSha256)throw Error('applied drift');console.log(JSON.stringify({...r,alreadyApplied:true}));process.exit(0);}
if(hash(before)!=='68834eeb9c90f1db7be7301121dba6404abdb99c6a33db616f69e33b7399d12f'||hash(oldScaffold)!=='2a85c83dcb7ffa2217bf04484d856ca878e4587ed49a6af54169671bb3a217a0')throw Error('preimage');
const unused=oldScaffold.slice(oldScaffold.indexOf('function verifyWorkingRate('),oldScaffold.indexOf('function verifyAmount('));if(!unused.startsWith('function verifyWorkingRate('))throw Error('unused shape');
function replace(text,a,b,count=1){if(text.split(a).length-1!==count)throw Error('match:'+a);return text.replaceAll(a,b);}
let after=replace(before,unused,''),scaffold=replace(oldScaffold,unused,'');after=replace(after,'const input =','const input: BudgetFinancialRatesInput =',4);
const parts=after.split("  it('");if(parts.length!==5)throw Error('cases');
const names=['dias por semana ausentes bloqueiam apenas taxas de trabalho','perdas mensais ausentes bloqueiam apenas taxas de trabalho','dias por mês ausentes preservam identidade mensal e anual','origem diária sem dias por mês preserva semana'];
const dependencies=['daysPerWeek','lostWorkingDaysPerMonth','daysPerMonth','perMonth'];
function missingAmount(body,field,variable){return replace(body,`    verifyMissingAmount(result.${field});`,`    const ${variable} = verifyMissingAmount(result.${field});\n    expect(${variable}).toMatchObject({code:'missing-calendar-input',dependency:'daysPerMonth'});\n    expect(${variable}.reason.trim().length).toBeGreaterThan(0);`);}
for(let i=0;i<4;i++){
  let body=parts[i+1];if(!body.startsWith(names[i]+"',"))throw Error('case order');const period=i===3?'day':'month',amount=i===3?'100':'3200';
  body=replace(body,'    const result = root(input);',`    const result = root(input);\n    expect(result.currency).toBe('BRL');\n    expect(result.sourceBasis).toBe('budget-calendar-period');\n    expect(result.financialAssessment).toBe('not-evaluated');\n    expect(result.source).toEqual({status:'ready',value:r('${amount}'),sourcePeriod:'${period}',targetPeriod:'${period}',basis:'budget-calendar-period'});`);
  if(i<2)body=replace(body,"    verifyAmount(result.perMonth, 'month', '3200');","    verifyAmount(result.perMonth, 'month', '3200');\n    verifyAmount(result.perWeek, 'week', '800');");
  if(i===2)body=missingAmount(body,'perWeek','week');if(i===3){body=missingAmount(body,'perMonth','month');body=missingAmount(body,'perYear','year');}
  for(const[field,variable]of [['perWorkingDay','day'],['perConnectedHour','hour']]){
    const code=i===3?'source-unavailable':'missing-calendar-input';let checks=`    const ${variable} = verifyUnavailableWorking(result.${field});\n    expect(${variable}).toMatchObject({code:'${code}',dependency:'${dependencies[i]}',denominator:null${i===3?'':',diagnostic:null'}});\n    expect(${variable}.reason.trim().length).toBeGreaterThan(0);`;
    if(i===3)checks+=`\n    expect(${variable}.diagnostic).toBe(result.perMonth);\n    expect(${variable}.reason).toBe(month.reason);`;
    body=replace(body,`    verifyUnavailableWorking(result.${field});`,checks);
  }
  parts[i+1]=body;
}
after=parts.join("  it('");const marker="describe('budget-financial-rates-calendar'";if(!after.startsWith(scaffold.slice(0,scaffold.indexOf(marker))))throw Error('prefix');
const r={schema:1,unit:'FT-003.40.4c.2e.1',beforeSha256:hash(before),afterSha256:hash(after),scaffoldBeforeSha256:hash(oldScaffold),scaffoldAfterSha256:hash(scaffold),changes:'remove unused protected helper in test/scaffold; type4inputs; add identities/week amounts/codes/dependencies/original diagnostic checks from unit matrix',limits:'Somente4casos W/L/D; demais grupos pendentes.'};
if(process.argv.includes('--preflight')){console.log(JSON.stringify({...r,readOnly:true}));process.exit(0);}
const backup=base+'budget-financial-rates-calendar.failed-ae.test.ts.txt',backupScaffold=base+'budget-financial-rates-calendar.failed-ae.skeleton.txt',report=base+'budget-financial-rates-calendar-check.json',backupReport=base+'budget-financial-rates-calendar.failed-ae.check.json';for(const p of [backup,backupScaffold,report,backupReport])guard(p);if([backup,backupScaffold,backupReport].some(p=>fs.existsSync(p)))throw Error('backup exists');const reportBytes=fs.readFileSync(report);
fs.writeFileSync(backup,before);fs.writeFileSync(backupScaffold,oldScaffold);fs.writeFileSync(backupReport,reportBytes);fs.writeFileSync(target,after);fs.writeFileSync(scaffoldPath,scaffold);fs.writeFileSync(receipt,JSON.stringify(r,null,2)+'\n');console.log(JSON.stringify(r));
