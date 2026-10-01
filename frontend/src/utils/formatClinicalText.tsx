import React from 'react';

/**
 * Parses and renders clinical responses:
 * - Strips any raw hashtag markdown headers (#, ##, ###)
 * - Converts legitimate bold markers to clean <strong> tags without exposing raw asterisks
 * - Formats paragraphs and bullet points with dignified, readable spacing
 */
export function renderFormattedClinicalText(text: string): React.ReactNode {
  if (!text) return null;

  // 1. Strip any markdown headers (#, ##, ###, ####)
  let cleaned = text
    .replace(/^#{1,6}\s*/gm, '')
    .replace(/---+/g, '')
    .trim();

  // 2. Split into distinct paragraphs
  const paragraphs = cleaned.split(/\n\s*\n/);

  return (
    <div className="space-y-3">
      {paragraphs.map((para, pIdx) => {
        const trimmed = para.trim();
        if (!trimmed) return null;

        // Check if paragraph contains bullet points
        const lines = trimmed.split('\n');
        const isBulletList = lines.some(line => /^[-*•]\s+/.test(line.trim()));

        if (isBulletList) {
          return (
            <ul key={pIdx} className="space-y-1.5 my-2">
              {lines.map((line, lIdx) => {
                const trimmedLine = line.trim();
                if (!trimmedLine) return null;
                const isBullet = /^[-*•]\s+/.test(trimmedLine);
                const content = trimmedLine.replace(/^[-*•]\s+/, '');
                
                return (
                  <li key={lIdx} className="flex items-start gap-2 text-stone-800 leading-relaxed">
                    {isBullet && <span className="text-moment-500 font-bold shrink-0 leading-relaxed">•</span>}
                    <span className="flex-1">{parseInlineText(content)}</span>
                  </li>
                );
              })}
            </ul>
          );
        }

        return (
          <p key={pIdx} className="leading-relaxed text-stone-800">
            {parseInlineText(trimmed)}
          </p>
        );
      })}
    </div>
  );
}

/**
 * Replaces **keyword** with clean, subtle styled bold tags without showing asterisks
 */
function parseInlineText(str: string): React.ReactNode {
  // Split on **...**
  const parts = str.split(/(\*\*[^*]+?\*\*)/g);
  return parts.map((part, idx) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      const boldText = part.slice(2, -2).trim();
      return (
        <strong key={idx} className="font-semibold text-stone-900">
          {boldText}
        </strong>
      );
    }
    return part;
  });
}
