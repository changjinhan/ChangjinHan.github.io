export const STYLE_VERSION = 2;
// The existing archive was restyled on this date; later notes require primary evidence.
export const ARCHIVE_CUTOFF = '2026-10-04';
export const stripFacts = text => String(text || '').replace(/<!--\s*F\d+(?:\s+F\d+)*\s*-->/g, '').trim();
const normalized = text => String(text || '').replace(/\s+/g, ' ').trim();
const refs = text => [...String(text).matchAll(/<!--\s*(F\d+(?:\s+F\d+)*)\s*-->/g)].flatMap(m => m[1].split(/\s+/));

export function sourceLinks(source) {
 const links = [...(source.links || [])];
 for (const match of source.body.matchAll(/https?:\/\/[^\s<>)]+/g)) {
  const url = match[0].replace(/[),.;]+$/, '');
  if (!links.some(l => l.url === url)) links.push({url, label: 'Read the source'});
 }
 return links;
}

// Validate the manuscript before either publisher accepts it. Archive evidence
// is deliberately distinct from a passage re-read in the primary publication.
export function validateEditorial(briefing, entry) {
  const fail = message => { throw new Error(`${briefing.date}: ${message}`); };
  if (briefing.articles.length !== 5) fail('exactly five research notes required');
  if (entry?.styleVersion !== STYLE_VERSION) fail('paper-report editorial version 2 required');
  for (const key of ['title', 'intro', 'closing']) if (!entry[key]?.trim()) fail(`${key} missing`);
  if (!Array.isArray(entry.headings) || entry.headings.length !== briefing.articles.length) fail('heading count mismatch');
  if (!Array.isArray(entry.notes) || entry.notes.length !== briefing.articles.length) fail('note count mismatch');
  const ids = new Set();
  entry.notes.forEach((note, i) => {
    const source = briefing.articles[i];
    if (note.id !== source.id || ids.has(note.id)) fail(`note order or ID mismatch: ${note.id}`);
    ids.add(note.id);
    if (!entry.headings[i]?.trim() || !note.question?.trim() || !note.idea?.trim() || !note.caveat?.trim()) fail(`incomplete note: ${note.id}`);
    if (!Array.isArray(note.parts) || note.parts.length < 2 || note.parts.some(p => !p?.trim())) fail(`manuscript missing: ${note.id}`);
    if (!Array.isArray(note.facts) || !note.facts.length) fail(`evidence ledger missing: ${note.id}`);
    const factIds = new Set();
    note.facts.forEach(f => {
      if (!/^F\d+$/.test(f.id) || factIds.has(f.id)) fail(`duplicate or invalid fact: ${note.id}/${f.id}`);
      factIds.add(f.id);
      if (!f.statement?.trim() || !f.quote?.trim() || !f.location?.trim()) fail(`incomplete evidence: ${note.id}/${f.id}`);
      if (!sourceLinks(source).some(l => l.url === f.url) && !(f.verification === 'archive' && !sourceLinks(source).length && f.url === `https://changjinhan.github.io/bondnote/${briefing.date}/#original`)) fail(`evidence URL not in source record: ${note.id}/${f.id}`);
      if (briefing.date > ARCHIVE_CUTOFF && f.verification !== 'primary') fail(`new notes require primary evidence: ${note.id}/${f.id}`);
      if (!['archive', 'primary'].includes(f.verification)) fail(`invalid verification: ${note.id}/${f.id}`);
      if (f.verification === 'archive' && !normalized(source.body + '\n' + source.summary).includes(normalized(f.quote))) fail(`archive quote does not occur in original: ${note.id}/${f.id}`);
    });
    note.parts.forEach((part, j) => {
      const cited = refs(part);
      if (!cited.length || cited.some(id => !factIds.has(id))) fail(`untracked claim: ${note.id}/part ${j + 1}`);
      if (!/\[[^\]]+\]\(https?:\/\/[^\s)]+\)/.test(part)) fail(`inline source link missing: ${note.id}/part ${j + 1}`);
      const prose = stripFacts(part).replace(/\[[^\]]*\]\([^)]*\)/g, '').replace(/https?:\/\/\S+/g, '');
      const evidence = cited.map(id => note.facts.find(f => f.id === id).quote).join(' ');
      for (const token of prose.match(/\d+(?:[,.]\d+)*/g) || []) {
        if (!(evidence.match(/\d+(?:[,.]\d+)*/g) || []).includes(token)) fail(`untracked number ${token}: ${note.id}/part ${j + 1}`);
      }
    });
  });
}

export function buildPosts(data, editorial) {
  return data.briefings.map(briefing => {
    const entry = editorial[briefing.date];
    validateEditorial(briefing, entry);
    const articles = briefing.articles.map((source, i) => {
      const note = entry.notes[i];
      return {id: source.id, heading: entry.headings[i], originalTitle: source.title,
        question: note.question, paragraphs: note.parts, implications: [note.idea],
        caveats: [note.caveat], facts: note.facts, links: sourceLinks(source).length ? sourceLinks(source) : [{url: `https://changjinhan.github.io/bondnote/${briefing.date}/#original`, label: 'Archive record · original source URL unavailable'}], tags: source.tags};
    });
    const text = [entry.intro, entry.closing, ...articles.flatMap(a => [...a.paragraphs, ...a.implications, ...a.caveats])].join('');
    return {id: briefing.id, date: briefing.date, styleVersion: STYLE_VERSION, title: entry.title,
      intro: entry.intro, closing: entry.closing, edited: true, articles,
      sourceIds: articles.map(a => a.id), readMinutes: Math.max(3, Math.ceil(stripFacts(text).length / 550))};
  }).sort((a, b) => b.date.localeCompare(a.date));
}
