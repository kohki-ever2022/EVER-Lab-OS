import React, { useState, FormEvent } from 'react';
import { useSessionContext } from '../contexts/SessionContext';
import { useCompanyContext } from '../contexts/CompanyContext';
import { useToast } from '../contexts/ToastContext';
import { useUserActions } from '../hooks/useUserActions';

import { User } from '../types/user';

const UserProfile: React.FC = () => {
    const { currentUser, isJapanese } = useSessionContext();
    const { companies } = useCompanyContext();
    const { showToast } = useToast();
    const { updateUser } = useUserActions();
    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState(currentUser?.name || '');

    if (!currentUser) {
        return null;
    }

    const company = companies.find(c => c.id === currentUser.companyId);

    const handleSave = async (e: FormEvent) => {
        e.preventDefault();
        if (name.trim().length < 2) {
            showToast(isJapanese ? '名前は2文字以上で入力してください。' : 'Name must be at least 2 characters.', 'error');
            return;
        }
        const result = await updateUser({ ...currentUser, name: name.trim() });
        if (result.success === false) {
            showToast(result.error.message, 'error');
            return;
        }
        setIsEditing(false);
    };

    const infoFields = [
        { labelJP: 'メールアドレス', labelEN: 'Email', value: currentUser.email },
        { labelJP: '所属企業', labelEN: 'Company', value: company ? (isJapanese ? company.nameJP : company.nameEN) : '' },
        { labelJP: '役割', labelEN: 'Role', value: currentUser.role },
    ];

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-ever-black">
                    {isJapanese ? 'プロフィール' : 'Profile'}
                </h2>
                {!isEditing && (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="bg-white hover:bg-gray-100 text-gray-800 font-semibold py-2 px-4 border border-gray-300 rounded shadow text-sm"
                    >
                        {isJapanese ? '編集' : 'Edit'}
                    </button>
                )}
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex items-center mb-6">
                    {currentUser.imageUrl ? (
                        <img src={currentUser.imageUrl} alt="Profile" className="w-24 h-24 rounded-full object-cover" />
                    ) : (
                        <div className="w-24 h-24 rounded-full bg-ever-purple flex items-center justify-center text-white text-4xl font-bold">
                            {currentUser.name.charAt(0)}
                        </div>
                    )}
                    <div className="ml-6">
                        {isEditing ? (
                            <form onSubmit={handleSave}>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="text-2xl font-bold p-2 border rounded-md"
                                />
                            </form>
                        ) : (
                            <h3 className="text-3xl font-bold text-ever-black">{currentUser.name}</h3>
                        )}
                        <p className="text-gray-500">{currentUser.role}</p>
                    </div>
                </div>

                <div className="border-t pt-6">
                    <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
                        {infoFields.map((field) => (
                            <div key={field.labelEN} className="sm:col-span-1">
                                <dt className="text-sm font-medium text-gray-500">{isJapanese ? field.labelJP : field.labelEN}</dt>
                                <dd className="mt-1 text-sm text-gray-900 break-words">{field.value}</dd>
                            </div>
                        ))}
                    </dl>
                </div>
                
                {isEditing && (
                    <div className="mt-6 flex justify-end space-x-2">
                        <button
                            onClick={() => { setIsEditing(false); setName(currentUser.name); }}
                            className="bg-gray-200 text-gray-700 font-bold py-2 px-4 rounded-lg"
                        >
                            {isJapanese ? 'キャンセル' : 'Cancel'}
                        </button>
                        <button
                            onClick={handleSave}
                            className="bg-ever-blue text-white font-bold py-2 px-4 rounded-lg"
                        >
                            {isJapanese ? '保存' : 'Save'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserProfile;
