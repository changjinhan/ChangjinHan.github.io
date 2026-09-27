import fs from 'node:fs';
const source=JSON.parse(fs.readFileSync(new URL('../data/bondnote/source.json',import.meta.url),'utf8'));
const clean=s=>s.replace(/[^]*/g,'').replace(/\[([^\]]+)\]\([^)]*\)/g,'$1').replace(/[*`#]/g,'').replace(/\\[()]/g,'').replace(/\s+/g,' ').trim();
const firstParagraph=s=>s.split(/\n\s*\n/).map(clean).find(p=>p.length>65&&!/^(구분|발표일|원문|공개|선정|최신)/.test(p))||clean(s).slice(0,220);
const groups=[['금리 · 커브',/yield curve|duration|discount curve|treasury|금리|듀레이션|커브|국채/i],['크레딧',/corporate bond|credit|default|회사채|신용|크레딧|부도|debt|cat bond/i],['거래 · 유동성',/liquidity|execution|market mak|microstructure|trading volume|order flow|거래|유동성|시장조성|체결|미시구조/i],['AI · 모델',/agent|LLM|NLP|foundation|reinforcement|AI|learning|모델/i],['리스크 · 운용',/risk|portfolio|fund|stability|리스크|운용|위험|allocation/i]];
const briefings=source.messages.map(m=>{
 const dm=m.text.match(/(2026)년 (\d+)월 (\d+)일/); const date=`${dm[1]}-${dm[2].padStart(2,'0')}-${dm[3].padStart(2,'0')}`;
 const matches=[...m.text.matchAll(/^#{1,2} ([1-5])[.)]\s+(.+)$/gm)];
 const articles=matches.map((a,i)=>{let body=m.text.slice(a.index+a[0].length,matches[i+1]?.index??m.text.length).trim();body=body.split(/^# (?:Quant Firm|오늘|데스크|통합|최종)/m)[0].trim();const title=clean(a[2]);const summaryBlock=body.split(/^### .*?(?:핵심 요약|핵심 내용|확인 가능한 사실).*$/m)[1]?.split(/^### /m)[0]||body;const summary=firstParagraph(summaryBlock);const isFirm=date>='2026-08-08'&&Number(a[1])>=4;const tags=isFirm?['퀀트사 동향']:groups.filter(([,r])=>r.test(title)).map(([g])=>g);if(!tags.length)tags.push('AI · 모델');const links=[...body.matchAll(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g)].map(x=>({label:clean(x[1]),url:x[2].replace(/\?utm_source=chatgpt.com$/,'')}));return{id:m.id+'-'+a[1],date,title,summary,tags,body,links:[...new Map(links.map(l=>[l.url,l])).values()],priority:(body.match(/★/g)||[]).length};});
 const conclusion=m.text.split(/^#{1,2} .*?(?:오늘의 데스크 결론|오늘의 핵심|오늘의 결론|데스크 결론|통합 시사점).*$/m)[1];
 return{id:m.id,date,title:clean(m.text.split('\n')[0]),summary:conclusion?firstParagraph(conclusion):articles.map(a=>a.title).slice(0,3).join(' · '),body:m.text,articles};
}).sort((a,b)=>b.date.localeCompare(a.date));
const dates=new Set(briefings.map(b=>b.date));const missing=[];for(let t=new Date(briefings.at(-1).date+'T00:00:00Z');t<=new Date(briefings[0].date+'T00:00:00Z');t.setUTCDate(t.getUTCDate()+1)){const d=t.toISOString().slice(0,10);if(!dates.has(d))missing.push(d);}
const data={updatedAt:new Date().toISOString(),syncStatus:'daily',missing,briefings};console.log(JSON.stringify({briefings:briefings.length,articles:briefings.flatMap(b=>b.articles).length,missing}));

fs.writeFileSync(new URL('../data/bondnote/briefings.json',import.meta.url),JSON.stringify(data));
