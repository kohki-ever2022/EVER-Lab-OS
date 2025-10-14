// src/contexts/DataAdapterContext.tsx
import React, { createContext, useContext, ReactNode } from 'react';
import { IDataAdapter } from '../adapters/IDataAdapter';
import AdapterFactory from '../config/adapterFactory';

// DataAdapterのインスタンスを保持するためのReact Contextを作成
// 初期値はnullとし、Providerが提供する値で上書きされる
export const DataAdapterContext = createContext<IDataAdapter | null>(null);

/**
 * DataAdapterProviderコンポーネント
 * アプリケーション全体にデータアダプターのインスタンスを提供します。
 * このProviderでラップされたコンポーネントツリー内では、
 * `useDataAdapter`フックを通じてアダプターにアクセスできます。
 * @param {ReactNode} children - ラップする子コンポーネント
 */
export const DataAdapterProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // AdapterFactoryからシングルトンのアダプターインスタンスを取得
  const adapter = AdapterFactory.getAdapter();
  
  return (
    <DataAdapterContext.Provider value={adapter}>
      {children}
    </DataAdapterContext.Provider>
  );
};

/**
 * useDataAdapterカスタムフック
 * コンポーネント内でデータアダプターのインスタンスに簡単にアクセスするためのフックです。
 * @returns {IDataAdapter} データアダプターのインスタンス
 * @throws {Error} DataAdapterProviderのコンテキスト外で使用された場合にエラーをスローします。
 */
export const useDataAdapter = (): IDataAdapter => {
  const context = useContext(DataAdapterContext);
  if (!context) {
    throw new Error('useDataAdapter must be used within a DataAdapterProvider');
  }
  return context;
};