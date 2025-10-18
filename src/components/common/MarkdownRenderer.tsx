// src/components/common/MarkdownRenderer.tsx
import React, { useMemo, Fragment } from 'react';
import { escapeHtml } from '../../utils/sanitization';

interface Props {
  markdown: string;
}

// This function will parse inline styles like **bold** and *italic*.
// It returns an array of strings and React elements.
const renderInlines = (text: string) => {
  if (!text) return [''];
  // Split text by markdown tokens for bold and italic, keeping the delimiters
  const parts = text.split(/(\*\*.*?\*\*|\*.*?\*)/g);

  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={index}>{escapeHtml(part.slice(2, -2))}</strong>;
    }
    if (part.startsWith('*') && part.endsWith('*')) {
      return <em key={index}>{escapeHtml(part.slice(1, -1))}</em>;
    }
    return escapeHtml(part); // Sanitize plain text parts
  });
};

const MarkdownRenderer: React.FC<Props> = ({ markdown }) => {
  const renderedContent = useMemo(() => {
    if (!markdown) return null;

    // Process blocks (paragraphs, headings, lists) separated by double newlines
    const blocks = markdown.split(/\n{2,}/);

    return blocks.map((block, blockIndex) => {
      const trimmedBlock = block.trim();
      if (!trimmedBlock) return null;

      // Headings
      if (trimmedBlock.startsWith('# ')) {
        return (
          <h1
            key={blockIndex}
            className='text-2xl font-bold mt-8 mb-4 border-b pb-2'
          >
            {trimmedBlock.substring(2)}
          </h1>
        );
      }
      if (trimmedBlock.startsWith('## ')) {
        return (
          <h2
            key={blockIndex}
            className='text-xl font-bold mt-6 mb-3 border-b pb-1'
          >
            {trimmedBlock.substring(3)}
          </h2>
        );
      }
      if (trimmedBlock.startsWith('### ')) {
        return (
          <h3 key={blockIndex} className='text-lg font-semibold mt-4 mb-2'>
            {trimmedBlock.substring(4)}
          </h3>
        );
      }

      // Horizontal Rule
      if (trimmedBlock === '---') {
        return <hr key={blockIndex} className='my-6' />;
      }

      // Unordered List
      if (trimmedBlock.startsWith('* ')) {
        const items = trimmedBlock
          .split('\n')
          .map((line, itemIndex) => {
            const trimmedLine = line.trim();
            let content = '';
            let className = '';

            if (trimmedLine.startsWith('  * ')) {
              // Simple sub-list support
              content = trimmedLine.substring(3);
              className = 'ml-10';
            } else if (trimmedLine.startsWith('* ')) {
              content = trimmedLine.substring(2);
              className = 'ml-5';
            } else {
              return null;
            }

            return (
              <li key={itemIndex} className={className}>
                {renderInlines(content)}
              </li>
            );
          })
          .filter(Boolean); // Filter out any nulls

        return <ul key={blockIndex}>{items}</ul>;
      }

      // Default to paragraph
      const lines = trimmedBlock.split('\n');
      return (
        <p key={blockIndex}>
          {lines.map((line, lineIndex) => (
            <Fragment key={lineIndex}>
              {renderInlines(line)}
              {lineIndex < lines.length - 1 && <br />}
            </Fragment>
          ))}
        </p>
      );
    });
  }, [markdown]);

  return <div className='prose max-w-none'>{renderedContent}</div>;
};

export default MarkdownRenderer;
