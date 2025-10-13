// src/components/reports/MonthlyReportGenerator.tsx
import React, { useState } from 'react';
import { aggregateMonthlyData } from '@/services/reportAggregator';
import { generateMonthlyReport } from '@/services/geminiReportService';
import MarkdownRenderer from '@/components/common/MarkdownRenderer';
import { MonthlyReport } from '@/types/reports';
import { useSessionContext } from '@/contexts/SessionContext';
import { useReservationContext } from '@/contexts/ReservationContext';
import { useEquipmentContext } from '@/contexts/EquipmentContext';
import { useConsumableContext } from '@/contexts/ConsumableContext';
import { useUserContext } from '@/contexts/UserContext';
import { useToast } from '@/contexts/ToastContext';
import { useAdminActions } from '@/hooks/useAdminActions';
import { useAdminContext } from '@/contexts/AppProviders';
import { useQmsContext } from '@/contexts/AppProviders';
import { useBillingContext } from '@/contexts/AppProviders';
import { useCertificates } from '@/contexts/CertificateContext';


const MonthlyReportGenerator: React.FC = () => {
  const { isJapanese, language, currentUser } = useSessionContext();
  const { monthlyReports } = useAdminContext();
  const { sds, ehsIncidents } = useQmsContext();
  const { invoices } = useBillingContext();
  const { certificates } = useCertificates();
  const { reservations } = useReservationContext();
  const { equipment } = useEquipmentContext();
  const { consumables } = useConsumableContext();
  const { users } = useUserContext();
  const { showToast } = useToast();
  const { addMonthlyReport } = useAdminActions();
  
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth()); // 0-indexed for Date object
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [reportMarkdown, setReportMarkdown] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [currentReportPeriod, setCurrentReportPeriod] = useState<string>('');
  
  const handleGenerateReport = async () => {
    if (!currentUser) return;
    setIsGenerating(true);
    setReportMarkdown('');
    setError('');
    const period = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}`;
    setCurrentReportPeriod(period);

    try {
        const dataSources = {
            reservations: reservations,
            equipment: equipment,
            consumables: consumables,
            sds: sds,
            certificates: certificates,
            invoices: invoices,
            users: users,
            incidents: ehsIncidents,
            language: language,
        };
      const aggregatedData = aggregateMonthlyData(selectedYear, selectedMonth + 1, dataSources);
      const markdown = await generateMonthlyReport(aggregatedData, language);
      setReportMarkdown(markdown);
      
      const result = await addMonthlyReport({
        period,
        generatedAt: new Date(),
        generatedByUserId: currentUser.id,
        markdownContent: markdown,
      });

      if (result.success === false) {
        showToast(isJapanese ? 'レポートの保存に失敗しました。' : 'Failed to save the report.', 'error');
      }

    } catch (err) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(isJapanese ? `レポート生成中にエラーが発生しました: ${errorMessage}` : `Error generating report: ${errorMessage}`);
      showToast(isJapanese ? 'レポート生成エラー' : 'Report Generation Error', 'error');
    } finally {
      setIsGenerating(false);
    }
  };
  
  const handleDownloadPdf = () => {
      window.print();
  };

  const handleSendEmail = () => {
      showToast(
          isJapanese ? '現在の環境ではメール共有機能はサポートされていません。' : 'Email sharing is not supported in this environment.',
          'warning'
      );
  };
  
  const handleViewReport = (report: MonthlyReport) => {
    setReportMarkdown(report.markdownContent);
    setCurrentReportPeriod(report.period);
    setError('');
  }

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);
  const months = Array.from({ length: 12 }, (_, i) => ({
      value: i,
      label: new Date(0, i).toLocaleString(language, { month: 'long' })
  }));

  return (
    <div>
        <h2 className="text-3xl font-bold mb-6 text-ever-black no-print">{isJapanese ? '月次運営レポート' : 'Monthly Operations Report'}</h2>
        
        <div className="flex flex-col md:flex-row gap-8">
            <aside className="md:w-1/4 no-print">
                <div className="bg-white p-6 rounded-lg shadow-md mb-8">
                    <h3 className="text-lg font-bold mb-4">{isJapanese ? '新規レポート生成' : 'Generate New Report'}</h3>
                    <div className="flex flex-col gap-4">
                        <select value={selectedYear} onChange={e => setSelectedYear(parseInt(e.target.value))} className="p-2 border rounded-md">
                            {years.map(y => <option key={y} value={y}>{y}</option>)}
                        </select>
                        <select value={selectedMonth} onChange={e => setSelectedMonth(parseInt(e.target.value))} className="p-2 border rounded-md">
                            {months.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                        </select>
                        <button onClick={handleGenerateReport} disabled={isGenerating} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg disabled:bg-gray-400">
                            {isGenerating ? (isJapanese ? '生成中...' : 'Generating...') : (isJapanese ? 'レポート生成' : 'Generate Report')}
                        </button>
                    </div>
                    {isGenerating && <p className="text-sm text-gray-600 mt-4">{isJapanese ? 'AIがレポートを生成しています... (約30秒)' : 'AI is generating the report... (approx. 30 seconds)'}</p>}
                </div>
                 <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-lg font-bold mb-4">{isJapanese ? 'レポート履歴' : 'Report History'}</h3>
                    <ul className="space-y-2 max-h-96 overflow-y-auto">
                        {monthlyReports.map(report => (
                            <li key={report.id}>
                                <button onClick={() => handleViewReport(report)} className={`w-full text-left p-3 rounded-md transition-colors ${currentReportPeriod === report.period ? 'bg-blue-100 text-blue-800' : 'hover:bg-gray-100'}`}>
                                    <span className="font-semibold">{report.period}</span>
                                    <span className="block text-xs text-gray-500">{new Date(report.generatedAt).toLocaleDateString()}</span>
                                </button>
                            </li>
                        ))}
                         {monthlyReports.length === 0 && <p className="text-sm text-gray-500 text-center py-4">{isJapanese ? '履歴はありません' : 'No history'}</p>}
                    </ul>
                </div>
            </aside>

            <main className="flex-1">
                 {error && <div className="p-4 bg-red-100 text-red-700 rounded-md mb-8">{error}</div>}

                {reportMarkdown ? (
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <div className="flex justify-between items-center mb-4 border-b pb-4 no-print">
                            <h3 className="text-2xl font-bold">{isJapanese ? `レポート: ${currentReportPeriod}` : `Report: ${currentReportPeriod}`}</h3>
                            <div className="flex gap-2">
                                <button onClick={handleDownloadPdf} className="bg-white hover:bg-gray-100 text-gray-800 font-semibold py-1 px-3 border border-gray-300 rounded shadow text-sm">{isJapanese ? 'PDFダウンロード' : 'Download PDF'}</button>
                                <button onClick={handleSendEmail} className="bg-white hover:bg-gray-100 text-gray-800 font-semibold py-1 px-3 border border-gray-300 rounded shadow text-sm">{isJapanese ? 'メールで共有' : 'Share via Email'}</button>
                            </div>
                        </div>
                        <div id="report-preview" className="printable-area">
                            <MarkdownRenderer markdown={reportMarkdown} />
                        </div>
                    </div>
                ) : !isGenerating && (
                    <div className="bg-white p-12 rounded-lg shadow-md text-center">
                        <p className="text-gray-500">{isJapanese ? '左のメニューからレポートを生成するか、履歴を選択してください。' : 'Generate a new report or select one from the history.'}</p>
                    </div>
                )}
            </main>
        </div>
    </div>
  );
};

export default MonthlyReportGenerator;