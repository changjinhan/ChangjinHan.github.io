# Bondnote editorial contract · revision 3

User-selected research skill: [subinium/re-sseol-ch / paper-report](https://github.com/subinium/re-sseol-ch/tree/main/skills/paper-report), MIT; vendored in `.openai/skills/paper-report/`. Read its fact-check, planning, style and rubric references. This contract adapts it to five daily fixed-income research notes. The user's October 5 correction takes precedence over the skill's community slang, 음슴체, forced short-line layout and long single-paper part counts.

## Write for someone meeting the research for the first time

The reader should understand what was studied, how it was checked, what was found, why the finding makes sense and what remains unknown without opening the publication. Explain the research, rather than announcing that a paper exists. Use the readable core of [Karpathy's clarity advice](https://x.com/karpathy/status/2105819303471976479): clear subjects, plain words, consistent terms and a connected argument. Do not enforce English sentence-length rules on Korean.

- Write natural, professional Korean with complete '-다' sentences and ordinary paragraphs. Define an unfamiliar term or abbreviation when it first matters. Explain the economic action before relying on a label. Keep menus, controls and provenance labels in English; retain original research titles.
- Each note starts with a **standalone summary**. Give the concrete problem, method or evidence, actual finding and decisive condition in about 150–320 Korean characters. Its purpose is understanding, not teasing the article. It must not copy a body paragraph.
- The body normally has three to five connected paragraphs, roughly 500–1,000 Korean characters, adjusted to the available evidence. Begin from the actual question; explain the mechanism, data or experiment; report the comparison and result; identify its meaning and limits. These are reasoning requirements, not mandatory subheadings or a repeated paragraph template. Do not pad sparse sources.
- Include sample, period, benchmark, units, magnitude and uncertainty **when the publication reports them**. Never manufacture a sample, coefficient or trading result to make a note look substantial. Distinguish simulation, association, identification, policy judgement and a company product claim.
- A framework or company engineering post needs an explanation of how the process works and what it enables. It does not establish profitable proprietary signals. Hiring material cannot stand in for research evidence.
- Separate the domestic desk hypothesis (`idea`) from the publication's findings. Give a concrete dataset, comparison and evaluation criterion, not a direct trade recommendation. State the specific scope limit in `caveat`.
- No forced 40-character line breaks, translated noun piles, rhetorical hype, repeated “핵심은”, “A가 아니라 B”, generic three-line endings, copied summaries, or paragraphs consisting of a pasted earlier briefing quote. Titles and daily opening/close must reflect that day's actual material.

## Evidence before manuscript

Read the selected original publication, not a search snippet. For a paper, read the full paper when accessible; when only an official HTML summary is available, describe only that summary's verified claims and name the access limit. Do not pretend to have read PDF pages or to have reproduced an experiment.

Newly authored primary quotations in the publicly stored ledger total at most 25 words per publication. Use short exact anchors and record the wider checked context in your own statement with precise source locations; do not reproduce long source paragraphs in JSON. Preserve user-provided historical ledger records unchanged in the audit trail.

Build the fact ledger before outlining. Every substantive factual passage, including the standalone summary, carries `<!-- F1 F2 -->` tags. One record per supported claim, with an exact source quotation, original URL, publication/version, precise section or page and access date. Preserve context and units. Primary quotations remain in the publication's actual language; never back-translate a Korean paraphrase into an invented English original.

`verification: "primary"` means the recorded publication passage was actually checked. `verification: "archive"` means the quotation is from the earlier Korean briefing, not the primary publication. Existing archive provenance and source-URL-unavailable markers remain honest. An archive record must match the original saved briefing exactly. Correcting a prior mistaken primary record retains it in `legacyFacts` for the audit trail rather than continuing to cite it.

New dates after `2026-10-04` require primary records for every active fact. Unverified new source passages stay unpublished; never generate empty or pretend-primary ledgers. A narrow official summary can be used only within its stated limits. Historical editorial rewriting does not turn archived claims into primary verification.

## Links and visible evidence

Do not put repeated publication URLs in `summary` or `parts`. Cite fact IDs internally; each note's source list is built from its original article links and shows each unique publication URL once. The renderer links the note to its own evidence section. Keep every original source URL in the raw record; never rewrite or translate a URL.

In Sources & evidence, primary records separate the Korean explanation from the actual original-language passage and precise location. Display short original quotations; avoid duplicate claim/quote text. Archive records are labelled **Earlier briefing record** and link to the preserved original briefing. Do not display the Korean briefing as an original-publication excerpt. Keep the complete internal ledger and original raw briefing for auditability.

## Data contract

Keep all original dates, daily/article IDs, `data/source.json` and `data/briefings.json`. Preserve the ingest daily heading/date/1–5 format in raw messages. Published editorial in `data/editorial/posts.json` is keyed by YYYY-MM-DD:

```json
{
  "styleVersion": 2,
  "editorialRevision": 3,
  "title": "A title specific to the day's research",
  "intro": "A concrete opening in Korean",
  "closing": "A grounded close specific to the findings",
  "headings": ["Five research titles, in article order"],
  "notes": [{
    "id": "the preserved article ID",
    "question": "The specific question this note answers",
    "summary": "A standalone Korean answer, distinct from the body <!-- F1 F2 -->",
    "parts": [
      "The question and necessary context in a complete paragraph <!-- F1 -->",
      "The actual evidence, method and comparison <!-- F2 -->",
      "The mechanism, interpretation and supported condition <!-- F1 F2 -->"
    ],
    "idea": "A separate domestic desk test with a comparison and metric",
    "caveat": "What the evidence actually covers and leaves unknown",
    "facts": [{
      "id": "F1",
      "statement": "The specific supported claim in Korean",
      "quote": "An exact passage in the source's original language",
      "location": "Title, version/date, section/page, accessed date",
      "url": "https://example.com/publication",
      "verification": "primary"
    }]
  }]
}
```

Both arrays have exactly five entries, ordered to match briefing.articles. Fact IDs are scoped to each note. Numeric prose tokens must occur in the cited quotations; preserve units and distinguish percent, percentage points and basis points. The reader removes internal fact tags. Old essays/figure fields are not the publication path.

## Review and publication

1. Outline after the ledger. Check the standalone summary from the perspective of a reader who has never seen the paper. Explain each necessary term, cause and condition; do not just list topic nouns.
2. Independently review factual support, flow and artificial phrasing. Where subagents are available, use bounded research/review assignments. Review the manuscript, not merely its character count. Fix repeats and missing explanations without strengthening uncertain results.
3. Run data generation when raw messages changed and build the notebook with the shared `scripts/lib/bondnote-editorial.mjs` validator. It checks revision, five ordered notes, summaries, evidence tags/numbers, source matching, archival quote fidelity, primary status for new dates and duplicate manuscript text. A passing validator is a structural check, not a substitute for reading the source.
4. Build and verify daily and individual-note pages, readable desktop/mobile paragraphs, standalone summaries, unique publication links, honest primary/archive displays, all historical dates/IDs and existing advertising. Keep test fixtures independent of whichever date happens to be newest.
5. Publish the existing private Site using its current Sites workflow without changing access. The separate blog uploader imports identical editorial data, builds/tests, pushes GitHub master and confirms the Pages deployment and live date. Never claim GitHub publication from the source writer alone.

During routine daily runs, add the new researched day and leave older editorial intact. Resume a saved same-date draft rather than duplicating it. Do not backfill missing dates without actual records. Publication stops when validation fails, retaining the draft for recovery.
