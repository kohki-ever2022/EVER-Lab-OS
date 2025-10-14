// src/components/common/MarkdownRenderer.tsx

import React, { useMemo } from 'react';

interface Props {
  markdown: string;
}

const MarkdownRenderer: React.FC<Props> = ({ markdown }) => {
  const renderedHtml = useMemo(() => {
    if (!markdown) return '';
    
    const escapeHtml = (unsafe: string) => 
        unsafe
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;");

    // A secure function to process only **bold** and *italic* markdown.
    const processInlines = (text: string) => {
        // Split text by markdown tokens, escape the plain text parts,
        // and reconstruct. This is safer against injection.
        const parts = text.split(/(\*\*.*?\*\*|\*.*?\*)/g);
        
        return parts.map(part => {
            if (part.startsWith('**') && part.endsWith('**')) {
                return `<strong>${escapeHtml(part.slice(2, -2))}</strong>`;
            }
            if (part.startsWith('*') && part.endsWith('*')) {
                return `<em>${escapeHtml(part.slice(1, -1))}</em>`;
            }
            // Escape everything else.
            return escapeHtml(part);
        }).join('');
    };

    // Process blocks (paragraphs)
    const paragraphs = markdown.split(/\n{2,}/);

    const processedBlocks = paragraphs.map(p => {
        let block = p.trim();
        if (!block) return '';

        // Block elements (headings do not support inlines for security)
        if (block.startsWith('# ')) return `<h1 class="text-2xl font-bold mt-8 mb-4 border-b pb-2">${escapeHtml(block.substring(2))}</h1>`;
        if (block.startsWith('## ')) return `<h2 class="text-xl font-bold mt-6 mb-3 border-b pb-1">${escapeHtml(block.substring(3))}</h2>`;
        if (block.startsWith('### ')) return `<h3 class="text-lg font-semibold mt-4 mb-2">${escapeHtml(block.substring(4))}</h3>`;
        if (block === '---') return '<hr class="my-6"/>';

        // List processing
        if (block.startsWith('* ')) {
             const items = block.split('\n').map(line => {
                const trimmedLine = line.trim();
                let content = '';
                let className = '';

                if (trimmedLine.startsWith('  * ')) {
                    content = trimmedLine.substring(3);
                    className = 'ml-10';
                } else if (trimmedLine.startsWith('* ')) {
                    content = trimmedLine.substring(2);
                    className = 'ml-5';
                } else {
                    return null; // Not a list item
                }
                
                // Process inlines securely for list item content
                return `<li class="${className}">${processInlines(content)}</li>`;
            }).filter(Boolean).join('');
            return `<ul>${items}</ul>`;
        }
        
        // Default to paragraph. Process inlines and convert single newlines to <br>.
        const processedLines = block.split('\n').map(processInlines);
        return `<p>${processedLines.join('<br />')}</p>`;
    });

    return processedBlocks.join('');

  }, [markdown]);

  return (
    <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: renderedHtml }} />
  );
};

export default MarkdownRenderer;