/** MPL-2.0; FT-003.40.2a. Reparo pontual do retorno8076f79e, sem executar fonte no preparo. */
import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';import ts from 'typescript';
const root=fs.realpathSync('.');if(root.replaceAll('\\','/').toLowerCase()!=='d:/trampo/jcem.pro-uber')throw Error('root');const base='.ia.rules/state/contexts/FT-001/',hash=x=>crypto.createHash('sha256').update(x).digest('hex');
function guard(rel){let p=root;for(const part of rel.split('/')){if(!part||part==='..')throw Error('path');p=path.join(p,part);if(fs.existsSync(p)){const s=fs.lstatSync(p);if(s.isSymbolicLink()||s.isFile()&&s.nlink!==1||s.isDirectory()&&fs.existsSync(path.join(p,'.git')))throw Error('linked');}}}
for(const p of ['AGENTS.md','.ia.rules/core/authority.md',base+'financial-target-gap-unit.md']){guard(p);fs.readFileSync(p,'utf8');}
const paths=['src/domain/financial-target-gap.ts','src/domain/financial-target-gap.test.ts'],originals=[base+'financial-target-gap.failed-8076f79e.source.txt',base+'financial-target-gap.failed-8076f79e.test.txt'],before=['19ef91ac73b2f56298703b9412517f00dd47f3b743c5efe33a64a1262594e163','f4d194a18c7bcb008d4b1ac8c1abac9fa0f8a4867e4f265407c27514dd00d47b'],receipt=base+'financial-target-gap-repair-check.json';for(const p of [...paths,...originals,receipt])guard(p);
const baseline=JSON.parse(fs.readFileSync(base+'financial-target-gap-baseline.json'));if(baseline.sourceCommit!=='58951d963310241963ad01fc3f7b85da9fb00388'||baseline.priorTests!==347||Object.keys(baseline.files).length!==86)throw Error('baseline');
function protect(){for(const [p,h]of Object.entries(baseline.files)){guard(p);if(hash(fs.readFileSync(p))!==h)throw Error('protected:'+p);}}protect();
let [source,tests]=originals.map((p,i)=>{const s=fs.readFileSync(p,'utf8');if(hash(s)!==before[i])throw Error('original drift');return s;});
function once(s,a,b){if(s.split(a).length!==2)throw Error('nonunique repair:'+a);return s.replace(a,b);}
source=once(source,"const one: ExactRational = {numerator: '1', denominator: '1'};","const one: ExactRational = Object.freeze({numerator: '1', denominator: '1'});");source=once(source,"const zero: ExactRational = {numerator: '0', denominator: '1'};","const zero: ExactRational = Object.freeze({numerator: '0', denominator: '1'});");source=source.replaceAll(', limits)',', limitsValidation.limits)');source=once(source,"'targetProfit must be non-negative'","'O lucro alvo deve ser não negativo.'");source=once(source,'// Calculate LLF (Lucro Líquido Disponível para Folga) = projection.value.netProfit','// Lucro líquido final já calculado pelo módulo de projeção.');
const ast=ts.createSourceFile('source.ts',source,ts.ScriptTarget.Latest,true);if(ast.parseDiagnostics.length)throw Error('source syntax');let returns=0,technical=0;
const transformed=ts.transform(ast,[ctx=>node=>ts.visitNode(node,function visit(n){if(!ts.isReturnStatement(n))return ts.visitEachChild(n,visit,ctx);if(!n.expression||!ts.isObjectLiteralExpression(n.expression))throw Error('return shape');returns++;const f=ts.factory,props=[...n.expression.properties],codeIndex=props.findIndex(p=>p.name?.getText(ast)==='code'),calculation=props.find(p=>p.name?.getText(ast)==='calculation')?.initializer;
if(codeIndex>=0&&props[codeIndex].initializer.text==='invalid-target'&&calculation&&calculation.getText(ast)!=='null'){props[codeIndex]=f.createPropertyAssignment('code',f.createStringLiteral('calculation-unavailable'));technical++;}
function freeze(v){if(ts.isObjectLiteralExpression(v)){const object=f.updateObjectLiteralExpression(v,v.properties.map(p=>ts.visitEachChild(p,freeze,ctx)));return f.createCallExpression(f.createPropertyAccessExpression(f.createIdentifier('Object'),'freeze'),undefined,[object]);}return ts.visitEachChild(v,freeze,ctx);}
return f.updateReturnStatement(n,freeze(f.updateObjectLiteralExpression(n.expression,props)));})]);if(returns!==11||technical!==2)throw Error('source repair counts');source=ts.createPrinter({newLine:ts.NewLineKind.LineFeed}).printFile(transformed.transformed[0]);transformed.dispose();
let testAst=ts.createSourceFile('test.ts',tests,ts.ScriptTarget.Latest,true);const inputFactory=testAst.statements.find(n=>n.name?.text==='makeInput');if(!inputFactory)throw Error('fixture factory');let factory=inputFactory.getText(testAst);for(const [a,b]of [["fixedCosts: makeRational('200', '1')","fixedCosts: makeRational('100', '1')"],["usageCosts: makeRational('30', '1')","usageCosts: makeRational('200', '1')"],["extraordinaryCosts: makeRational('0', '1')","extraordinaryCosts: makeRational('30', '1')"]])factory=once(factory,a,b);tests=once(tests,inputFactory.getText(testAst),factory);
function findCase(prefix){const ast=ts.createSourceFile('test.ts',tests,ts.ScriptTarget.Latest,true),found=[];function walk(n){if(ts.isCallExpression(n)&&n.expression.getText(ast)==='it'&&ts.isStringLiteral(n.arguments[0])&&n.arguments[0].text.startsWith(prefix))found.push(n);ts.forEachChild(n,walk);}walk(ast);if(found.length!==1||!ts.isBlock(found[0].arguments[1].body))throw Error('test case:'+prefix);return {ast,node:found[0],body:found[0].arguments[1].body};}
function editCase(prefix,fn){const {ast,node}=findCase(prefix);const replacement=fn(node.getText(ast));tests=tests.slice(0,node.getStart(ast))+replacement+tests.slice(node.getEnd());}
function appendCase(prefix,text){const {body}=findCase(prefix),p=body.getEnd()-1;tests=tests.slice(0,p)+text+tests.slice(p);}
editCase('B100/A20/',s=>{s=once(s,"titheRate: makeRational('9', '10')","titheRate: makeRational('1', '10')");s=once(s,"titheRate: makeRational('1', '1')","titheRate: makeRational('1', '10')");const needle="revenueTaxRate: makeRational('0', '1')";if(s.split(needle).length!==3)throw Error('G fixtures');s=s.replace(needle,"revenueTaxRate: makeRational('9', '10')").replace(needle,"revenueTaxRate: makeRational('1', '1')");return s;});
editCase('B9007199254740993/',s=>once(s,"expect(result.value.modeledCoverageShortfall.numerator).toBe('1');","expect(result.value.modeledCoverageShortfall.numerator).toBe('0');"));
tests=once(tests,"expect(resultInvalidTarget.code).toBe('invalid-target');","expect(resultInvalidTarget).toMatchObject({status:'unavailable',code:'invalid-target'});");tests=once(tests,"expect(resultInvalidBudget.code).toBe('invalid-budget');","expect(resultInvalidBudget).toMatchObject({status:'unavailable',code:'invalid-budget'});");
const volume=findCase('tripsPerHour'),volumeBody=volume.body.getText(volume.ast),cut=volumeBody.indexOf('    const input2 =');if(cut<0)throw Error('volume fixture');const retained=volumeBody.slice(1,cut);
const volumeReplacement='{'+retained+`
    for(const tripsPerHour of [1,10,100]) {
      const varied={...input1,tripsPerHour};
      expect(calculateFinancialTargetGap(varied,makeLimits())).toMatchObject({status:'conditional',costCoverage:'not-evaluated',projection:{value:{netProfit:{numerator:'-30',denominator:'1'}}},value:{signedTargetSlack:{numerator:'-130',denominator:'1'},profitShortfall:{numerator:'130',denominator:'1'},modeledCoverageShortfall:{numerator:'30',denominator:'1'},coversModeledCosts:false,reachesModeledTarget:false}});
    }
  }`;
