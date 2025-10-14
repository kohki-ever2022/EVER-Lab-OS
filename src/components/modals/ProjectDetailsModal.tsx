

import React, { useState } from 'react';
import { useSessionContext } from '../../contexts/SessionContext';
import { useUserContext } from '../../contexts/UserContext';
import { useProjectActions } from '../../hooks/useProjectActions';
// FIX: import from barrel file
import { Project } from '../../types';

interface ModalProps {
    onClose: () => void;
    project: Project | null;
}

const ProjectDetailsModal: React.FC<ModalProps> = ({ onClose, project }) => {
    const { isJapanese, currentUser } = useSessionContext();
    const { users } = useUserContext();
    const { addProject, updateProject } = useProjectActions();
    const [name, setName] = useState(project?.name || '');
    const [description, setDescription] = useState(project?.description || '');
    const [memberIds, setMemberIds] = useState(project?.memberIds || []);

    const companyMembers = users.filter(u => u.companyId === currentUser?.companyId);

    const handleSubmit = async () => {
        if (!name || !currentUser) return;

        const projectData = {
            id: project?.id || '',
            name,
            description,
            companyId: currentUser.companyId,
            memberIds,
            milestones: project?.milestones || [],
        };
        
        if (project) {
            await updateProject(projectData);
        } else {
            // @ts-ignore
            await addProject(projectData);
        }
        onClose();
    };
    
    const toggleMember = (userId: string) => {
        setMemberIds(prev => prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg">
                <h3 className="text-xl font-bold mb-4">{project ? (isJapanese ? 'プロジェクト編集' : 'Edit Project') : (isJapanese ? '新規プロジェクト' : 'New Project')}</h3>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">{isJapanese ? 'プロジェクト名' : 'Project Name'}</label>
                        <input type="text" value={name} onChange={e => setName(e.target.value)} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" required />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700">{isJapanese ? '説明' : 'Description'}</label>
                        <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">{isJapanese ? 'メンバー' : 'Members'}</label>
                        <div className="mt-2 space-y-2">
                            {companyMembers.map(member => (
                                <div key={member.id} className="flex items-center">
                                    <input type="checkbox" id={`member-${member.id}`} checked={memberIds.includes(member.id)} onChange={() => toggleMember(member.id)} className="h-4 w-4 text-ever-blue border-gray-300 rounded" />
                                    <label htmlFor={`member-${member.id}`} className="ml-2 text-sm text-gray-700">{member.name}</label>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="mt-6 flex justify-end space-x-2">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">{isJapanese ? 'キャンセル' : 'Cancel'}</button>
                    <button onClick={handleSubmit} className="px-4 py-2 bg-ever-blue text-white rounded-md hover:bg-ever-blue-dark">{isJapanese ? '保存' : 'Save'}</button>
                </div>
            </div>
        </div>
    );
};

export default ProjectDetailsModal;