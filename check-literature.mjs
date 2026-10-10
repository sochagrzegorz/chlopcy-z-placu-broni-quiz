import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import vm from 'node:vm';
const source=await fs.readFile(new URL('./worker.js',import.meta.url),'utf8');
const worker=(await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'))).default;
const html=await fs.readFile(new URL('./lektura/index.html',import.meta.url),'utf8');
const script=html.match(/<script>([\s\S]*?)<\/script>/)[1];
new vm.Script(script);
const bank=vm.runInNewContext(source.slice(0,source.indexOf('const LITERATURE_FACTS'))+';pools');
const clientBank=vm.runInNewContext(script.slice(0,script.indexOf('const API_BASE'))+';pools');
assert.equal(JSON.stringify(clientBank),JSON.stringify(bank),'Client/server question banks must match');
assert.equal(Object.values(bank).flat().length,100);
const rows=new Map();let duplicate=false;
const env={QUIZ_SIGNING_KEY:'test-only-signing-key-not-used-in-production',LEADERBOARD:{
  get:async()=>[{quiz:'biologia',nickname:'Historyczny',points:1,maxPoints:2,percent:50}],
  put:async(key,value,options)=>{await Promise.resolve();rows.set(key,{value,metadata:options.metadata})},
  list:async({prefix})=>({keys:[...rows].filter(([key])=>key.startsWith(prefix)).map(([name,row])=>({name,metadata:row.metadata})),list_complete:true})},AI:{run:async(_model,input)=>{
    const payload=JSON.parse(input.messages[1].content);
    const max=input.response_format.json_schema.properties.results.items.properties.score.maximum;
    const results=payload.answers.map(a=>({id:a.id,score:max,feedback:'Poprawne uzasadnienie.'})).reverse();
    if(duplicate)results[1].id=results[0].id;
    return {response:{results,total:max*results.length,max_points:max*results.length,summary:'Oceniono odpowiedzi.'}};
  }}};
async function call(path,body){const response=await worker.fetch(new Request('https://quiz.example'+path,{method:body===undefined?'GET':'POST',headers:{Origin:'https://sochagrzegorz.github.io','Content-Type':'application/json'},...(body!==undefined?{body:JSON.stringify(body)}:{})}),env);return {status:response.status,data:await response.json()}}
assert.equal((await call('/session',{nickname:'<bad>'})).status,400);
assert.equal((await call('/grade',null)).status,400);
async function complete(nickname){
  const start=await call('/session',{nickname});assert.equal(start.status,200);
  assert.equal((await call('/finish',{token:start.data.token})).status,400,'Cannot finish before V');
  const answers=['mcq','tf','match'].flatMap(type=>start.data.picks[type].map(id=>({id,value:bank[type].find(q=>q.id===id).correct})));
  const closed=await call('/closed',{token:start.data.token,answers});assert.equal(closed.data.points,6);
  const shorts=start.data.picks.short.map(id=>({id,answer:'Przykładowa poprawna odpowiedź.',question:'Podmienione pytanie'}));
  const short=await call('/grade',{section:'IV',token:closed.data.token,answers:shorts});assert.equal(short.data.max_points,4);
  assert.equal((await call('/grade',{section:'V',token:start.data.token,answers:shorts})).status,400,'Cannot skip IV');
  const essays=start.data.picks.essay.map(id=>({id,answer:'Dłuższa praca '.repeat(210)}));
  duplicate=true;assert.equal((await call('/grade',{section:'V',token:short.data.token,answers:essays})).status,502,'Reject duplicate AI result IDs');duplicate=false;
  const essay=await call('/grade',{section:'V',token:short.data.token,answers:essays});assert.equal(essay.status,200);assert.equal(essay.data.max_points,10);assert.equal(essay.data.total,10);
  const result=await call('/finish',{token:essay.data.token});assert.equal(result.data.points,20);assert.equal(result.data.maxPoints,20);
  return result.data.ticket;
}
const tickets=[await complete('Uczeń A'),await complete('Uczeń B')];
assert.equal((await call('/leaderboard',{quiz:'lektura',nickname:'Fałszywy',points:20,maxPoints:20})).status,400);
assert.equal((await call('/leaderboard',{quiz:'lektura',ticket:tickets[0]+'x'})).status,400);
const saved=await Promise.all(tickets.map(ticket=>call('/leaderboard',{quiz:'lektura',ticket})));
assert(saved.every(result=>result.status===200));assert.equal(rows.size,2,'Simultaneous sessions use distinct keys');
const ranking=await call('/leaderboard?quiz=lektura');assert.equal(ranking.data.entries.length,2);assert(ranking.data.entries.every(e=>e.quiz==='lektura'&&e.points===20));
const biology=await call('/leaderboard?quiz=biologia');assert.equal(biology.data.entries[0].nickname,'Historyczny');
console.log('PASS: browser script syntax, 100 matching questions, IV /4, V /10, >1800-character essay, result /20, stage gates, AI IDs, signed scores, concurrent ranking and subject filtering.');
