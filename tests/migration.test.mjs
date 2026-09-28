import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {posts,legacyAliases,bondPosts,bondArticles,bondData,postPaths,bondUrl,articleUrl} from '../src/lib/content.mjs';

test('every Markdown post has a unique URL; shared old URLs resolve to the latest post',()=>{
  assert.equal(posts.length,fs.readdirSync('_posts').filter(f=>f.endsWith('.md')).length);
  assert.equal(new Set(posts.map(p=>p.url)).size,posts.length);
  assert.equal(new Set(postPaths().map(p=>p.params.path)).size,postPaths().length);
  for(const a of legacyAliases) assert.equal(a.target,posts.find(p=>p.legacy===a.url).url);
  for(const p of posts) assert.ok(fs.existsSync(`dist${p.url}index.html`),p.url);
});
test('Bondnote preserves every date, article ID, editorial paragraph and source link',()=>{
  assert.deepEqual(bondPosts.map(p=>p.date).sort(),bondData.briefings.map(p=>p.date).sort());
  assert.deepEqual(bondPosts.flatMap(p=>p.sourceIds).sort(),bondArticles.map(a=>a.id).sort());
  assert.equal(new Set(bondArticles.map(a=>a.id)).size,bondArticles.length);
  for(const p of bondPosts){
    const html=fs.readFileSync(`dist${bondUrl(p)}index.html`,'utf8');
    assert.ok(html.includes('편집 전 브리핑 원문 펼치기'));
    assert.equal(p.articles.length,bondData.briefings.find(b=>b.id===p.id).articles.length);
    for(const a of p.articles){assert.ok(a.paragraphs.length>0);assert.ok(fs.existsSync(`dist${articleUrl(a)}index.html`));for(const l of a.links)assert.ok(html.includes(l.url.replaceAll('&','&amp;')),l.url);}
  }
});
test('Markdown source links in a research note lead render as clickable links',()=>{
  const article=bondArticles.find(a=>a.id==='generated-2026-09-27-2');
  assert.ok(article);
  const html=fs.readFileSync(`dist${articleUrl(article)}index.html`,'utf8');
  assert.match(html,/<a href="https:\/\/libertystreeteconomics\.newyorkfed\.org\/2026\/05\/the-global-credit-cycle-in-corporate-bond-returns\/">뉴욕 연은 연구<\/a>/);
  assert.ok(!html.includes('[뉴욕 연은 연구](https://'));
});
test('Sites importer keeps existing articles and brings over the edited new briefing',()=>{
  const dir=fs.mkdtempSync(path.join(os.tmpdir(),'bondnote-import-'));
  try{
    fs.mkdirSync(path.join(dir,'scripts'));
    fs.mkdirSync(path.join(dir,'data/bondnote/editorial'),{recursive:true});
    fs.copyFileSync('scripts/bondnote-import-sites.mjs',path.join(dir,'scripts/bondnote-import-sites.mjs'));
    const original=JSON.parse(fs.readFileSync('data/bondnote/briefings.json','utf8'));
    const editorial=JSON.parse(fs.readFileSync('data/bondnote/editorial/posts.json','utf8'));
    fs.writeFileSync(path.join(dir,'data/bondnote/briefings.json'),JSON.stringify(original));
    fs.writeFileSync(path.join(dir,'data/bondnote/editorial/posts.json'),JSON.stringify(editorial));
    const added=structuredClone(original.briefings[0]);
    const latest=original.briefings.reduce((date,briefing)=>briefing.date>date?briefing.date:date,'');
    added.date=new Date(Date.parse(`${latest}T00:00:00Z`)+86400000).toISOString().slice(0,10);
    added.id=`test-${added.date}`;
    added.articles.forEach((a,i)=>{a.id=`test-${added.date}-${i+1}`;a.date=added.date;});
    const next={...original,briefings:[added,...original.briefings]};
    const nextEditorial={...editorial,[added.date]:structuredClone(editorial[original.briefings[0].date])};
    const briefingPath=path.join(dir,'incoming-briefings.json');
    const editorialPath=path.join(dir,'incoming-editorial.json');
    fs.writeFileSync(briefingPath,JSON.stringify(next));
    fs.writeFileSync(editorialPath,JSON.stringify(nextEditorial));
    const result=execFileSync(process.execPath,[path.join(dir,'scripts/bondnote-import-sites.mjs'),briefingPath,editorialPath],{encoding:'utf8'});
    const expectedArticles=original.briefings.reduce((count,briefing)=>count+briefing.articles.length,added.articles.length);
    assert.match(result,new RegExp(`UPDATED ${original.briefings.length+1} briefings, ${expectedArticles} articles`));
    assert.equal(JSON.parse(fs.readFileSync(path.join(dir,'data/bondnote/briefings.json'),'utf8')).briefings[0].date,added.date);
    assert.ok(JSON.parse(fs.readFileSync(path.join(dir,'data/bondnote/editorial/posts.json'),'utf8'))[added.date]);
  }finally{fs.rmSync(dir,{recursive:true,force:true});}
});
test('AdSense publisher, ads.txt and original two article placements survive migration',()=>{
  assert.equal(fs.readFileSync('ads.txt','utf8'),fs.readFileSync('dist/ads.txt','utf8'));
  const home=fs.readFileSync('dist/index.html','utf8');
  const post=fs.readFileSync(`dist${posts[0].url}index.html`,'utf8');
  assert.ok(home.includes('ca-pub-5927336110095461'));
  assert.equal((home.match(/<ins /g)||[]).length,1);
  assert.equal((post.match(/<ins /g)||[]).length,2);
  assert.ok(post.includes('data-ad-position="article-end"'));
});
test('shared navigation points to native Bondnote and all local links and media resolve',()=>{
  const files=fs.readdirSync('dist',{recursive:true}).filter(f=>f.endsWith('.html'));
  for(const f of files){
    const html=fs.readFileSync('dist/'+f,'utf8');
    assert.ok(!html.includes('bond-ai-intelligence.changjin9653.chatgpt.site'),f);
    for(const match of html.matchAll(/(?:href|src)="(\/[^"#]*)"/g)){
      if(match[1].startsWith('//'))continue;
      const url=new URL(match[1].replaceAll('&amp;','&'),'https://changjinhan.github.io');
      const file='dist'+decodeURIComponent(url.pathname);
      assert.ok(fs.existsSync(file)||fs.existsSync(file+'/index.html'),`${f}: ${match[1]}`);
    }
  }
});
