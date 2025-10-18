import { Timestamp } from 'firebase/firestore';

// チャットルームの型定義
export interface ChatRoom {
  id: string;
  name: string; // グループチャット名
  memberIds: string[]; // 参加メンバーのIDリスト
  memberInfo: { [key: string]: { name: string; avatar?: string; } }; // メンバーの詳細情報
  isGroup: boolean; // グループチャットかどうか
  lastMessage?: string; // 最後のメッセージのプレビュー
  lastMessageAt: Timestamp | Date; // 最後のメッセージの送信日時
  lastRead?: { [key: string]: Timestamp | Date }; // 各メンバーの最終既読日時
  createdAt: Timestamp | Date;
  updatedAt: Timestamp | Date;
  createdBy: string; // 作成者のUID
}

// チャットメッセージの型定義
export interface ChatMessage {
  id: string;
  roomId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  content?: string; // テキストメッセージ
  type: 'TEXT' | 'FILE' | 'IMAGE'; // メッセージタイプ
  isEdited: boolean;
  isPinned: boolean;
  reactions?: { [key: string]: string[] }; // 絵文字リアクション（例: { '👍': ['uid1', 'uid2'] }）
  createdAt: Timestamp | Date;
  updatedAt: Timestamp | Date;
  // ファイル関連情報
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
}