tests=tests.slice(0,volume.body.getStart(volume.ast))+volumeReplacement+tests.slice(volume.body.getEnd());
appendCase('alvo negativo/malformado',`
    expect(calculateFinancialTargetGap(makeInput({targetProfit:makeRational('1','0')}),makeLimits())).toMatchObject({status:'unavailable',code:'calculation-unavailable',calculation:{code:'invalid-rational'}});
    expect(calculateFinancialTargetGap({...makeInput({}),targetProfit:undefined} as unknown as FinancialTargetGapInput,makeLimits())).toMatchObject({status:'unavailable',code:'calculation-unavailable',calculation:{code:'invalid-rational'}});
    expect(calculateFinancialTargetGap({...makeInput({}),fixedTaxes:undefined} as unknown as FinancialTargetGapInput,makeLimits())).toMatchObject({status:'unavailable',code:'projection-unavailable',projection:{code:'calculation-unavailable',field:'fixedTaxes'}});
    expect(calculateFinancialTargetGap(makeInput({targetProfit:makeRational('9'.repeat(101),'1')}),makeLimits())).toMatchObject({status:'unavailable',code:'calculation-unavailable',calculation:{code:'resource-budget'}});
  `);
appendCase('B9007199254740993/',`
    expect(calculateFinancialTargetGap(input,{maxInputLength:1000,maxDigits:1})).toMatchObject({status:'unavailable',code:'projection-unavailable',projection:{code:'calculation-unavailable',calculation:{code:'resource-budget'}}});
  `);
