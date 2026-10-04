// Tiny SML syntax highlighter: source text -> HTML with token spans.
// Display-only (grading always reads the raw text), so a mis-lexed edge case
// costs nothing but color. Token classes: sml-kw, sml-con, sml-str, sml-com,
// sml-num, sml-tyvar.

const KEYWORDS = new Set([
  'abstype', 'and', 'andalso', 'as', 'case', 'datatype', 'do', 'else', 'end',
  'exception', 'fn', 'fun', 'handle', 'if', 'in', 'infix', 'infixr', 'let',
  'local', 'nonfix', 'of', 'op', 'open', 'orelse', 'raise', 'rec', 'then',
  'type', 'val', 'while', 'withtype',
  'eqtype', 'functor', 'include', 'sharing', 'sig', 'signature', 'struct',
  'structure', 'where',
]);

const escapeHtml = (s) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const span = (cls, text) => `<span class="${cls}">${escapeHtml(text)}</span>`;

// Each rule: match at position i, return [html, chars consumed] or null.

function comment(src, i) {
  if (!src.startsWith('(*', i)) return null;
  let depth = 1, j = i + 2;
  while (j < src.length && depth > 0) {
    if (src.startsWith('(*', j)) { depth++; j += 2; }
    else if (src.startsWith('*)', j)) { depth--; j += 2; }
    else j++;
  }
  return [span('sml-com', src.slice(i, j)), j - i];
}

function stringLit(src, i) {
  const start = src.startsWith('#"', i) ? i + 2 : src[i] === '"' ? i + 1 : -1;
  if (start < 0) return null;
  let j = start;
  while (j < src.length && src[j] !== '"' && src[j] !== '\n') {
    j += src[j] === '\\' ? 2 : 1;
  }
  if (src[j] === '"') j++;
  return [span('sml-str', src.slice(i, j)), j - i];
}

function number(src, i) {
  const m = /^(~?0wx[0-9a-fA-F]+|~?0x[0-9a-fA-F]+|~?0w[0-9]+|~?[0-9]+(\.[0-9]+)?([eE]~?[0-9]+)?)/
    .exec(src.slice(i));
  if (!m || (src[i] === '~' && !/[0-9]/.test(src[i + 1] ?? ''))) return null;
  return [span('sml-num', m[0]), m[0].length];
}

function tyvar(src, i) {
  const m = /^''?[A-Za-z][A-Za-z0-9_']*/.exec(src.slice(i));
  return m ? [span('sml-tyvar', m[0]), m[0].length] : null;
}

function ident(src, i) {
  const m = /^[A-Za-z][A-Za-z0-9_']*/.exec(src.slice(i));
  if (!m) return null;
  const word = m[0];
  if (KEYWORDS.has(word)) return [span('sml-kw', word), word.length];
  if (/[A-Z]/.test(word[0])) return [span('sml-con', word), word.length];
  return [escapeHtml(word), word.length];
}

const RULES = [comment, stringLit, number, tyvar, ident];

export function highlightSML(src) {
  let out = '', i = 0, plain = '';
  const flush = () => { out += escapeHtml(plain); plain = ''; };
  while (i < src.length) {
    let matched = null;
    for (const rule of RULES) {
      matched = rule(src, i);
      if (matched) break;
    }
    if (matched) { flush(); out += matched[0]; i += matched[1]; }
    else { plain += src[i]; i++; }
  }
  flush();
  return out;
}
