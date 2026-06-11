#!/usr/bin/env node
/**
 * indexcard-ssg — compile.js
 * Usage: node compile.js [input.md] [output.html]
 * Defaults: content.md → index.html
 */

const fs   = require('fs');
const path = require('path');

// ─── CLI args ────────────────────────────────────────────────────────────────
const inputFile  = process.argv[2] || 'content.md';

const outputFile = process.argv[2]
  ? inputFile.replace(/\.md$/i, '') + '.html'
  : 'index.html';


if (!fs.existsSync(inputFile)) {
  console.error(`✗ Input file not found: ${inputFile}`);
  process.exit(1);
}

const raw = fs.readFileSync(inputFile, 'utf8');

// ─── Frontmatter parser ──────────────────────────────────────────────────────
function parseFrontmatter(src) {
  const match = src.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) return { meta: {}, body: src };
  const meta = {};
  match[1].split('\n').forEach(line => {
    const colon = line.indexOf(':');
    if (colon === -1) return;
    const key = line.slice(0, colon).trim();
    const val = line.slice(colon + 1).trim();
    meta[key] = val;
  });
  return { meta, body: match[2] };
}

// ─── Inline markdown (bold, italic, code) ────────────────────────────────────
function inlineMd(text) {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g,     '<em>$1</em>')
    .replace(/`(.+?)`/g,       '<code>$1</code>');
}

// ─── Block parsers ───────────────────────────────────────────────────────────

function parseCard(colour, inner) {
  const lines = inner.trim().split('\n');
  let header = '', body = [];
  lines.forEach(l => {
    if (l.startsWith('### ')) header = l.slice(4).trim();
    else body.push(l);
  });
  return `
  <div class="index-card">
    <div class="card-tab" style="background:var(--${colour})"></div>
    ${header ? `<div class="card-header">${header}</div>` : ''}
    <div class="card-body">${inlineMd(body.filter(Boolean).join(' '))}</div>
  </div>`;
}

function parseNotebook(inner) {
  const lines = inner.trim().split('\n');
  let tabs = [], caption = '';
  lines.forEach(l => {
    if (l.startsWith('tabs:'))    tabs    = l.slice(5).split(',').map(s => s.trim());
    if (l.startsWith('caption:')) caption = l.slice(8).trim();
  });
  const colours = { terra: '#C9664A', gold: '#C9A84C', sage: '#6A8C69', slate: '#8C9BAB', blue: '#2E4057' };
  const pages = tabs.map((t, i) => `
      <div class="nb-page" style="--delay:${i * 0.05}s">
        <div class="nb-tab" style="background:${colours[t] || '#aaa'}"></div>
        <div class="nb-lines"></div>
        <div class="nb-page-num">0${i + 1}</div>
      </div>`).join('');
  return `
  <div class="notebook-visual">
    <div class="notebook-spine"></div>
    <div class="notebook-pages">${pages}
    </div>
    ${caption ? `<p class="nb-caption">${caption}</p>` : ''}
  </div>`;
}

function parseCompare(inner) {
  const sides = inner.trim().split(/^===\s*/m).filter(Boolean);
  const renderSide = (side, cls) => {
    const lines = side.split('\n').filter(Boolean);
    const label = lines[0].trim();
    const items = lines.slice(1).map(l => `<li>${l.trim()}</li>`).join('');
    return `
    <div class="compare-col ${cls}">
      <div class="compare-label">${label}</div>
      <ul class="compare-list">${items}</ul>
    </div>`;
  };
  return `
  <div class="compare-row">
    ${renderSide(sides[0], 'loose')}
    <div class="compare-divider">+</div>
    ${sides[1] ? renderSide(sides[1], 'bound') : ''}
  </div>`;
}

function parseResult(title, inner) {
  return `
  <div class="evolution-result">
    <div class="evolution-badge">${title}</div>
    <p>${inlineMd(inner.trim())}</p>
  </div>`;
}

function parseDimensions(inner) {
  const cards = inner.trim().split('\n').filter(Boolean).map(line => {
    const [size, label, metric, colour] = line.split('|').map(s => s.trim());
    const [w, h] = size.split('x');
    const wPx = parseInt(w) * 14;
    const hPx = parseInt(h) * 14;
    return `
    <div class="dim-card">
      <div class="dim-card-tab" style="background:var(--${colour || 'blue'})"></div>
      <div class="dim-card-inner" style="width:${wPx}px;height:${hPx}px;"></div>
      <div class="dim-label">${label}</div>
      <div class="dim-size">${w} × ${h} in</div>
      <div class="dim-metric">${metric}</div>
    </div>`;
  }).join('');
  return `<div class="dimensions-row">${cards}</div>`;
}

