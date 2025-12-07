


import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.argv[2] || '.';
const EXT_REGEX = /\.(js|jsx|ts|tsx|css|scss|html)$/i;


function stripCommentsFromContent(content, ext) {
  content = content.replace(/\/\*[\s\S]*?\*\//g, (match) => {
    const lower = match.toLowerCase();
    if (lower.includes('todo') || lower.includes('fixme')) return '';
    if (lower.includes('@license') || lower.includes('@preserve') || lower.includes('important')) return match;
    return '';
  });

  content = content.replace(/(^|\s)\/\/[^\n]*/g, (match) => {
    const lower = match.toLowerCase();
    if (lower.includes('todo') || lower.includes('fixme')) return '';
    if (lower.includes('@license') || lower.includes('@preserve') || lower.includes('important')) return match;
    return '';
  });

  if (ext === '.html') {
    content = content.replace(/<!--[\s\S]*?-->/g, (match) => {
      const lower = match.toLowerCase();
      if (lower.includes('todo') || lower.includes('fixme')) return '';
      if (lower.includes('important') || lower.includes('@license') || lower.includes('@preserve')) return match;
      return '';
    });
  }

  content = content.replace(/\n{3,}/g, '\n\n');
  return content.trimEnd() + '\n';
}


function stripCommentsFromFile(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const src = fs.readFileSync(filePath, 'utf8');
  const cleaned = stripCommentsFromContent(src, ext);
  if (cleaned !== src) {
    fs.writeFileSync(filePath, cleaned);
    console.log('Temizlendi:', filePath);
  }
}


function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(fullPath);
    } else if (entry.isFile() && EXT_REGEX.test(entry.name)) {
      stripCommentsFromFile(fullPath);
    }
  }
}

walk(ROOT);
