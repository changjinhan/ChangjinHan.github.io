import fs from 'node:fs';
import {buildPosts} from './lib/bondnote-editorial.mjs';
const data = JSON.parse(fs.readFileSync(new URL('../data/bondnote/briefings.json', import.meta.url), 'utf8'));
const editorial = JSON.parse(fs.readFileSync(new URL('../data/bondnote/editorial/posts.json', import.meta.url), 'utf8'));
const posts = buildPosts(data, editorial);
fs.writeFileSync(new URL('../data/bondnote/blog.json', import.meta.url), JSON.stringify(posts));
console.log({posts: posts.length, researchNotes: posts.flatMap(p => p.articles).length, styleVersion: 2});
