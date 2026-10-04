# Bondnote editorial contract · version 2

User-selected writing skill: [subinium/re-sseol-ch / paper-report](https://github.com/subinium/re-sseol-ch/tree/main/skills/paper-report), MIT. A copy is stored in `.openai/skills/paper-report/`. Read its SKILL.md, planning, style, fact-check and rubric references before drafting.

This is a daily fixed-income research notebook, adapting the skill's long single-paper report to **five research notes**. Each day has one guiding question, five individual explanations and a three-line close. Use two to four short evidence paragraphs per note rather than mechanically repeating a 10–26-part paper report five times. This daily scope takes precedence over the upstream part-count and image-count targets. A single-paper deep dive can use the complete upstream format.

## Research and evidence

- Read the actual primary publication, not just a search result. Read the paper in full when a paper is the chosen source. Retain the exact source title, publication date, accessed date, version and location. An inaccessible paper must be replaced by another accessible source or explicitly held as an unpublished draft.
- Build the fact ledger **before** the outline and manuscript. Record exact source excerpts; one record per claim, retaining conditions, comparison, uncertainty and units. No invented lineage, people, affiliation, performance or model details. Re-read important tables and numbers in their original context.
- For new notes use `verification: "primary"` only for a publication actually read. A historical quote from the old briefing has `verification: "archive"`; it is not a new primary verification. Existing archive records and URLs remain available.
- An internal quant-company strategy, label or P&L is unknown unless explicitly published. Hiring material is not evidence of a deployed profitable strategy. Do not use job ads to fill the quant section.
- Keep desk hypotheses in `idea`, separate from research findings. No direct investment orders. Keep limitations in `caveat`. Distinguish estimates, forecasts, simulations and empirical results.

## Voice and narrative

- Korean 음슴체, one breath per line, usually 8–30 characters and at most 40 where natural. Use line breaks to preserve clauses, not an automatic character counter. Vary endings naturally. Site controls remain English; research titles keep their original language.
- Start with a real question arising from the material. Explain what happens first, then name the technical concept. Connect the next paragraph to the previous result. Keep the scope narrow enough for the evidence to support it.
- No per-paragraph subheadings, numbered boilerplate, colon titles, hype, insult, invented metaphors or repetitive “핵심은”, “A가 아니라 B”, “알아보자”, “게임 체인저”. Do not convert prose by replacing sentence endings mechanically.
- End with three short lines that answer the day's question and leave a specific test or unresolved condition. The conclusion must be grounded in the notes and vary with the material.
- Put a clickable Markdown source link immediately after the factual passage. Never translate or rewrite URLs. The reader renders safe Markdown and line breaks; raw HTML is not permitted.

## Data contract

Keep `data/source.json`, `data/briefings.json`, article IDs and prior dates. The original daily heading/date/1–5 structure required by `scripts-build-data.mjs` remains the ingest format; the published notebook uses the editorial below. Save the full original briefing plus its metadata in source.json. Add today's editorial to `data/editorial/posts.json`, keyed by YYYY-MM-DD:

```json
{
  "styleVersion": 2,
  "title": "그날 자료를 묶는 짧은 제목",
  "intro": "도입의 짧은 장면\n그 장면에서 나오는 질문?",
  "closing": "질문에 대한 답\n답의 조건\n다음에 확인할 구체적인 항목",
  "headings": ["연구별 제목 다섯 개"],
  "notes": [{
    "id": "generated-YYYY-MM-DD-1",
    "question": "이 연구에서 확인하려는 질문?",
    "parts": [
      "짧은 설명\n원문의 결과와 조건을 보존한 문장 <!-- F1 -->\n[원문](https://example.com/publication)",
      "앞 결과에서 이어지는 설명\n근거와 한계를 포함한 문장 <!-- F2 -->\n[원문](https://example.com/publication)"
    ],
    "idea": "국내 데스크에서 시험해볼 가설\n검증할 데이터와 비교 기준을 적음",
    "caveat": "공개 자료가 뒷받침하는 범위와 아직 모르는 부분",
    "facts": [{
      "id": "F1",
      "statement": "본문에 사용하는 사실 하나",
      "quote": "Exact verbatim passage actually read in the source",
      "location": "Publication title, version, page/section, accessed YYYY-MM-DD",
      "url": "https://example.com/publication",
      "verification": "primary"
    }]
  }]
}
```

The arrays have exactly five entries in the same order as briefing.articles. Fact IDs are scoped per note; every factual part cites its supporting IDs using `<!-- F1 F2 -->`. Every fact URL belongs to that article's links. The migration cutoff is 2026-10-04; all later dates must use primary evidence. Twenty historical notes did not retain a publication URL; their archive-only links point to the original briefing record and are explicitly labelled as missing a source URL. Include F2 if the manuscript cites F2. Existing `essays` and `figure` fields are obsolete and must not be used as the publication path.

## Checks and publication

1. Outline the guiding question and paragraph connections after the ledger. Review facts, flow and AI phrasing independently where subagents are available. Preserve uncertainty when correcting text.
2. Run `scripts-build-data.mjs` for newly saved raw messages, then `scripts-build-blog.mjs`. The shared `scripts/lib/bondnote-editorial.mjs` rejects missing v2 notes, ID/order mismatches, missing facts, unsupported numbers, invalid source URLs and archive quotations not found in the original record.
3. The upstream `check_report.py` can check individual exported manuscripts and ledgers. For this daily adaptation, review long-report-specific warnings about part counts, images and recurring narrative markers rather than padding the report. Fix factual, wording and line-length errors.
4. Build and verify five notes, short line breaks, links in the opening/body/close, safe Markdown, source ledgers, mobile reading, and preservation of every old date and ID. Stop publication if the contract or preservation checks fail; keep the draft for recovery.
5. Publish to the existing private Site using the Sites source workflow and current hosting skill. Verify deployment succeeds. The separate Codex blog uploader imports the same editorial, builds/tests, pushes GitHub master and verifies Pages. Do not claim GitHub success in the source-writing task.

Do not redesign templates, overwrite old editorials or change Site access during a routine daily run. On a repeated date, resume its saved draft and publication state instead of duplicating it. Do not fill missing historical dates without their real source.
