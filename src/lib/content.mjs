import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import MarkdownIt from 'markdown-it';
import anchor from 'markdown-it-anchor';
import attrs from 'markdown-it-attrs';
import footnote from 'markdown-it-footnote';

export const slug = s => String(s).normalize('NFC').toLowerCase().replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-|-$/g, '');
export const clean = s => String(s || '').replace(/[^]*/g, '').replace(/<[^>]*>/g, '').replace(/[*`#]/g, '').trim();
export const md = new MarkdownIt({ html: true, linkify: true, typographer: true }).use(anchor, { slugify: slug }).use(attrs).use(footnote);
export const dateLabel = date => date.replaceAll('-', '.');
const list = v => Array.isArray(v) ? v : v ? [v] : [];
const files = fs.readdirSync('_posts').filter(f => f.endsWith('.md'));
const raw = files.map(file => {
  const {data, content} = matter(fs.readFileSync(path.join('_posts', file), 'utf8'));
  const date = file.slice(0, 10);
  const fileSlug = file.slice(11, -3).normalize('NFC').replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-|-$/g, '');
  const categories = list(data.categories);
  const legacy = data.permalink || '/' + [...categories.map(c => String(c).toLowerCase()), fileSlug].join('/') + '/';
  return {file, date, fileSlug, legacy, categories, tags:list(data.tags), title:String(data.title || fileSlug), description:clean(data.excerpt || content.slice(0,180)), content, data};
}).sort((a,b) => b.date.localeCompare(a.date));
const counts = new Map();
raw.forEach(p => counts.set(p.legacy, (counts.get(p.legacy) || 0) + 1));
export const posts = raw.map(p => {
  // Seven weekly reviews used the same Jekyll URL. Give each its own address;
  // preserve the old shared URL as an alias of the newest review.
  const url = counts.get(p.legacy) > 1 ? `/blog/${p.date}-${slug(p.fileSlug)}/` : p.legacy;
  const displayTitle = p.title.replace(/^\[[^\]]+\]\s*/, '');
  const tokens = md.parse(p.content, {});
  const headings = tokens.flatMap((t,i) => t.type === 'heading_open' && ['h2','h3'].includes(t.tag) ? [{id:t.attrGet('id'),text:clean(tokens[i+1].content),level:t.tag}] : []);
  const html = md.renderer.render(tokens, md.options, {}).replace(/(src|href)="(?:\.\/)?assets\//g, '$1="/assets/');
  return {...p,url,displayTitle,html,headings,minutes:Math.max(2,Math.ceil(clean(p.content).length/650)), image:p.data.header?.teaser ? '/'+p.data.header.teaser.replace(/^\//,'') : null};
});
export const legacyAliases = [...new Set(posts.filter(p => p.url !== p.legacy).map(p => p.legacy))].map(url => ({url, target:posts.find(p => p.legacy === url).url}));
export function postPaths() {
  const articles = posts.map(post => ({ params: { path: post.url.slice(1,-1) }, props: { post } }));
  const aliases = legacyAliases.map(alias => ({ params: { path: alias.url.slice(1,-1) }, props: { alias } }));
  const pagination = Array.from({length:Math.ceil(posts.length/5)-1},(_,i)=>({params:{path:`page${i+2}`},props:{alias:{target:'/blog/'}}}));
  return [...articles,...aliases,...pagination];
}
export const bondData = JSON.parse(fs.readFileSync('data/bondnote/briefings.json','utf8'));
export const bondPosts = JSON.parse(fs.readFileSync('data/bondnote/blog.json','utf8')).sort((a,b)=>b.date.localeCompare(a.date));
export const bondArticles = bondData.briefings.flatMap(b => b.articles);
export const bondCategories = ['금리 · 커브','크레딧','거래 · 유동성','AI · 모델','리스크 · 운용','퀀트사 동향'];
export const bondUrl = p => `/bondnote/${p.date}/`;
export const articleUrl = a => `/bondnote/research/${a.id}/`;
export const topics = ['전체', 'Speech & Audio', 'AI & Agents', 'Time Series'];
export function topicFor(p) {
  const s = [p.title,...p.tags].join(' ');
  return /time.series|stock|금융|Informer|N-BEATS|forecasting/i.test(s) ? 'Time Series' : /Agent|LLM|이번 주|language model/i.test(s) ? 'AI & Agents' : 'Speech & Audio';
}
