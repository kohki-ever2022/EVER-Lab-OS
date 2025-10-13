// src/components/common/MarkdownRenderer.tsx

import React, { useMemo } from 'react';

interface Props {
  markdown: string;
}

// このシンプルなレンダラーはMarkdownのサブセットを処理します。
// セキュリティを最優先し、HTMLタグ内にコンテンツを配置する前にエスケープ処理を行います。
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

    let html = markdown;

    // パラグラフを最初に分割
    const paragraphs = html.split(/\n{2,}/);

    const processedParagraphs = paragraphs.map(p => {
        let block = p.trim();
        if (!block) return '';

        // --- ブロック要素 ---

        // 見出し
        if (block.startsWith('# ')) return `<h1 class="text-2xl font-bold mt-8 mb-4 border-b pb-2">${escapeHtml(block.substring(2))}</h1>`;
        if (block.startsWith('## ')) return `<h2 class="text-xl font-bold mt-6 mb-3 border-b pb-1">${escapeHtml(block.substring(3))}</h2>`;
        if (block.startsWith('### ')) return `<h3 class="text-lg font-semibold mt-4 mb-2">${escapeHtml(block.substring(4))}</h3>`;

        // 水平線
        if (block === '---') return '<hr class="my-6"/>';

        // リスト
        if (block.startsWith('* ')) {
             const items = block.split('\n').map(line => {
                const trimmedLine = line.trim();
                let content = '';
                let className = '';

                if (trimmedLine.startsWith('  * ')) { // ネストされたリスト
                    content = trimmedLine.substring(3);
                    className = 'ml-10';
                } else if (trimmedLine.startsWith('* ')) { // 通常のリスト
                    content = trimmedLine.substring(2);
                    className = 'ml-5';
                } else {
                    return null;
                }
                
                // インライン書式を適用
                let processedContent = escapeHtml(content);
                processedContent = processedContent.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                processedContent = processedContent.replace(/\*(.*?)\*/g, '<em>$1</em>');
                
                return `<li class="${className}">${processedContent}</li>`;
            }).filter(Boolean).join('');
            return `<ul>${items}</ul>`;
        }

        // --- インライン要素（通常のパラグラフ向け） ---
        let inlineProcessed = block;
        
        // 残っているHTMLをまずエスケープ
        inlineProcessed = escapeHtml(inlineProcessed);
        
        // その後、インラインのMarkdownを適用
        inlineProcessed = inlineProcessed.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        inlineProcessed = inlineProcessed.replace(/\*(.*?)\*/g, '<em>$1</em>');
        
        // 1つの改行を<br>に変換
        inlineProcessed = inlineProcessed.replace(/\n/g, '<br />');

        return `<p>${inlineProcessed}</p>`;
    });

    return processedParagraphs.join('');

  }, [markdown]);

  return (
    <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: renderedHtml }} />
  );
};

export default MarkdownRenderer;