function parseTabs(inner) {
  const items = inner.trim().split('\n').filter(Boolean).map(line => {
    const [colour, label, desc] = line.split('|').map(s => s.trim());
    return `
    <div class="colour-tab">
      <div class="dot" style="background:var(--${colour})"></div>
      <div class="colour-tab-text"><strong>${label}</strong><span>${desc}</span></div>
    </div>`;
  });
  // Group into rows of 2
  let html = '';
  for (let i = 0; i < items.length; i += 2) {
    html += `<div class="tab-row">${items[i]}${items[i + 1] || ''}</div>`;
  }
  return html;
}

function parseZettel(inner) {
  const rows = inner.trim().split('\n').filter(Boolean).map(line => {
    return line.split('|').map(s => s.trim());
  });
  // Build a flat 3-col grid; middle col (index 1) gets the center class
  const cells = rows.map(([left, center, right]) => `
      <div class="zettel-node left">${left || ''}</div>
      <div class="zettel-node center">${center || ''}</div>
      <div class="zettel-node right">${right || ''}</div>`).join('');
  return `
  <div class="zettel-grid">${cells}
  </div>`;
}

function parsePrompt(inner) {
  const lines = inner.trim().split('\n');
  let tags = [], quote = '';
  lines.forEach(l => {
    if (l.startsWith('tags:'))  tags  = l.slice(5).split(',').map(s => s.trim());
    if (l.startsWith('quote:')) quote = l.slice(6).trim();
  });
  const tagHtml = tags.map((t, i) =>
    `<span class="prompt-tag ${i === 0 ? 'class' : 'object'}">${t}</span>`
  ).join('');
  return `
  <div class="prompt-card">
    <div class="prompt-label">Structured Thinking</div>
    <div class="prompt-row">${tagHtml}</div>
    <div class="prompt-text">"${inlineMd(quote)}"</div>
  </div>`;
}

function parseNodes(inner) {
  const items = inner.trim().split('\n').filter(Boolean).map(line => {
    const [label, colour] = line.split('|').map(s => s.trim());
    return `
    <div class="node-folder">
      <div style="position:absolute;top:0;left:12px;width:28px;height:5px;border-radius:2px 2px 0 0;background:var(--${colour || 'blue'})"></div>
      <span>${label}</span>
    </div>`;
  }).join('');
  return `<div class="node-grid">${items}</div>`;
}

// ─── Section themes ──────────────────────────────────────────────────────────
// Sections with key "Evolution" get the dark blue treatment
const DARK_SECTIONS = ['evolution'];

