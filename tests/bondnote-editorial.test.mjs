import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {validateEditorial,stripFacts,sourceLinks,ARCHIVE_CUTOFF} from '../scripts/lib/bondnote-editorial.mjs';
const source=JSON.parse(fs.readFileSync('data/bondnote/briefings.json','utf8'));
const editorial=JSON.parse(fs.readFileSync('data/bondnote/editorial/posts.json','utf8'));
// Select the evidence regime under test, independent of the latest daily entry.
const briefing=source.briefings.find(b=>b.date<=ARCHIVE_CUTOFF && editorial[b.date].notes.every(n=>n.facts.every(f=>f.verification==='archive')));
assert.ok(briefing,'a preserved archive fixture is required');
test('the entire archive uses the new manuscript and evidence contract',()=>{
 for(const b of source.briefings)validateEditorial(b,editorial[b.date]);
 assert.equal(Object.keys(editorial).length,source.briefings.length);
});
test('old template, untracked claims and invented evidence are rejected',()=>{
 const entry=structuredClone(editorial[briefing.date]);entry.styleVersion=1;
 assert.throws(()=>validateEditorial(briefing,entry),/version 2/);
 const untracked=structuredClone(editorial[briefing.date]);untracked.notes[0].parts[0]=stripFacts(untracked.notes[0].parts[0]);
 assert.throws(()=>validateEditorial(briefing,untracked),/untracked claim/);
 const fake=structuredClone(editorial[briefing.date]);fake.notes[0].facts[0].verification='archive';fake.notes[0].facts[0].quote='실제로 존재하지 않는 보관 인용';
 assert.throws(()=>validateEditorial(briefing,fake),/does not occur/);
 const number=structuredClone(editorial[briefing.date]);number.notes[0].parts[0]+='\n99999999999%';
 assert.throws(()=>validateEditorial(briefing,number),/untracked number/);
});
test('future briefings cannot pass off archive passages as primary verification',()=>{
 const future=structuredClone(briefing); future.date=new Date(Date.parse(`${ARCHIVE_CUTOFF}T00:00:00Z`)+86400000).toISOString().slice(0,10);
 assert.throws(()=>validateEditorial(future,editorial[briefing.date]),/require primary evidence/);
});
test('reading pages show standalone summaries, unique source links and honest evidence',()=>{
 for(const b of source.briefings){
  const html=fs.readFileSync(`dist/bondnote/${b.date}/index.html`,'utf8');
  assert.match(html,/Sources &(?:amp;)? evidence/);
  assert.ok(html.includes('DESK HYPOTHESIS'));
  assert.ok(html.includes('EARLIER BRIEFING RECORD')||html.includes('PRIMARY RECORD'));
  assert.ok(!html.includes('ARCHIVE EXCERPT'));
  assert.ok(!html.includes('READING FRAMEWORK'));
  assert.equal((html.match(/<ins /g)||[]).length,2);
  assert.ok(html.includes('data-ad-position="article-end"'));
  for(const note of editorial[b.date].notes){
   assert.ok(stripFacts(note.summary).length>=80);
   assert.ok(note.parts.length>=3);
   assert.ok(stripFacts(note.parts.join(' ')).length>=350);
   const section=html.split(`id="note-${note.id}"`)[1].split('</section>')[0];
   assert.ok(section.includes('IN BRIEF'));
   const external=[...section.matchAll(/href="(https?:[^\"]+)"/g)].map(m=>m[1]);
   assert.equal(external.length,new Set(external).size,`${note.id}: repeated publication URL`);
   assert.ok(external.length>=1);
   const evidence=html.split(`id="evidence-${note.id}"`)[1].split('</details>')[0];
   if(note.facts.every(f=>f.verification==='archive'))assert.ok(!evidence.includes('<blockquote'));
  }
 }
});
test('source URLs are deduplicated across metadata and body without losing distinct publications',()=>{
 const links=sourceLinks({links:[{url:'https://example.com/paper',label:'Paper'},{url:'https://example.com/paper#methods',label:'Methods'},{url:'https://example.com/paper?utm_source=chatgpt.com',label:'Tracked copy'}],body:'[Paper](https://example.com/paper) https://example.com/other'});
 assert.deepEqual(links.map(l=>l.url),['https://example.com/paper','https://example.com/other']);
});
test('a primary quotation cannot simply repeat its Korean paraphrase',()=>{
 const entry=structuredClone(editorial[briefing.date]);
 const fact=entry.notes[0].facts[0];fact.verification='primary';fact.quote=fact.statement;
 assert.throws(()=>validateEditorial(briefing,entry),/repeats the claim/);
});

test('a copied summary and repeated inline source links cannot masquerade as a clear rewrite',()=>{
 const copy=structuredClone(editorial[briefing.date]);
 copy.notes[0].summary=copy.notes[0].parts[0];
 assert.throws(()=>validateEditorial(briefing,copy),/summary repeats/);
 const inline=structuredClone(editorial[briefing.date]);
 inline.notes[0].parts[0]+=' [Source](https://example.com/paper)';
 assert.throws(()=>validateEditorial(briefing,inline),/unique source list/);
});

test('new publicly stored primary evidence keeps short quotation anchors',()=>{
 const future=structuredClone(briefing);future.date='2026-10-06';
 const entry=structuredClone(editorial[briefing.date]);
 entry.notes.forEach(n=>n.facts.forEach(f=>f.verification='primary'));
 entry.notes[0].facts[0].quote='original '.repeat(26).trim();
 assert.throws(()=>validateEditorial(future,entry),/quotation budget/);
});


test('English month/year anchors support translated dates without allowing a different month',()=>{
 const day=source.briefings.find(b=>b.date==='2026-10-06');
 const entry=structuredClone(editorial[day.date]);
 validateEditorial(day,entry);
 const before=entry.notes[0].parts[1];
 entry.notes[0].parts[1]=before.replace('2024년 5월','2024년 6월');
 assert.notEqual(entry.notes[0].parts[1],before);
 assert.throws(()=>validateEditorial(day,entry),/untracked number 6/);
});
