import React, { useState, useEffect } from 'react';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../../firebase'; // Adjust this path if needed

// Mock function to get backup list. In a real app, you might get this from a Cloud Function.
const getBackupList = async (): Promise<string[]> => {
  // This is a placeholder. You would implement a function to list backup folders in your GCS bucket.
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  return Promise.resolve([today, yesterday]);
};

export const BackupManager: React.FC = () => {
  const [backups, setBackups] = useState<string[]>([]);
  const [selectedBackup, setSelectedBackup] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  useEffect(() => {
    getBackupList().then(setBackups);
  }, []);

  const restoreBackup = httpsCallable(functions, 'restoreFirestoreBackup');

  const handleRestore = async () => {
    if (
      !selectedBackup ||
      !window.confirm(
        `${selectedBackup}のバックアップをリストアしますか？ この操作は現在のデータベースを上書きする可能性があり、元に戻せません。`
      )
    )
      return;

    setIsLoading(true);
    setStatusMessage('');
    try {
      const result = await restoreBackup({ backupDate: selectedBackup });
      setStatusMessage(
        `リストアが開始されました。Operation: ${(result.data as any).operation}`
      );
      alert('リストアが開始されました');
    } catch (error) {
      console.error(error);
      const errorMessage =
        error instanceof Error ? error.message : '不明なエラーが発生しました。';
      setStatusMessage(`リストアに失敗しました: ${errorMessage}`);
      alert(`リストアに失敗しました: ${errorMessage}`);
    }
    setIsLoading(false);
  };

  return (
    <div className='p-6 bg-white shadow-md rounded-lg'>
      <h2 className='text-2xl font-bold mb-4 text-gray-800'>
        データベースバックアップ管理
      </h2>
      <div className='flex items-center space-x-4'>
        <select
          value={selectedBackup}
          onChange={(e) => setSelectedBackup(e.target.value)}
          className='p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 flex-grow'
          disabled={isLoading}
        >
          <option value=''>復元するバックアップを選択...</option>
          {backups.map((backup) => (
            <option key={backup} value={backup}>
              {backup}
            </option>
          ))}
        </select>
        <button
          onClick={handleRestore}
          disabled={!selectedBackup || isLoading}
          className='px-6 py-2 bg-red-600 text-white font-semibold rounded-md hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-300'
        >
          {isLoading ? '処理中...' : 'リストア実行'}
        </button>
      </div>
      {statusMessage && (
        <p
          className={`mt-4 text-sm ${statusMessage.includes('失敗') ? 'text-red-600' : 'text-green-600'}`}
        >
          {statusMessage}
        </p>
      )}
      <p className='mt-4 text-sm text-gray-600'>
        注意:
        リストア処理はデータベース全体に影響します。実行には細心の注意を払ってください。
      </p>
    </div>
  );
};
