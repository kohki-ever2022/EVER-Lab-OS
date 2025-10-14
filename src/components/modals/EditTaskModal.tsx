// src/components/modals/EditTaskModal.tsx
import React, { useState, useMemo } from 'react';
import { Task, TaskStatus, TaskPriority, TaskScope } from '../../types';
import { useSessionContext } from '../../contexts/SessionContext';
import { useUserContext } from '../../contexts/UserContext';
import { useProjectContext } from '../../contexts/ProjectContext';
import { useProjectActions } from '../../hooks/useProjectActions';
import { useToast } from '../../contexts/ToastContext';

interface Props {
    task: Task | null;
    onClose: () => void;
}

const EditTaskModal: React.FC<Props> = ({ task, onClose }) => {
    const { isJapanese, currentUser } = useSessionContext();
    const { users } = useUserContext();
    const { projects } = useProjectContext();
    const { addTask, updateTask, deleteTask } = useProjectActions();
    const { showToast } = useToast();

    const isNewTask = !task;

    const [formData, setFormData] = useState<Partial<Task>>({
        title: task?.title || '',
        description: task?.description || '',
        projectId: task?.projectId || '',
        assigneeIds: task?.assigneeIds || (currentUser ? [currentUser.id] : []),
        status: task?.status || TaskStatus.ToDo,
        priority: task?.priority || TaskPriority.Medium,
        startDate: task?.startDate || new Date(),
        dueDate: task?.dueDate,
        scope: task?.scope || TaskScope.Team,
        isPrivate: task?.isPrivate || false,
    });
    
    const companyMembers = useMemo(() => {
        if (!currentUser) return [];
        return users.filter(u => u.companyId === currentUser.companyId);
    }, [users, currentUser]);

    const myProjects = useMemo(() => {
        if (!currentUser) return [];
        return projects.filter(p => p.companyId === currentUser.companyId);
    }, [projects, currentUser]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };
    
    const handleDateChange = (name: 'startDate' | 'dueDate', value: string) => {
        setFormData(prev => ({ ...prev, [name]: value ? new Date(value) : undefined }));
    };

    const toggleAssignee = (userId: string) => {
        setFormData(prev => ({
            ...prev,
            assigneeIds: prev.assigneeIds?.includes(userId)
                ? prev.assigneeIds.filter(id => id !== userId)
                : [...(prev.assigneeIds || []), userId]
        }));
    };

    const handleSave = async () => {
        if (!formData.title) {
            showToast(isJapanese ? 'タイトルは必須です。' : 'Title is required.', 'error');
            return;
        }

        const taskData = { ...formData };
        if (taskData.dueDate === null) delete taskData.dueDate;

        const result = isNewTask
            ? await addTask(taskData as Omit<Task, 'id' | 'createdByUserId' | 'createdAt' | 'updatedAt'>)
            : await updateTask({ ...task, ...taskData } as Task);
        
        if (result.success) {
            showToast(isJapanese ? 'タスクを保存しました。' : 'Task saved.', 'success');
            onClose();
        } else {
            showToast(isJapanese ? '保存に失敗しました。' : 'Failed to save task.', 'error');
        }
    };
    
    const handleDelete = async () => {
        if (!task) return;
        if (window.confirm(isJapanese ? 'このタスクを削除しますか？' : 'Are you sure you want to delete this task?')) {
            const result = await deleteTask(task.id);
            if (result.success) {
                showToast(isJapanese ? 'タスクを削除しました。' : 'Task deleted.', 'success');
                onClose();
            } else {
                showToast(isJapanese ? '削除に失敗しました。' : 'Failed to delete task.', 'error');
            }
        }
    };
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 modal-backdrop">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl modal-content max-h-[90vh] flex flex-col">
                <h3 className="text-xl font-bold mb-4">{isNewTask ? (isJapanese ? '新規タスク' : 'New Task') : (isJapanese ? 'タスク編集' : 'Edit Task')}</h3>
                <div className="flex-grow overflow-y-auto pr-2 space-y-4">
                    <input type="text" name="title" placeholder={isJapanese ? "タスクのタイトル" : "Task Title"} value={formData.title} onChange={handleChange} className="w-full text-lg font-bold border-b-2 pb-1 focus:outline-none focus:border-ever-blue" />
                    <textarea name="description" placeholder={isJapanese ? "詳細..." : "Description..."} value={formData.description} onChange={handleChange} className="w-full border rounded-md p-2 text-sm" rows={4}></textarea>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Assignees */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">{isJapanese ? '担当者' : 'Assignees'}</label>
                            <div className="max-h-24 overflow-y-auto border rounded-md p-2 space-y-1">
                                {companyMembers.map(member => (
                                    <label key={member.id} className="flex items-center text-sm">
                                        <input type="checkbox" checked={formData.assigneeIds?.includes(member.id)} onChange={() => toggleAssignee(member.id)} className="h-4 w-4 rounded" />
                                        <span className="ml-2">{member.name}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                        {/* Project */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">{isJapanese ? 'プロジェクト' : 'Project'}</label>
                            <select name="projectId" value={formData.projectId} onChange={handleChange} className="w-full border rounded p-2 mt-1 text-sm">
                                <option value="">{isJapanese ? 'なし' : 'None'}</option>
                                {myProjects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">{isJapanese ? 'ステータス' : 'Status'}</label>
                            <select name="status" value={formData.status} onChange={handleChange} className="w-full border rounded p-2 mt-1 text-sm">
                                {Object.values(TaskStatus).map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">{isJapanese ? '優先度' : 'Priority'}</label>
                            <select name="priority" value={formData.priority} onChange={handleChange} className="w-full border rounded p-2 mt-1 text-sm">
                                {Object.values(TaskPriority).map(p => <option key={p} value={p}>{p}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">{isJapanese ? '開始日' : 'Start Date'}</label>
                            <input type="date" value={formData.startDate ? new Date(formData.startDate).toISOString().split('T')[0] : ''} onChange={e => handleDateChange('startDate', e.target.value)} className="w-full border rounded p-2 mt-1 text-sm" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">{isJapanese ? '期限日' : 'Due Date'}</label>
                            <input type="date" value={formData.dueDate ? new Date(formData.dueDate).toISOString().split('T')[0] : ''} onChange={e => handleDateChange('dueDate', e.target.value)} className="w-full border rounded p-2 mt-1 text-sm" />
                        </div>
                    </div>
                </div>
                <div className="flex justify-between items-center mt-6 pt-4 border-t">
                    <div>
                        {!isNewTask && (
                             <button onClick={handleDelete} className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600">{isJapanese ? '削除' : 'Delete'}</button>
                        )}
                    </div>
                    <div className="flex gap-2">
                        <button onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">{isJapanese ? 'キャンセル' : 'Cancel'}</button>
                        <button onClick={handleSave} className="px-4 py-2 bg-ever-blue text-white rounded-md hover:bg-ever-blue-dark">{isJapanese ? '保存' : 'Save'}</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EditTaskModal;