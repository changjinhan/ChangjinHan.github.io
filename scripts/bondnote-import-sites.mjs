import fs from 'node:fs';

const [sourcePath,editorialPath]=process.argv.slice(2);
if(!sourcePath||!editorialPath)throw new Error('Usage: node scripts/bondnote-import-sites.mjs <Sites data/briefings.json> <Sites data/editorial/posts.json>');
const incoming=JSON.parse(fs.readFileSync(sourcePath,'utf8'));
const target=new URL('../data/bondnote/briefings.json',import.meta.url);
const current=JSON.parse(fs.readFileSync(target,'utf8'));
const incomingEditorial=JSON.parse(fs.readFileSync(editorialPath,'utf8'));
const editorialTarget=new URL('../data/bondnote/editorial/posts.json',import.meta.url);
const currentEditorial=JSON.parse(fs.readFileSync(editorialTarget,'utf8'));

function validate(briefings){
  if(!Array.isArray(briefings)||!briefings.length)throw new Error('브리핑 데이터가 비어 있습니다.');
  const dates=new Set(),ids=new Set();
  for(const briefing of briefings){
    if(!/^\d{4}-\d{2}-\d{2}$/.test(briefing.date)||dates.has(briefing.date))throw new Error(`브리핑 날짜 오류: ${briefing.date}`);
    if(!briefing.id||ids.has(briefing.id)||!briefing.body||!Array.isArray(briefing.articles)||!briefing.articles.length)throw new Error(`브리핑 내용 오류: ${briefing.date}`);
    dates.add(briefing.date);ids.add(briefing.id);
    for(const article of briefing.articles){
      if(!article.id||ids.has(article.id)||!article.body||!Array.isArray(article.links))throw new Error(`연구 항목 오류: ${article.id}`);
      ids.add(article.id);
      for(const link of article.links){
        if(!link.label||!link.url||!/^https?:\/\//.test(link.url))throw new Error(`출처 링크 오류: ${article.id}`);
      }
    }
  }
  return {dates,ids};
}

const next=validate(incoming.briefings);
const previous=validate(current.briefings);
for(const date of previous.dates)if(!next.dates.has(date))throw new Error(`기존 브리핑이 사라졌습니다: ${date}`);
for(const id of previous.ids)if(!next.ids.has(id))throw new Error(`기존 연구 항목이 사라졌습니다: ${id}`);
if(incoming.briefings.length<current.briefings.length)throw new Error('브리핑 수가 줄었습니다.');
for(const date of Object.keys(currentEditorial))if(!incomingEditorial[date])throw new Error(`기존 편집 글이 사라졌습니다: ${date}`);
for(const briefing of incoming.briefings){
  const entry=incomingEditorial[briefing.date];
  if(!entry?.title||!entry?.intro||!Array.isArray(entry.headings)||entry.headings.length!==briefing.articles.length)throw new Error(`브리핑 편집 정보 오류: ${briefing.date}`);
}

const briefings=incoming.briefings.sort((a,b)=>b.date.localeCompare(a.date));
if(JSON.stringify(briefings)===JSON.stringify(current.briefings)&&JSON.stringify(incomingEditorial)===JSON.stringify(currentEditorial)){
  console.log('NO_CHANGE');
  process.exit(0);
}
const output={updatedAt:incoming.updatedAt||new Date().toISOString(),syncStatus:incoming.syncStatus||'daily',missing:incoming.missing||[],briefings};
const temporary=new URL('../data/bondnote/.briefings.next.json',import.meta.url);
fs.writeFileSync(temporary,JSON.stringify(output));
const editorialTemporary=new URL('../data/bondnote/editorial/.posts.next.json',import.meta.url);
fs.writeFileSync(editorialTemporary,JSON.stringify(incomingEditorial,null,2)+'\n');
fs.renameSync(temporary,target);
fs.renameSync(editorialTemporary,editorialTarget);
console.log(`UPDATED ${briefings.length} briefings, ${briefings.flatMap(b=>b.articles).length} articles, latest ${briefings[0].date}`);
