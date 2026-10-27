import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';
const root=fs.realpathSync('.');if(root.replaceAll('\\','/').toLowerCase()!=='d:/trampo/jcem.pro-uber')throw Error('root');
const hash=x=>crypto.createHash('sha256').update(x).digest('hex'),base='.ia.rules/state/contexts/FT-001/';const files={};
function scan(p){for(const item of fs.readdirSync(p,{withFileTypes:true})){const q=p+'/'+item.name;if(item.isSymbolicLink())throw Error('linked');if(item.isDirectory())scan(q);else if(item.isFile()&&q.endsWith('.ts')){if(fs.lstatSync(q).nlink!==1)throw Error('hardlink');files[q]=hash(fs.readFileSync(q));}}}
scan('src/domain');for(const p of ['package.json','package-lock.json',base+'autocalc-evolution-plan.md','.ia.rules/state/requests/FT-001/autocalc-evolution.md',base+'autocalc-tax-apply.mjs',base+'autocalc-tax-verify.mjs'])files[p]=hash(fs.readFileSync(p));
const data={schema:1,unit:'FT-010.1',rcf:hash(fs.readFileSync('RCF.md')),request:files['.ia.rules/state/requests/FT-001/autocalc-evolution.md'],protected:files};
const p=base+'autocalc-tax-baseline.json';if(fs.existsSync(p))throw Error('baseline exists; no overwrite');fs.writeFileSync(p,JSON.stringify(data,null,2)+'\n');console.log(JSON.stringify({protected:Object.keys(files).length,rcf:data.rcf}));
