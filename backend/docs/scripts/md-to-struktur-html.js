const fs = require('fs');
const path = require('path');

const mdPath = path.join(__dirname, '..', 'STRUKTUR-PROJECT.md');
const outPath = path.join(__dirname, '..', 'STRUKTUR-PROJECT.html');
const styleSrc = path.join(__dirname, '..', 'backend', 'docs', 'materi-alur-backend.html');

const md = fs.readFileSync(mdPath, 'utf8');

function esc(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function inline(s) {
  return esc(s)
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/`([^`]+)`/g, '<code>$1</code>');
}

function parseTable(startIdx, lines) {
  const rows = [];
  let i = startIdx;
  while (i < lines.length && lines[i].startsWith('|')) {
    if (!/^\|[\s\-:|]+\|$/.test(lines[i].trim())) rows.push(lines[i]);
    i++;
  }
  let html = '<table><thead><tr>';
  rows[0].split('|').filter(Boolean).forEach((c) => {
    html += '<th>' + inline(c.trim()) + '</th>';
  });
  html += '</tr></thead><tbody>';
  for (let r = 1; r < rows.length; r++) {
    html += '<tr>';
    rows[r].split('|').filter(Boolean).forEach((c) => {
      html += '<td>' + inline(c.trim()) + '</td>';
    });
    html += '</tr>';
  }
  html += '</tbody></table>\n';
  return { html, next: i };
}

const lines = md.replace(/\r\n/g, '\n').split('\n');
let body = '';
let i = 0;
let inCode = false;
let codeBuf = [];
let sectionCount = 0;
let inSection = false;

function flushCode() {
  if (!codeBuf.length) return;
  body += '<pre class="flow">' + esc(codeBuf.join('\n')) + '</pre>\n';
  codeBuf = [];
}

// H1 + lead block until first ---
body += '<header><h1>' + inline(lines[0].slice(2)) + '</h1>\n';
body += '<p class="lead">' + inline(lines[2]) + '</p>\n';
body += '<p>' + inline(lines[4]) + '</p>\n';
const t0 = parseTable(6, lines);
body += t0.html;
i = t0.next + 1; // skip ---

const toc = `<nav class="toc" aria-label="Daftar isi">
<strong>Daftar isi</strong>
<ol>
<li><a href="#s0">Legenda</a></li>
<li><a href="#s1">Tree folder &amp; file</a></li>
<li><a href="#s2">Ringkasan: bawaan vs buat sendiri</a></li>
<li><a href="#s3">Alur komunikasi antar folder &amp; file</a></li>
<li><a href="#s4">Urutan belajar file (siswa)</a></li>
<li><a href="#s5">Catatan project</a></li>
</ol>
</nav>`;

body += '</header>\n' + toc + '\n';

while (i < lines.length) {
  const line = lines[i];

  if (line.startsWith('```')) {
    if (inCode) {
      inCode = false;
      flushCode();
    } else inCode = true;
    i++;
    continue;
  }
  if (inCode) {
    codeBuf.push(line);
    i++;
    continue;
  }

  if (line === '---') {
    body += '<hr class="sep" />\n';
    i++;
    continue;
  }

  if (line.startsWith('## ')) {
    if (inSection) body += '</section>\n';
    body += '<section id="s' + sectionCount++ + '"><h2>' + inline(line.slice(3)) + '</h2>\n';
    inSection = true;
    i++;
    continue;
  }

  if (line.startsWith('### ')) {
    body += '<h3>' + inline(line.slice(4)) + '</h3>\n';
    i++;
    continue;
  }

  if (line.startsWith('|')) {
    const t = parseTable(i, lines);
    body += t.html;
    i = t.next;
    continue;
  }

  if (/^\d+\. /.test(line)) {
    body += '<ol class="steps">';
    while (i < lines.length && /^\d+\. /.test(lines[i])) {
      body += '<li>' + inline(lines[i].replace(/^\d+\. /, '')) + '</li>';
      i++;
    }
    body += '</ol>\n';
    continue;
  }

  if (line.startsWith('- ')) {
    body += '<ul class="plain">';
    while (i < lines.length && lines[i].startsWith('- ')) {
      body += '<li>' + inline(lines[i].slice(2)) + '</li>';
      i++;
    }
    body += '</ul>\n';
    continue;
  }

  if (line.startsWith('*') && line.endsWith('*') && !line.startsWith('**')) {
    body += '<p class="footer-note"><em>' + inline(line.slice(1, -1)) + '</em></p>\n';
    i++;
    continue;
  }

  if (line.trim() === '') {
    i++;
    continue;
  }

  body += '<p>' + inline(line) + '</p>\n';
  i++;
}

if (inCode) flushCode();
if (inSection) body += '</section>\n';

const styleMatch = fs.readFileSync(styleSrc, 'utf8').match(/<style>[\s\S]*?<\/style>/);
const baseStyle = styleMatch ? styleMatch[0] : '';

const extraStyle = `<style>
nav.toc a { color: var(--accent); text-decoration: none; }
nav.toc a:hover { text-decoration: underline; }
hr.sep { border: none; border-top: 1px solid var(--border); margin: 1.25rem 0; }
p.footer-note { text-align: center; color: var(--muted); font-size: 0.9rem; margin-top: 2rem; }
section:target { outline: 2px solid var(--accent); outline-offset: 4px; }
</style>`;

const html = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Struktur Project — Toko Mango (Fullstack SMK)</title>
  ${baseStyle}
  ${extraStyle}
</head>
<body>
  <div class="wrap">
${body}
  </div>
</body>
</html>`;

fs.writeFileSync(outPath, html);
console.log('OK:', outPath);
