
import { useState, useEffect, useMemo, useCallback } from 'react';
import { X, Users, MessageSquare, Megaphone, Loader2 } from 'lucide-react';
import { UserSelector } from './UserSelector';
import { useChatRooms } from '../../hooks/useChatRooms';
import { useAuth } from '../../hooks/useAuth';
import { ChatRoomType } from '../../types/chat';
import { useToast } from '../../contexts/ToastContext';
import { useDataAdapter } from '../../contexts/DataAdapterContext';
import type { User } from '../../types';

interface CreateChatRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (roomId: string) => void;
}

export const CreateChatRoomModal: React.FC<CreateChatRoomModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [step, setStep] = useState(1);
  const [roomType, setRoomType] = useState<ChatRoomType | null>(null);
  const [roomName, setRoomName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { createRoom } = useChatRooms();
  const { currentUser } = useAuth();
  const { showToast } = useToast();
  const dataAdapter = useDataAdapter();
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    if(isOpen) {
        const unsubscribe = dataAdapter.subscribeToUsers(setUsers, console.error);
        return () => unsubscribe();
    }
  }, [isOpen, dataAdapter]);

  const resetState = useCallback(() => {
    setStep(1);
    setRoomType(null);
    setRoomName('');
    setDescription('');
    setSelectedUserIds([]);
    setErrors({});
    setIsSubmitting(false);
  }, []);

  const handleClose = useCallback(() => {
    resetState();
    onClose();
  }, [onClose, resetState]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') handleClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleClose]);

  const validateStep2 = () => {
      const newErrors: {[key: string]: string} = {};
      if(roomType !== ChatRoomType.DIRECT) {
        if (roomName.length < 3 || roomName.length > 50) {
            newErrors.roomName = 'ルーム名は3文字以上50文字以内で入力してください。';
        }
      }
      if(description.length > 200) {
          newErrors.description = '説明は200文字以内で入力してください。';
      }
      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
  }

  const canProceedToNext = useMemo(() => {
      if (step === 1) return roomType !== null;
      if (step === 2) return validateStep2();
      return false;
  }, [step, roomType, roomName, description]);

  const isFormValid = useMemo(() => {
      if (roomType === ChatRoomType.DIRECT) {
          return selectedUserIds.length === 1;
      }
      if (roomType === ChatRoomType.GROUP || roomType === ChatRoomType.BROADCAST) {
          return roomName.length >= 3 && roomName.length <= 50 && selectedUserIds.length > 0;
      }
      return false;
  }, [roomType, roomName, selectedUserIds]);

  const handleSubmit = async () => {
    if (!isFormValid) return;
    setIsSubmitting(true);
    setErrors({});

    let finalRoomName = roomName;
    if (roomType === ChatRoomType.DIRECT && selectedUserIds.length === 1) {
        const otherUser = users.find(u => u.id === selectedUserIds[0]);
        finalRoomName = otherUser ? `${otherUser.name}とのチャット` : 'ダイレクトメッセージ';
    }

    try {
      const roomId = await createRoom({
        name: finalRoomName,
        description,
        memberIds: [...selectedUserIds, ...(currentUser ? [currentUser.id] : [])],
        type: roomType!,
        isPrivate: roomType === ChatRoomType.DIRECT
      });
      showToast('チャットルームを作成しました', { type: 'success' });
      if(onSuccess) onSuccess(roomId);
      handleClose();
    } catch (error) {
      console.error("Error creating room:", error);
      setErrors({ form: 'チャットルームの作成に失敗しました。' });
      showToast('チャットルームの作成に失敗しました', { type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const renderStep = () => {
      switch(step) {
          case 1:
              return (
                <div className="space-y-4">
                    <RoomTypeCard 
                        icon={<Users />} 
                        title="チームチャット" 
                        description="複数のメンバーでグループチャット" 
                        onClick={() => setRoomType(ChatRoomType.GROUP)}
                        selected={roomType === ChatRoomType.GROUP}
                    />
                    <RoomTypeCard 
                        icon={<MessageSquare />} 
                        title="ダイレクトメッセージ" 
                        description="1対1の個人チャット" 
                        onClick={() => setRoomType(ChatRoomType.DIRECT)}
                        selected={roomType === ChatRoomType.DIRECT}
                    />
                    {currentUser?.role === 'FACILITY_ADMIN' && (
                         <RoomTypeCard 
                            icon={<Megaphone />} 
                            title="掲示板" 
                            description="重要なお知らせを共有 (施設管理者のみ)" 
                            onClick={() => setRoomType(ChatRoomType.BROADCAST)}
                            selected={roomType === ChatRoomType.BROADCAST}
                        />
                    )}
                </div>
              );
            case 2:
                return (
                    <div className="space-y-4">
                        {roomType !== ChatRoomType.DIRECT && (
                             <div>
                                <label htmlFor="roomName" className="block text-sm font-medium text-gray-700">ルーム名</label>
                                <input 
                                    type="text" 
                                    id="roomName" 
                                    value={roomName} 
                                    onChange={e => setRoomName(e.target.value)}
                                    placeholder="例: 機器管理チーム"
                                    className={`mt-1 block w-full border rounded-md shadow-sm p-2 ${errors.roomName ? 'border-red-500' : 'border-gray-300'}`}
                                />
                                {errors.roomName && <p className="mt-1 text-sm text-red-500">{errors.roomName}</p>}
                            </div>
                        )}
                        <div>
                           <label htmlFor="description" className="block text-sm font-medium text-gray-700">説明 (任意)</label>
                            <textarea 
                                id="description" 
                                value={description} 
                                onChange={e => setDescription(e.target.value)}
                                placeholder="このチャットルームの目的を入力..."
                                rows={3}
                                className={`mt-1 block w-full border rounded-md shadow-sm p-2 ${errors.description ? 'border-red-500' : 'border-gray-300'}`}
                            />
                            {errors.description && <p className="mt-1 text-sm text-red-500">{errors.description}</p>}
                        </div>
                    </div>
                );
            case 3:
                return (
                    <UserSelector 
                        selectedUserIds={selectedUserIds}
                        onSelectionChange={setSelectedUserIds}
                        excludeCurrentUser={roomType !== ChatRoomType.BROADCAST}
                        maxSelection={roomType === ChatRoomType.DIRECT ? 1 : undefined}
                    />
                )
      }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center transition-opacity duration-300" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl m-4 transform transition-all duration-300 scale-100 max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center p-4 border-b">
                <h2 id="modal-title" className="text-lg font-semibold">新しいチャットルームを作成 (ステップ {step}/3)</h2>
                <button onClick={handleClose} className="p-1 rounded-full hover:bg-gray-200"><X /></button>
            </div>

            <div className="p-6 overflow-y-auto">{renderStep()}</div>

            <div className="flex justify-between items-center p-4 border-t">
                <div>
                    {step > 1 && <button onClick={() => setStep(step - 1)} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">戻る</button>}
                </div>
                <div>
                {step < 3 ? (
                     <button onClick={() => { if(step === 2 && !validateStep2()) return; setStep(step+1) }} disabled={!canProceedToNext} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300">次へ</button>
                ) : (
                    <button onClick={handleSubmit} disabled={!isFormValid || isSubmitting} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300 flex items-center">
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} 
                        {isSubmitting ? '作成中...' : '作成'}
                    </button>
                )}
                </div>
            </div>
             {errors.form && <p className="p-4 text-sm text-red-500 bg-red-50">{errors.form}</p>}
        </div>
    </div>
  );
};

interface RoomTypeCardProps {
    icon: React.ReactNode;
    title: string;
    description: string;
    selected: boolean;
    onClick: () => void;
}

const RoomTypeCard: React.FC<RoomTypeCardProps> = ({ icon, title, description, selected, onClick }) => (
    <div 
        onClick={onClick} 
        className={`flex items-start p-4 border rounded-lg cursor-pointer transition-all ${selected ? 'border-blue-600 bg-blue-50 ring-2 ring-blue-600' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'}`}>
        <div className="mr-4 text-blue-600">{icon}</div>
        <div>
            <h3 className="font-semibold">{title}</h3>
            <p className="text-sm text-gray-500">{description}</p>
        </div>
    </div>
);