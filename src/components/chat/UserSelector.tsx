import { useState, useMemo, useEffect } from 'react';
import { Search, X, User as UserIcon } from 'lucide-react';
import { useDataAdapter } from '../../contexts/DataAdapterContext';
import { useAuth } from '../../hooks/useAuth';
import type { User } from '../../types';

interface UserSelectorProps {
  selectedUserIds: string[];
  onSelectionChange: (userIds: string[]) => void;
  excludeCurrentUser?: boolean;
  maxSelection?: number;
}

export const UserSelector: React.FC<UserSelectorProps> = ({
  selectedUserIds,
  onSelectionChange,
  excludeCurrentUser = false,
  maxSelection,
}) => {
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);
  const dataAdapter = useDataAdapter();
  const { currentUser } = useAuth();

  useEffect(() => {
    const unsubscribe = dataAdapter.subscribeToUsers((users) => {
      setAllUsers(users);
      setError(null);
    }, (err) => {
        console.error("Failed to fetch users:", err);
        setError("ユーザーの読み込みに失敗しました。");
    });
    return () => unsubscribe();
  }, [dataAdapter]);

  const filteredUsers = useMemo(() => {
    let users = allUsers;
    if (excludeCurrentUser && currentUser) {
      users = users.filter(user => user.id !== currentUser.id);
    }
    
    if (searchQuery) {
        const lowercasedQuery = searchQuery.toLowerCase();
        users = users.filter(user =>
            user.name.toLowerCase().includes(lowercasedQuery) ||
            user.companyName?.toLowerCase().includes(lowercasedQuery)
        );
    }

    return users;
  }, [allUsers, searchQuery, excludeCurrentUser, currentUser]);

  const handleSelection = (userId: string) => {
    const newSelection = selectedUserIds.includes(userId)
      ? selectedUserIds.filter(id => id !== userId)
      : [...selectedUserIds, userId];

    if (!maxSelection || newSelection.length <= maxSelection) {
      onSelectionChange(newSelection);
    }
  };
  
  const isSelectionDisabled = (userId: string) => {
      return !!maxSelection && selectedUserIds.length >= maxSelection && !selectedUserIds.includes(userId);
  }

  const selectedUsers = useMemo(() => {
    return allUsers.filter(user => selectedUserIds.includes(user.id));
  }, [selectedUserIds, allUsers]);


  return (
    <div className="flex flex-col gap-2">
        <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
                type="text"
                placeholder="名前または会社名で検索"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
            />
        </div>
        
        {selectedUsers.length > 0 && (
            <div className="flex flex-wrap gap-2 p-2 bg-gray-50 border border-gray-200 rounded-md">
                {selectedUsers.map(user => (
                    <div key={user.id} className="flex items-center gap-2 bg-blue-100 text-blue-800 text-sm font-medium px-2 py-1 rounded-full">
                        {user.imageUrl ? (
                            <img src={user.imageUrl} alt={user.name} className="w-5 h-5 rounded-full" />
                        ) : (
                            <span className="w-5 h-5 rounded-full bg-gray-300 flex items-center justify-center text-xs text-white"><UserIcon size={12}/></span>
                        )}
                        <span>{user.name}</span>
                        <button onClick={() => onSelectionChange(selectedUserIds.filter(id => id !== user.id))} className="text-blue-600 hover:text-blue-800">
                            <X size={16} />
                        </button>
                    </div>
                ))}
            </div>
        )}

      <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-md bg-white">
        {error && <p className="text-red-500 p-4">{error}</p>}
        {!error && filteredUsers.map(user => {
            const isDisabled = isSelectionDisabled(user.id);
            const isSelected = selectedUserIds.includes(user.id);

            return (
                <div 
                    key={user.id} 
                    onClick={() => !isDisabled && handleSelection(user.id)}
                    className={`
                        flex items-center gap-3 p-3 cursor-pointer transition-colors 
                        ${isSelected ? 'bg-blue-50' : 'hover:bg-gray-100'}
                        ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}
                    `}
                    role="checkbox"
                    aria-checked={isSelected}
                    aria-disabled={isDisabled}
                    tabIndex={0}
                    onKeyDown={(e) => e.key === ' ' && !isDisabled && handleSelection(user.id)}
                >
                    <div className="flex-shrink-0">
                        <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {}} // Click is handled by div
                            disabled={isDisabled}
                            className="form-checkbox h-5 w-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500 transition-transform duration-150 ease-in-out transform-gpu"
                            style={{ transform: isSelected ? 'scale(1.1)' : 'scale(1)' }}
                        />
                    </div>
                    {user.imageUrl ? (
                        <img src={user.imageUrl} alt={user.name} className="w-10 h-10 rounded-full" />
                    ) : (
                        <span className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-xl text-white">
                            {user.name.charAt(0)}
                        </span>
                    )}
                    <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-800 truncate">{user.name}</p>
                        <p className="text-sm text-gray-500 truncate">{user.companyName || '会社情報なし'}</p>
                    </div>
                    <span className="text-xs font-medium bg-gray-200 text-gray-700 px-2 py-1 rounded-full">{user.role}</span>
                </div>
            );
        })}
        {!error && filteredUsers.length === 0 && (
            <div className="text-center py-4 text-gray-500">
                <p>ユーザーが見つかりません。</p>
            </div>
        )}
      </div>
       {maxSelection && <p className="text-xs text-right text-gray-500">選択済み: {selectedUserIds.length} / {maxSelection}</p>}
    </div>
  );
};