appendCase('B1000,F100',`
    expect(result).toMatchObject({costCoverage:'not-evaluated',taxAssessment:'not-evaluated',projection:{value:{netProfit:{numerator:'510',denominator:'1'},margin:{status:'ready',value:{numerator:'51',denominator:'100'}}}}});
  `);
appendCase('B0/F80/',`
    expect(result.projection.value.margin).toMatchObject({status:'unavailable',code:'zero-revenue'});
  `);
editCase('freeze/snapshots',s=>once(s,"const input = makeInput({ targetProfit: makeRational('510', '1') });","const mutableTarget={numerator:'1020',denominator:'2'};\n    const input = makeInput({contextId:' contexto ',targetProfit:mutableTarget});\n    const before=JSON.stringify(input);"));
appendCase('freeze/snapshots',`
    function frozen(value:unknown):void {if(value!==null&&typeof value==='object'){expect(Object.isFrozen(value)).toBe(true);for(const child of Object.values(value))frozen(child);}}
    frozen(result1);expect(JSON.stringify(input)).toBe(before);expect(Object.isFrozen(input)).toBe(false);expect(Object.isFrozen(mutableTarget)).toBe(false);
    expect(result1).toMatchObject({contextId:' contexto ',costCoverage:'not-evaluated',taxAssessment:'not-evaluated',value:{targetProfit:{numerator:'510',denominator:'1'}}});
    mutableTarget.numerator='0';expect(result1.value.targetProfit).toEqual({numerator:'510',denominator:'1'});
  `);
testAst=ts.createSourceFile('test.ts',tests,ts.ScriptTarget.Latest,true);if(testAst.parseDiagnostics.length)throw Error('test syntax');let testCount=0;function count(n){if(ts.isCallExpression(n)&&n.expression.getText(testAst)==='it')testCount++;ts.forEachChild(n,count);}count(testAst);if(testCount!==10)throw Error('test count');
const outputs=[source,tests],after=outputs.map(hash),record={schema:1,unit:'FT-003.40.2a',sourcePath:paths[0],testPath:paths[1],sourceSha256:after[0],testSha256:after[1],before,returns,technical,testCount,protectedFiles:86,limits:'Desvios condicionais do modelo apenas; não comprova custos completos, tributação legal, resultado real, repasse adicional ou UI.'};
if(process.argv.includes('--preflight')){console.log(JSON.stringify({...record,preflight:true}));process.exit(0);}
if(fs.existsSync(receipt)){const r=JSON.parse(fs.readFileSync(receipt));if(paths.every((p,i)=>hash(fs.readFileSync(p))===after[i])&&r.sourceSha256===after[0]&&r.testSha256===after[1]){console.log(JSON.stringify({...r,alreadyApplied:true}));process.exit(0);}throw Error('applied state differs');}
for(let i=0;i<paths.length;i++)if(hash(fs.readFileSync(paths[i]))!==before[i])throw Error('target drift');for(let i=0;i<paths.length;i++)fs.writeFileSync(paths[i],outputs[i]);protect();fs.writeFileSync(receipt,JSON.stringify(record,null,2)+'\n');console.log(JSON.stringify(record));
