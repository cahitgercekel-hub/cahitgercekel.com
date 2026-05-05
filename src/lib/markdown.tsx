import React from "react";

/**
 * A very lightweight "markdown" parser that handles:
 * **bold** -> <strong>bold</strong>
 * *italic* -> <em>italic</em>
 * [link](url) -> <a href="url" target="_blank" rel="noreferrer">link</a>
 * 
 * It returns an array of React elements/strings.
 */
export function formatRichText(text: string): React.ReactNode {
  if (!text) return text;

  // First split by lines to handle \n
  const lines = text.split("\n");

  return lines.map((line, lineIdx) => {
    // Split by bold (**), italic (*), or links ([...](...))
    const parts = line.split(/(\*\*.*?\*\*|\*.*?\*|\[.*?\]\(.*?\))/g);

    const content = parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={i}>{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith("*") && part.endsWith("*")) {
        return <em key={i}>{part.slice(1, -1)}</em>;
      }
      if (part.startsWith("[") && part.includes("](")) {
        const match = part.match(/\[(.*?)\]\((.*?)\)/);
        if (match) {
          const [_, label, url] = match;
          return (
            <a key={i} href={url} target="_blank" rel="noreferrer" className="underline underline-offset-2 hover:opacity-80 transition-opacity">
              {label}
            </a>
          );
        }
      }
      return part;
    });

    return (
      <React.Fragment key={lineIdx}>
        {content}
        {lineIdx < lines.length - 1 && <br />}
      </React.Fragment>
    );
  });
}
