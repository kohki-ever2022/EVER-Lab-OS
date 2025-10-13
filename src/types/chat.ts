// src/types/chat.ts

export interface ChatRoom {
  id: string;
  type: 'TENANT_TO_FACILITY' | 'INTERNAL';
  participantIds: string[]; // User IDsの配列
  tenantId?: string; // テナントからの問い合わせの場合
  subject: string;
  lastMessageAt: Date;
  lastMessage?: string;
  unreadCount: { [userId: string]: number }; // ユーザーごとの未読数
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatMessage {
  id: string;
  roomId: string;
  senderId: string;
  content: string;
  attachments?: { name: string; url: string }[]; // Firebase Storage URLs
  createdAt: Date;
  readBy: string[]; // 既読したユーザーID配列
  editedAt?: Date;
}

export enum ChatRoomType {
  TenantToFacility = 'TENANT_TO_FACILITY',
  Internal = 'INTERNAL'
}
