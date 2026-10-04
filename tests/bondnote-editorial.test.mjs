import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {validateEditorial,stripFacts} from '../scripts/lib/bondnote-editorial.mjs';
const source=JSON.parse(fs.readFileSync('data/bondnote/briefings.json','utf8'));
const editorial=JSON.parse(fs.readFileSync('data/bondnote/editorial/posts.json','utf8'));
const briefing=source.briefings[0];
test('the entire archive uses the new manuscript and evidence contract',()=>{
 for(const b of source.briefings)validateEditorial(b,editorial[b.date]);
 assert.equal(Object.keys(editorial).length,source.briefings.length);
});
test('old template, untracked claims and invented evidence are rejected',()=>{
 const entry=structuredClone(editorial[briefing.date]);entry.styleVersion=1;
 assert.throws(()=>validateEditorial(briefing,entry),/version 2/);
 const untracked=structuredClone(editorial[briefing.date]);untracked.notes[0].parts[0]='출처 없는 주장임';
 assert.throws(()=>validateEditorial(briefing,untracked),/untracked claim/);
 const fake=structuredClone(editorial[briefing.date]);fake.notes[0].facts[0].verification='archive';fake.notes[0].facts[0].quote='실제로 존재하지 않는 보관 인용';
 assert.throws(()=>validateEditorial(briefing,fake),/does not occur/);
 const number=structuredClone(editorial[briefing.date]);number.notes[0].parts[0]+='\n99999999999%';
 assert.throws(()=>validateEditorial(briefing,number),/untracked number/);
});
test('future briefings cannot pass off archive passages as primary verification',()=>{
 const future=structuredClone(briefing); future.date='2026-10-05';
 assert.throws(()=>validateEditorial(future,editorial[briefing.date]),/require primary evidence/);
});
test('new reading pages retain short lines, immediate links, source drawers and ads',()=>{
 for(const b of source.briefings){
  const html=fs.readFileSync(`dist/bondnote/${b.date}/index.html`,'utf8');
  assert.match(html,/Sources &(?:amp;)? evidence/);
  assert.ok(html.includes('DESK HYPOTHESIS'));
  assert.ok(html.includes('ARCHIVE EXCERPT')||html.includes('PRIMARY EXCERPT'));
  assert.ok(!html.includes('READING FRAMEWORK'));
  assert.equal((html.match(/<ins /g)||[]).length,2);
  assert.ok(html.includes('data-ad-position="article-end"'));
  for(const note of editorial[b.date].notes){
   assert.ok(note.parts.every(p=>stripFacts(p).includes('\n')));
   const section=html.split(`id="note-${note.id}"`)[1].split('</section>')[0];
   assert.ok(section.includes('<br'));
   assert.ok(/class="bn-story"[\s\S]*?<a href="https?:/.test(section));
  }
 }
});
