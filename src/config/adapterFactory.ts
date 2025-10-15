// src/config/adapterFactory.ts
import { IDataAdapter } from '../adapters/IDataAdapter';
import { MockAdapter } from '../adapters/MockAdapter';
import { FirebaseAdapter } from '../adapters/FirebaseAdapter';

/**
 * データアダプターのファクトリークラス (Singleton Pattern)
 * 環境変数 `VITE_USE_MOCK_DATA` の値に基づいて、
 * MockAdapterまたはFirebaseAdapterの唯一のインスタンスを生成・提供します。
 *
 * 環境変数:
 * Viteでビルドする際に、`.env`ファイルなどで `VITE_USE_MOCK_DATA` を設定します。
 * - `VITE_USE_MOCK_DATA=true`: 開発用にモックデータアダプターを使用します。
 * - `VITE_USE_MOCK_DATA=false` (または未設定): 本番用にFirebaseデータアダプターを使用します。
 */
class AdapterFactory {
  // シングルトンインスタンスを保持するプライベートな静的プロパティ
  private static instance: IDataAdapter | null = null;
  
  /**
   * 設定に基づいて適切なデータアダプターのインスタンスを取得します。
   * インスタンスがまだ存在しない場合は、環境変数を元に新規作成します。
   * @returns {IDataAdapter} IDataAdapterインターフェースを実装したアダプターインスタンス
   */
  static getAdapter(): IDataAdapter {
    if (!this.instance) {
      // Vite projects expose env variables on import.meta.env
      const useMock = import.meta.env.VITE_USE_MOCK_DATA === 'true';
      
      if (useMock) {
        console.log('🔧 Using Mock Adapter (Development Mode)');
        this.instance = new MockAdapter();
      } else {
        // Default to Firebase if VITE_USE_MOCK_DATA is not 'true'
        console.log('🚀 Using Firebase Adapter (Production Mode)');
        this.instance = new FirebaseAdapter();
      }
    }
    return this.instance;
  }
  
  /**
   * テスト目的で、現在のアダプターインスタンスを強制的にリセットします。
   * これにより、次回の `getAdapter` 呼び出し時に新しいインスタンスが生成されます。
   */
  static resetAdapter() {
    this.instance = null;
  }
}

export default AdapterFactory;