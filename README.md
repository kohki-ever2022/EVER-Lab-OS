# EVER-Lab OS

EVER-Lab OSは、共同利用型研究施設向けの統合管理アプリケーションです。備品・消耗品の在庫管理から、施設・機器の利用予約、各種申請業務までを円滑にします。

## ✨ 主な機能

*   **ダッシュボード**: 今後の予約や重要なお知らせを一覧表示
*   **機器予約**: ラボ内の共有機器をオンラインで予約・管理
*   **在庫・購買管理**: 消耗品の在庫確認、お気に入りからの簡単注文
*   **プロジェクト管理**: プロジェクトごとのタスク、電子実験ノートの管理
*   **品質・安全管理**: マニュアル、ラボルールの閲覧、資格・証明書の管理
*   **施設管理 (管理者向け)**: ユーザー、機器、請求、システム設定などの包括的な管理機能

## 🛠️ 技術スタック

*   **フロントエンド**: React 19, Vite, TypeScript
*   **UI**: Tailwind CSS
*   **データ永続化**: Firebase (Firestore) または モックデータ
*   **AI機能**: Google Gemini API

## 🚀 セットアップ方法

1.  **依存関係のインストール**:
    ```bash
    npm install
    ```

2.  **環境変数の設定**:
    プロジェクトのルートに `.env` ファイルを作成し、以下の変数を設定します。

    ```env
    # モックデータを使用する場合は 'true', Firebaseを使用する場合は 'false' を設定
    # When using mock data, set to 'true'; for Firebase, set to 'false'.
    VITE_USE_MOCK_DATA=true

    # AI機能を使用する場合は 'true' を設定 (API_KEYが必須)
    # Set to 'true' to use AI features (requires API_KEY).
    VITE_USE_MOCK_GEMINI=false

    # Firebaseを使用する場合の接続情報
    # Required if VITE_USE_MOCK_DATA is 'false'.
    VITE_FIREBASE_API_KEY="your-firebase-api-key"
    VITE_FIREBASE_AUTH_DOMAIN="your-firebase-auth-domain"
    VITE_FIREBASE_PROJECT_ID="your-firebase-project-id"
    VITE_FIREBASE_STORAGE_BUCKET="your-firebase-storage-bucket"
    VITE_FIREBASE_MESSAGING_SENDER_ID="your-firebase-messaging-sender-id"
    VITE_FIREBASE_APP_ID="your-firebase-app-id"
    
    # Gemini APIを使用する場合のAPIキー
    # Required if VITE_USE_MOCK_GEMINI is 'false'.
    API_KEY="your-gemini-api-key"
    ```

3.  **開発サーバーの起動**:
    ```bash
    npm run dev
    ```
    サーバーが起動し、 `http://localhost:3000` でアプリケーションにアクセスできます。

## 🧪 利用可能なスクリプト

*   `npm run test`: Vitestを使用してユニットテストを実行します。
*   `npm run analyze:all`: `knip`, `madge`, `jscpd`を使用して、未使用のファイルや循環参照、コードの重複を検出します。

## 👤 デモ用ログイン情報

`VITE_USE_MOCK_DATA=true` を設定している場合、以下のメールアドレスで各役割のユーザーとしてログインできます。パスワードは `password` です。

*   **施設責任者 (Facility Director)**: `taro.suzuki@ever.com`
*   **ラボマネージャー (Lab Manager)**: `jiro.tanaka@ever.com`
*   **プロジェクトマネージャー (Project Manager)**: `hanako.yamada@tenant-a.com`
*   **研究員 (Researcher)**: `ichiro.sato@tenant-a.com`
*   **サプライヤー (Supplier)**: `rep@supplier.com`