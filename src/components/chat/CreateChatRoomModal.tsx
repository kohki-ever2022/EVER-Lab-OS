
import { useState, useEffect, useMemo, useCallback } from 'react';
import { X, Users, MessageSquare, Loader2 } from 'lucide-react';
import { UserSelector } from './UserSelector';
import { useChatRooms } from '../../hooks/useChatRooms';
import { useAuth } from '../../hooks/useAuth';
import { useToast, ToastType } from '../../contexts/ToastContext';
import { useDataAdapter } from '../../contexts/DataAdapterContext';

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
  // null: unselected, true: Group, false: DM
  const [isGroup, setIsGroup] = useState<boolean | null>(null);
  const [roomName, setRoomName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { createRoom } = useChatRooms();
  const { user: currentUser } = useAuth(); // aliasing user to currentUser
  const { showToast } = useToast();
  const dataAdapter = useDataAdapter();

  const resetState = useCallback(() => {
    setStep(1);
    setIsGroup(null);
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

  const validateStep2 = useCallback(() => {
    const newErrors: { [key: string]: string } = {};
    if (isGroup) {
      if (roomName.trim().length < 3 || roomName.trim().length > 50) {
        newErrors.roomName = 'ルーム名は3文字以上50文字以内で入力してください。';
      }
    }
    if (description.length > 200) {
      newErrors.description = '説明は200文字以内で入力してください。';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [roomName, description, isGroup]);
  
  const handleNextStep = () => {
      if (step === 2 && !validateStep2()) return;
      setStep(s => s + 1);
  }

  const isNextButtonDisabled = useMemo(() => {
    if (step === 1) return isGroup === null;
    if (step === 2) {
        if (isGroup) {
            if (roomName.trim().length < 3 || roomName.trim().length > 50) return true;
        }
        if (description.length > 200) return true;
        return false;
    }
    return false;
  }, [step, isGroup, roomName, description]);

  const isCreateButtonDisabled = useMemo(() => {
    if (isSubmitting || isGroup === null) return true;
    
    const isMemberSelected = selectedUserIds.length > 0;
    if (!isMemberSelected) return true;

    if (!isGroup) { // DM
      return selectedUserIds.length !== 1;
    }
    
    if (isGroup) { // Group
        return roomName.trim().length < 3 || roomName.trim().length > 50;
    }

    return false;
  }, [isSubmitting, isGroup, selectedUserIds, roomName]);

  const handleSubmit = async () => {
    if (isCreateButtonDisabled || isGroup === null) return;
    
    setIsSubmitting(true);
    setErrors({});

    let finalRoomName = roomName.trim();
    
    try {
        if (!isGroup && selectedUserIds.length === 1) {
            const otherUserId = selectedUserIds[0];
            const userResult = await dataAdapter.getUserById(otherUserId);
            if(userResult.success && userResult.data) {
                const otherUserName = userResult.data.name;
                const currentUserName = currentUser?.name || '自分';
                finalRoomName = `${otherUserName}と${currentUserName}のチャット`;
            } else {
                 finalRoomName = 'ダイレクトメッセージ';
            }
        }

      const allMemberIds = [...new Set([...selectedUserIds, ...(currentUser ? [currentUser.id] : [])])];

      const roomId = await createRoom({
        name: finalRoomName,
        memberIds: allMemberIds,
        isGroup: isGroup,
        lastMessage: ''
      });
      
      showToast('チャットルームを作成しました', 'success');
      if (onSuccess) onSuccess(roomId);
      handleClose();

    } catch (error) {
      console.error("Error creating room:", error);
      const errorMessage = 'チャットルームの作成に失敗しました。';
      setErrors({ form: errorMessage });
      showToast(errorMessage, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;
  
  const renderStepContent = () => {
      switch(step) {
          case 1:
              return (
                <div className="space-y-4">
                    <RoomTypeCard 
                        icon={<Users className="w-6 h-6"/>} 
                        title="チームチャット" 
                        description="複数のメンバーでグループチャット" 
                        onClick={() => setIsGroup(true)}
                        selected={isGroup === true}
                    />
                    <RoomTypeCard 
                        icon={<MessageSquare className="w-6 h-6"/>} 
                        title="ダイレクトメッセージ" 
                        description="1対1の個人チャット" 
                        onClick={() => setIsGroup(false)}
                        selected={isGroup === false}
                    />
                </div>
              );
            case 2:
                return (
                    <div className="space-y-4 animate-fade-in">
                        {isGroup && (
                             <div>
                                <label htmlFor="roomName" className="block text-sm font-medium text-gray-700">ルーム名</label>
                                <input 
                                    type="text" 
                                    id="roomName" 
                                    value={roomName} 
                                    onChange={e => { setRoomName(e.target.value); delete errors.roomName; }}
                                    placeholder="例: 機器管理チーム"
                                    className={`mt-1 block w-full border rounded-md shadow-sm p-2 ${errors.roomName ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-600'}`}
                                />
                                {errors.roomName && <p className="mt-1 text-sm text-red-500">{errors.roomName}</p>}
                            </div>
                        )}
                        <div>
                           <label htmlFor="description" className="block text-sm font-medium text-gray-700">説明 (任意)</label>
                            <textarea 
                                id="description" 
                                value={description} 
                                onChange={e => { setDescription(e.target.value); delete errors.description; }}
                                placeholder="このチャットルームの目的を入力..."
                                maxLength={201}
                                rows={3}
                                className={`mt-1 block w-full border rounded-md shadow-sm p-2 ${errors.description ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-600'}`}
                            />
                            {errors.description && <p className="mt-1 text-sm text-red-500">{errors.description}</p>}
                        </div>
                    </div>
                );
            case 3:
                return (
                    <div className="animate-fade-in">
                        <UserSelector 
                            selectedUserIds={selectedUserIds}
                            onSelectionChange={setSelectedUserIds}
                            excludeCurrentUser={true}
                            maxSelection={!isGroup ? 1 : undefined}
                        />
                    </div>
                )
      }
  }

  return (
    <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 transition-opacity duration-300 ease-in-out" 
        role="dialog" 
        aria-modal="true" 
        aria-labelledby="modal-title"
        onClick={handleClose}
    >
        <div 
            className="bg-white rounded-lg shadow-2xl w-full max-w-2xl transform transition-all duration-300 ease-in-out scale-100 max-h-[90vh] flex flex-col"
            onClick={e => e.stopPropagation()} // Prevent closing when clicking inside
        >
            <div className="flex justify-between items-center p-4 border-b border-gray-200">
                <h2 id="modal-title" className="text-lg font-semibold text-gray-800">新しいチャットルームを作成 (ステップ {step}/3)</h2>
                <button onClick={handleClose} className="p-1 rounded-full text-gray-500 hover:bg-gray-200 hover:text-gray-800 transition-colors">
                    <X className="w-6 h-6"/>
                </button>
            </div>

            <div className="p-6 overflow-y-auto flex-grow">{renderStepContent()}</div>

            <div className="flex justify-between items-center p-4 border-t bg-gray-50 rounded-b-lg">
                <div>
                    {step > 1 && (
                        <button 
                            onClick={() => setStep(step - 1)} 
                            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
                        >
                            戻る
                        </button>
                    )}
                </div>
                <div>
                {step < 3 ? (
                     <button 
                        onClick={handleNextStep} 
                        disabled={isNextButtonDisabled} 
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors"
                     >
                         次へ
                     </button>
                ) : (
                    <button 
                        onClick={handleSubmit} 
                        disabled={isCreateButtonDisabled} 
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />} 
                        {isSubmitting ? '作成中...' : 'チャットを作成'}
                    </button>
                )}
                </div>
            </div>
             {errors.form && (
                <div className="p-3 text-sm text-red-700 bg-red-100 border-t border-red-200">
                    {errors.form}
                </div>
            )}
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
        role="radio"
        aria-checked={selected}
        tabIndex={0}
        onKeyDown={(e) => { if(e.key === ' ' || e.key === 'Enter') onClick()}}
        className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ease-in-out ${selected ? 'border-blue-600 bg-blue-50 ring-2 ring-blue-500/50' : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'}`}>
        <div className="mr-4 text-blue-600">{icon}</div>
        <div className="flex-grow">
            <h3 className="font-semibold text-gray-800">{title}</h3>
            <p className="text-sm text-gray-500">{description}</p>
        </div>
    </div>
);

