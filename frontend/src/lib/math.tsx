import React from 'react';
import katex from 'katex';

const KATEX_MACROS: Record<string, string> = {
  '\\ctg': '\\operatorname{ctg}',
  '\\tg': '\\operatorname{tg}',
  '\\sh': '\\operatorname{sh}',
  '\\ch': '\\operatorname{ch}',
  '\\th': '\\operatorname{th}',
  '\\cth': '\\operatorname{cth}',
};
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
export function renderTex(tex: string, display?: boolean): string {
  try {
    return katex.renderToString(tex, {
      displayMode: !!display,
      throwOnError: false,
      macros: KATEX_MACROS,
      strict: false,
    });
  } catch {
    return `<span style="color:#c0392b">${escapeHtml(String(tex))}</span>`;
  }
}

interface TexProps {
  tex: string;
  display?: boolean;
  style?: React.CSSProperties;
}
export function Tex({ tex, display, style }: TexProps) {
  return <span style={style} dangerouslySetInnerHTML={{ __html: renderTex(tex, display) }} />;
}

interface RichTextProps {
  text: string;
  className?: string;
  style?: React.CSSProperties;
  tag?: string;
}
/** Renders a string, turning every `$...$` span into inline KaTeX. */
export function RichText({ text, className, style, tag }: RichTextProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const Tag = (tag || 'span') as any;
  const parts: React.ReactNode[] = [];
  const re = /\$([^$]+)\$/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let key = 0;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) parts.push(<span key={key++}>{text.slice(last, m.index)}</span>);
    parts.push(<span key={key++} dangerouslySetInnerHTML={{ __html: renderTex(m[1], false) }} />);
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push(<span key={key++}>{text.slice(last)}</span>);
  return <Tag className={className} style={style}>{parts}</Tag>;
}
