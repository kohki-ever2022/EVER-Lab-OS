{pkgs}: {
  channel = "stable-24.05";
  
  # 必要なパッケージ
  packages = [
    pkgs.nodejs_20      # Node.js 20
    pkgs.jdk17          # Java 17 (Firebase Emulator用) ← 追加
  ];
  
  # 環境変数
  env = {
    JAVA_HOME = "${pkgs.jdk17}";
  };
  
  # VS Code拡張機能
  idx.extensions = [
    # 既存
    "svelte.svelte-vscode"
    "vue.volar"
    
    # EVER-Lab-OS用に追加
    "dbaeumer.vscode-eslint"
    "esbenp.prettier-vscode"
    "bradlc.vscode-tailwindcss"
    "ms-vscode.vscode-typescript-next"
    "toba.vsfire"
    "firebase.vscode-firebase-explorer"
    "usernamehw.errorlens"
    "streetsidesoftware.code-spell-checker"
    "github.copilot"
  ];
  
  # プレビュー設定
  idx.previews = {
    enable = true;
    previews = {
      # Webアプリ (Vite開発サーバー)
      web = {
        command = [
          "npm"
          "run"
          "dev"
          "--"
          "--port"
          "$PORT"
          "--host"
          "0.0.0.0"
        ];
        manager = "web";
      };
      
      # Firebase Emulator
      emulator = {
        command = [
          "firebase"
          "emulators:start"
        ];
        manager = "web";
        env = {
          FIRESTORE_EMULATOR_HOST = "localhost:8080";
        };
      };
    };
  };
}