// ─── Main parser ─────────────────────────────────────────────────────────────
function parseBody(body) {
  // Split into sections at ## headings
  const sectionChunks = body.split(/^(?=## )/m).filter(s => s.trim());

  return sectionChunks.map(chunk => {
    const lines = chunk.split('\n');
    const heading = lines[0].replace(/^##\s*/, '').trim();
    const content = lines.slice(1).join('\n');

    // Parse "key | Title" from heading
    const headParts = heading.split('|').map(s => s.trim());
    const sectionKey   = headParts[0].toLowerCase().replace(/\s+/g, '-');
    const sectionTitle = headParts[1] || headParts[0];
    const isDark       = DARK_SECTIONS.includes(sectionKey);

    const innerHtml = parseContent(content);

    if (isDark) {
      return `
<div class="divider"></div>
<section class="section dark-section" style="max-width:100%;background:var(--blue);padding:48px 20px 56px;">
  <div style="max-width:600px;margin:0 auto;">
    <p class="section-label" style="color:var(--gold);">${headParts[0]}</p>
    <h2 class="section-title" style="color:#fff;">${sectionTitle}</h2>
    ${innerHtml}
  </div>
</section>`;
    }

    return `
<div class="divider"></div>
<section class="section">
  <p class="section-label">${headParts[0]}</p>
  <h2 class="section-title">${sectionTitle}</h2>
  ${innerHtml}
</section>`;
  }).join('\n');
}

function parseContent(src) {
  // Process fenced blocks :::type ... :::, blockquotes, and plain paragraphs
  let html = '';
  let remaining = src;

  while (remaining.length > 0) {
    // ─ fenced block :::type args\n...\n:::
    const fenceMatch = remaining.match(/^:::(\w+)([^\n]*)\n([\s\S]*?):::/m);
    if (fenceMatch && remaining.trimStart().startsWith(':::')) {
      // Flush any text before the fence
      const fenceStart = remaining.indexOf(':::');
      if (fenceStart > 0) {
        html += parseParagraphs(remaining.slice(0, fenceStart));
      }
      const type  = fenceMatch[1].toLowerCase();
      const args  = fenceMatch[2].trim();
      const inner = fenceMatch[3];

      switch (type) {
        case 'card':       html += parseCard(args, inner);      break;
        case 'notebook':   html += parseNotebook(inner);        break;
        case 'compare':    html += parseCompare(inner);         break;
        case 'result':     html += parseResult(args, inner);    break;
        case 'dimensions': html += parseDimensions(inner);      break;
        case 'tabs':       html += parseTabs(inner);            break;
        case 'zettel':     html += parseZettel(inner);          break;
        case 'prompt':     html += parsePrompt(inner);          break;
        case 'nodes':      html += parseNodes(inner);           break;
        default:           html += `<pre>${inner}</pre>`;
      }

      remaining = remaining.slice(fenceStart + fenceMatch[0].length);
      continue;
    }

    // ─ blockquote > ...
    const bqMatch = remaining.match(/^((?:>.*\n?)+)/m);
    if (bqMatch && remaining.trimStart().startsWith('>')) {
      const bqStart = remaining.indexOf('>');
      if (bqStart > 0) html += parseParagraphs(remaining.slice(0, bqStart));
      const bqText = bqMatch[1].replace(/^>\s?/gm, '').trim();
      html += `<p class="lead-quote">${inlineMd(bqText)}</p>`;
      remaining = remaining.slice(bqStart + bqMatch[0].length);
      continue;
    }

    // ─ horizontal rule ---
    const hrMatch = remaining.match(/^-{3,}\s*\n/m);
    if (hrMatch && remaining.trimStart().startsWith('---')) {
      const hrStart = remaining.indexOf('---');
      if (hrStart > 0) html += parseParagraphs(remaining.slice(0, hrStart));
      remaining = remaining.slice(hrStart + hrMatch[0].length);
      continue;
    }

    // ─ fallthrough: everything else is paragraph text
    html += parseParagraphs(remaining);
    break;
  }

  return html;
}

function parseParagraphs(text) {
  return text.split(/\n\n+/).map(p => {
    p = p.trim();
    if (!p || p.startsWith(':::') || p.startsWith('>') || p === '---') return '';
    return `<p class="section-prose">${inlineMd(p)}</p>`;
  }).join('');
}

// ─── CSS (full stylesheet) ───────────────────────────────────────────────────
const CSS = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --cream:  #F8F6F1;
    --card:   #FDFCF8;
    --ink:    #2C2C2C;
    --blue:   #2E4057;
    --terra:  #C9664A;
    --sage:   #6A8C69;
    --gold:   #C9A84C;
    --slate:  #8C9BAB;
    --rule:   rgba(44,44,44,0.12);
  }

  html { scroll-behavior: smooth; }
  body {
    background: var(--cream);
    color: var(--ink);
    font-family: 'Inter', sans-serif;
    font-size: 15px;
    line-height: 1.6;
    -webkit-font-smoothing: antialiased;
  }

  /* HERO */
  .hero {
    background: var(--blue);
    padding: 56px 24px 48px;
    text-align: center;
    position: relative;
    overflow: hidden;
  }
  .hero::before {
    content: '';
    position: absolute;
    inset: 0;
    background: repeating-linear-gradient(180deg, transparent, transparent 28px, rgba(255,255,255,0.04) 28px, rgba(255,255,255,0.04) 29px);
    pointer-events: none;
  }
  .hero-eyebrow {
    display: inline-block;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: var(--gold);
    margin-bottom: 14px;
  }
  .hero h1 {
    font-family: 'Playfair Display', serif;
    font-size: clamp(28px, 8vw, 42px);
    font-weight: 700;
    color: #fff;
    line-height: 1.2;
    max-width: 500px;
    margin: 0 auto 16px;
  }
  .hero h1 em { font-style: italic; color: var(--gold); }
  .hero-sub {
    color: rgba(255,255,255,0.6);
    font-size: 14px;
    font-weight: 300;
    max-width: 320px;
    margin: 0 auto;
  }
  .hero-cards {
    display: flex;
    justify-content: center;
    gap: 12px;
    margin-top: 36px;
    height: 80px;
  }
  .mini-card {
    width: 70px; height: 50px;
    background: var(--card);
    border-radius: 3px;
    box-shadow: 0 4px 14px rgba(0,0,0,0.35);
    position: relative;
    overflow: hidden;
    flex-shrink: 0;
  }
  .mini-card::after {
    content: '';
    position: absolute;
    inset: 0;
    background: repeating-linear-gradient(180deg, transparent, transparent 7px, rgba(44,44,44,0.12) 7px, rgba(44,44,44,0.12) 8px);
    top: 10px;
  }
  .mini-card:nth-child(1) { transform: rotate(-6deg) translateY(4px); }
  .mini-card:nth-child(2) { transform: rotate(0deg) translateY(-6px); z-index: 2; width: 80px; height: 56px; }
  .mini-card:nth-child(3) { transform: rotate(5deg) translateY(4px); }
  .mini-card .tab { height: 6px; width: 22px; position: absolute; top: 0; left: 10px; border-radius: 0 0 2px 2px; }

  /* SECTIONS */
  .section {
    padding: 48px 20px;
    max-width: 600px;
    margin: 0 auto;
  }
  .section-label {
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--slate);
    margin-bottom: 6px;
  }
  .section-title {
    font-family: 'Playfair Display', serif;
    font-size: clamp(22px, 6vw, 28px);
    font-weight: 700;
    color: var(--blue);
    line-height: 1.25;
    margin-bottom: 24px;
  }
  .section-prose {
    font-size: 13.5px;
    color: var(--slate);
    line-height: 1.65;
    margin-bottom: 16px;
  }

  .section-prose a {
    color: #b27564;
      text-decoration: none;
      }

      .section-prose a:hover {
        text-decoration: underline;
        }

.card-body a {
  color: #6B4423;
    text-decoration: none;
    }

    .card-body a:hover {
      text-decoration: underline;
      }

  .lead-quote {
    font-size: 14px;
    color: rgba(255,255,255,0.65);
    line-height: 1.7;
    margin-bottom: 32px;
  }

  /* INDEX CARD */
  .index-card {
    background: var(--card);
    border-radius: 4px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.05);
    padding: 20px 20px 22px;
    position: relative;
    overflow: hidden;
    margin-bottom: 16px;
    transition: transform 0.18s ease, box-shadow 0.18s ease;
  }
  .index-card:hover { transform: translateY(-2px); box-shadow: 0 6px 18px rgba(0,0,0,0.12); }
  .index-card::before {
    content: '';
    position: absolute;
    inset: 0;
    background: repeating-linear-gradient(180deg, transparent, transparent 23px, rgba(44,44,44,0.08) 23px, rgba(44,44,44,0.08) 24px);
    top: 44px;
    pointer-events: none;
  }
  .card-tab { position: absolute; top: 0; left: 0; right: 0; height: 5px; border-radius: 4px 4px 0 0; }
  .card-header {
    font-family: 'Playfair Display', serif;
    font-size: 15px;
    font-weight: 600;
    color: var(--blue);
    margin-bottom: 10px;
    padding-top: 6px;
    position: relative;
    z-index: 1;
  }
  .card-body { font-size: 13.5px; color: #444; line-height: 1.65; position: relative; z-index: 1; }

  /* DIMENSIONS */
  .dimensions-row { display: flex; gap: 16px; margin-bottom: 16px; }
  .dim-card {
    flex: 1;
    background: var(--card);
    border-radius: 4px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.05);
    padding: 16px;
    text-align: center;
    position: relative;
    overflow: hidden;
    transition: transform 0.18s ease, box-shadow 0.18s ease;
  }
  .dim-card:hover { transform: translateY(-2px); box-shadow: 0 6px 18px rgba(0,0,0,0.12); }
  .dim-card::before {
    content: '';
    position: absolute;
    inset: 0;
    background: repeating-linear-gradient(180deg, transparent, transparent 20px, rgba(44,44,44,0.07) 20px, rgba(44,44,44,0.07) 21px);
    top: 36px;
    pointer-events: none;
  }
  .dim-card-tab { position: absolute; top: 0; left: 0; right: 0; height: 4px; border-radius: 4px 4px 0 0; }
  //.dim-card-inner {
    //border: 1.5px solid rgba(44,44,44,0.15);
    //border-radius: 2px;
    //margin: 8px auto 10px;
    //position: relative;
    //z-index: 1;
    //background: rgba(255,255,255,0.6);
  //}
  .dim-label { font-size: 11px; font-weight: 600; color: var(--slate); letter-spacing: 0.05em; position: relative; z-index: 1; }
  .dim-size { font-family: 'Playfair Display', serif; font-size: 18px; font-weight: 700; color: var(--blue); position: relative; z-index: 1; }
  .dim-metric { font-size: 11px; color: var(--slate); position: relative; z-index: 1; }

  /* COLOUR TABS */
  .tab-row { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 16px; }
  .colour-tab {
    display: flex;
    align-items: center;
    gap: 8px;
    background: var(--card);
    border-radius: 4px;
    padding: 10px 14px;
    box-shadow: 0 1px 4px rgba(0,0,0,0.07), 0 0 0 1px rgba(0,0,0,0.05);
    flex: 1;
    min-width: 120px;
  }
  .dot { width: 28px; height: 28px; border-radius: 50%; flex-shrink: 0; }
  .colour-tab-text strong { display: block; font-size: 12px; font-weight: 600; color: var(--ink); }
  .colour-tab-text span { font-size: 11px; color: var(--slate); }

  /* DIVIDER */
  .divider { height: 1px; background: var(--rule); max-width: 560px; margin: 0 auto; }

  /* ZETTELKASTEN */
  .zettel-grid {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 8px;
    margin-bottom: 12px;
  }
  .zettel-node {
    background: var(--card);
    border-radius: 4px;
    padding: 9px 10px;
    font-size: 11.5px;
    font-weight: 500;
    color: var(--blue);
    text-align: center;
    box-shadow: 0 1px 4px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.06);
    border-left: 3px solid transparent;
    line-height: 1.35;
  }
  .zettel-node.center { border-left-color: var(--terra); background: #fff5f3; }
  .zettel-node.left  { border-left-color: var(--slate); }
  .zettel-node.right { border-left-color: var(--sage); }

  /* 8-NODE */
  .node-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin-bottom: 12px; }
  .node-folder {
    background: var(--card);
    border-radius: 4px;
    padding: 12px 8px 10px;
    text-align: center;
    box-shadow: 0 1px 4px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.06);
    position: relative;
  }
  .node-folder span { font-size: 13px; font-weight: 600; color: var(--blue); }

  /* AI PROMPT */
  .prompt-card {
    background: var(--blue);
    border-radius: 6px;
    padding: 20px;
    color: #fff;
    margin-bottom: 16px;
  }
  .prompt-label { font-size: 10px; letter-spacing: 0.15em; text-transform: uppercase; color: var(--gold); font-weight: 600; margin-bottom: 10px; }
  .prompt-row { display: flex; gap: 8px; margin-bottom: 12px; }
  .prompt-tag { padding: 4px 12px; border-radius: 3px; font-size: 12px; font-weight: 600; }
  .prompt-tag.class  { background: rgba(255,255,255,0.15); color: #fff; }
  .prompt-tag.object { background: var(--terra); color: #fff; }
  .prompt-text { font-size: 13px; color: rgba(255,255,255,0.8); font-style: italic; line-height: 1.5; border-left: 2px solid var(--gold); padding-left: 12px; }

  /* NOTEBOOK EVOLUTION */
  .dark-section .section-prose { color: rgba(255,255,255,0.65); }
  .notebook-visual {
    background: rgba(255,255,255,0.07);
    border-radius: 8px;
    padding: 24px 20px 16px;
    margin-bottom: 24px;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  .notebook-spine {
    width: 220px; height: 10px;
    background: rgba(255,255,255,0.18);
    border-radius: 3px 3px 0 0;
  }
  .notebook-pages {  width: 220px; }
  .nb-page {
    flex: 1;
    background: var(--card);
    min-height: 110px;
    border-right: 1px solid rgba(0,0,0,0.06);
    position: relative;
    overflow: hidden;
    animation: pageRise 0.4s ease both;
    animation-delay: var(--delay);
  }
  .nb-page:first-child { border-radius: 0 0 0 3px; }
  .nb-page:last-child  { border-radius: 0 0 3px 0; border-right: none; }
  @keyframes pageRise { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
  .nb-tab { height: 5px; width: 60%; margin: 0 auto; border-radius: 0 0 2px 2px; }
  .nb-lines::after {
    content: '';
    display: block;
    width: 100%;
    height: 60px;
    margin: 8px 6px 0;
    background: repeating-linear-gradient(180deg, transparent, transparent 9px, rgba(44,44,44,0.1) 9px, rgba(44,44,44,0.1) 10px);
  }
  .nb-page-num { position: absolute; bottom: 5px; right: 5px; font-size: 9px; font-weight: 600; color: var(--slate); letter-spacing: 0.05em; }
  .nb-caption { font-size: 11px; color: rgba(255,255,255,0.4); text-align: center; margin-top: 10px; letter-spacing: 0.04em; }

  .compare-row { display: flex; align-items: stretch; margin-bottom: 24px; }
  .compare-col { flex: 1; background: rgba(255,255,255,0.07); padding: 16px 14px; }
  .compare-col.loose { border-radius: 6px 0 0 6px; }
  .compare-col.bound { border-radius: 0 6px 6px 0; background: rgba(255,255,255,0.11); }
  .compare-label { font-size: 11px; font-weight: 600; color: var(--gold); margin-bottom: 10px; letter-spacing: 0.06em; text-transform: uppercase; }
  .compare-list { list-style: none; font-size: 12px; color: rgba(255,255,255,0.7); line-height: 2; }
  .compare-divider { display: flex; align-items: center; justify-content: center; width: 32px; flex-shrink: 0; font-size: 20px; font-weight: 300; color: var(--gold); background: rgba(201,168,76,0.1); }

  .evolution-result { background: rgba(255,255,255,0.1); border-left: 3px solid var(--gold); border-radius: 0 6px 6px 0; padding: 16px 18px; }
  .evolution-badge { font-size: 10px; font-weight: 600; letter-spacing: 0.15em; text-transform: uppercase; color: var(--gold); margin-bottom: 8px; }
  .evolution-result p { font-size: 13.5px; color: rgba(255,255,255,0.8); line-height: 1.65; }
  .evolution-result strong { color: #fff; }

  /* FOOTER */
  footer {
    background: var(--blue);
    color: rgba(255,255,255,0.45);
    text-align: center;
    padding: 28px 20px;
    font-size: 12px;
    letter-spacing: 0.05em;
  }
  footer strong { color: rgba(255,255,255,0.8); }
`;

// ─── HTML template ───────────────────────────────────────────────────────────
function buildHTML(meta, bodyHtml) {
  const heroTabs = (meta.hero_tabs || 'terra,gold,sage').split(',').map(t => t.trim());
  const tabHtml  = heroTabs.map((t, i) => {
    const rot = ['-6deg', '0deg', '5deg'][i] || '0deg';
    const y   = ['4px', '-6px', '4px'][i]    || '0px';
    const sz  = i === 1 ? 'width:80px;height:56px;z-index:2;' : '';
    return `<div class="mini-card" style="transform:rotate(${rot}) translateY(${y});${sz}"><div class="tab" style="background:var(--${t})"></div></div>`;
  }).join('\n    ');

  // Strip first divider since there's no preceding section
  const cleanBody = bodyHtml.replace(/^\s*<div class="divider"><\/div>\s*/, '');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${meta.title || 'Index Card Guide'}</title>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,700;1,400&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet">
<style>${CSS}</style>
</head>
<body>

<header class="hero">
  <span class="hero-eyebrow">${meta.eyebrow || ''}</span>
  <h1>${(meta.title || '').replace(/:\s*/, ':<br><em>').replace(/(<\/em>)/, '</em>')}</h1>
  <p class="hero-sub">${meta.subtitle || ''}</p>
  <div class="hero-cards">
    ${tabHtml}
  </div>
</header>

${cleanBody}

<footer>
  <strong>${meta.title || ''}</strong><br>
  A knowledge framework for the analog-digital age
</footer>

</body>
</html>`;
}

// ─── Run ─────────────────────────────────────────────────────────────────────
const { meta, body } = parseFrontmatter(raw);
const bodyHtml       = parseBody(body);
const html           = buildHTML(meta, bodyHtml);

fs.writeFileSync(outputFile, html, 'utf8');
console.log(`✓ Compiled: ${inputFile} → ${outputFile}`);
