import React, { useState, useEffect } from 'react';
import { SDS, SDSSummary } from '../../types';
import { useSessionContext } from '../../contexts/SessionContext';
import { useToast } from '../../contexts/ToastContext';
import { geminiService } from '../../services/geminiService';
import { useComplianceActions } from '../../hooks/useComplianceActions';

interface Props {
  sds: SDS;
  onClose: () => void;
}

const SdsDetailsModal: React.FC<Props> = ({ sds, onClose }) => {
  const { isJapanese, language } = useSessionContext();
  const { showToast } = useToast();
  const { updateSds } = useComplianceActions();
  const [summary, setSummary] = useState<SDSSummary | null>(sds.emergencySummary || null);
  const [isSummarizing, setIsSummarizing] = useState(false);

  const handleGenerateSummary = async () => {
    setIsSummarizing(true);
    try {
      // In a real app, you would fetch the full text from sds.pdfUrl or another source.
      // For this demo, we use a placeholder text to simulate the process.
      const placeholderSdsText = `
        化学物質等安全データシート (SDS)
        製品名: ${sds.chemicalName}
        CAS番号: ${sds.cas}
        危険有害性の要約: 皮膚刺激、強い眼刺激。
        応急措置: 眼に入った場合、水で数分間注意深く洗うこと。
        保管: 換気の良い場所で保管すること。
      `;
      const summaryJson = await geminiService.summarizeSDSDocument(placeholderSdsText, language);
      const parsedSummary = JSON.parse(summaryJson);
      
      if (parsedSummary.error) {
        throw new Error(parsedSummary.error);
      }

      setSummary(parsedSummary);
      showToast(isJapanese ? 'AIによる要約が完了しました。' : 'AI summary generated.', 'success');
      
      // Save the summary to the SDS object for caching
      await updateSds({ ...sds, emergencySummary: parsedSummary });

    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      showToast(isJapanese ? `要約の生成に失敗しました: ${message}` : `Failed to generate summary: ${message}`, 'error');
    } finally {
      setIsSummarizing(false);
    }
  };

  const SummarySection: React.FC<{ title: string; content: string | string[] }> = ({ title, content }) => (
    <div>
      <h4 className="font-semibold text-gray-700">{title}</h4>
      {Array.isArray(content) ? (
        <ul className="list-disc list-inside text-sm text-gray-600 mt-1">
          {content.map((item, index) => <li key={index}>{item}</li>)}
        </ul>
      ) : (
        <p className="text-sm text-gray-600 mt-1">{content}</p>
      )}
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 modal-backdrop">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl modal-content max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-2xl font-bold text-gray-800">{sds.chemicalName}</h3>
            <p className="text-sm text-gray-500">CAS: {sds.cas} | Ver: {sds.version}</p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">&times;</button>
        </div>
        
        <div className="overflow-y-auto pr-2 flex-grow">
          <div className="bg-blue-50 p-4 rounded-lg mb-4">
            <h4 className="font-bold text-lg text-blue-800">{isJapanese ? 'AIによる緊急時サマリー' : 'AI Emergency Summary'}</h4>
            {summary ? (
              <div className="mt-2 space-y-3">
                <SummarySection title={isJapanese ? '危険有害性' : 'Hazards'} content={summary.hazards} />
                <SummarySection title={isJapanese ? '安全な取り扱い' : 'Handling'} content={summary.handling} />
                <SummarySection title={isJapanese ? '安全な保管' : 'Storage'} content={summary.storage} />
                <SummarySection title={isJapanese ? '応急措置' : 'First Aid'} content={summary.firstAid} />
                <SummarySection title={isJapanese ? '漏洩時の措置' : 'Spill Response'} content={summary.spillResponse} />
                <SummarySection title={isJapanese ? '廃棄' : 'Disposal'} content={summary.disposal} />
                <SummarySection title={isJapanese ? '個人用保護具(PPE)' : 'PPE'} content={summary.ppe} />
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-sm text-gray-600 mb-3">{isJapanese ? 'AIで緊急時に必要な情報を要約します。' : 'Use AI to summarize key information for emergencies.'}</p>
                <button onClick={handleGenerateSummary} disabled={isSummarizing} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg text-sm disabled:bg-gray-400">
                  {isSummarizing ? (isJapanese ? '要約中...' : 'Summarizing...') : (isJapanese ? 'サマリーを生成' : 'Generate Summary')}
                </button>
              </div>
            )}
          </div>

          <div className="mt-4">
            <a href={sds.pdfUrl} target="_blank" rel="noopener noreferrer" className="inline-block bg-gray-200 text-gray-800 font-semibold py-2 px-4 rounded-lg hover:bg-gray-300">
              {isJapanese ? '完全なSDS(PDF)を開く' : 'Open Full SDS (PDF)'}
            </a>
          </div>
        </div>
        
        <div className="flex justify-end mt-6 pt-4 border-t">
          <button onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300">
            {isJapanese ? '閉じる' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SdsDetailsModal;
