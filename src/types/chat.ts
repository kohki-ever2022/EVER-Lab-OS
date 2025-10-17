export enum ChatRoomType {
  TEAM_CHAT = 'TEAM_CHAT',
  DIRECT_MESSAGE = 'DIRECT_MESSAGE',
  BULLETIN_BOARD = 'BULLETIN_BOARD'
}

export interface ChatRoom {
  id: string;
  type: ChatRoomType;
  name: string;
  memberIds: string[];
  companyId?: string;
  createdBy: string;
  createdAt: Date;
  lastMessageAt: Date;
  metadata: {
    pinnedMessages?: string[];
    announcements?: string[];
    description?: string;
    avatar?: string;
  };
}

export interface ChatMessage {
  id: string;
  roomId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  content: string;
  type: 'TEXT' | 'FILE' | 'IMAGE' | 'SYSTEM';
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  reactions?: Record<string, string[]>;
  isEdited: boolean;
  isPinned: boolean;
  createdAt: Date;
  updatedAt: Date;
}
