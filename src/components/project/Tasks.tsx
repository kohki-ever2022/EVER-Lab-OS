import React, { useMemo } from 'react';
import { useSessionContext } from '../../contexts/SessionContext';
import { useProjectContext } from '../../contexts/ProjectContext';
import { useUserContext } from '../../contexts/UserContext';
import { useModalContext } from '../../contexts/ModalContext';
// FIX: import from barrel file
import { Task, TaskStatus, TaskPriority, User } from '../../types';
import { PriorityUrgentIcon, PriorityHighIcon, PriorityMediumIcon, PriorityLowIcon } from '../common/Icons';

const PriorityIcon: React.FC<{ priority: TaskPriority }> = ({ priority }) => {
    const iconMap = {
        [TaskPriority.Urgent]: <PriorityUrgentIcon className="w-4 h-4 text-red-500" />,
        [TaskPriority.High]: <PriorityHighIcon className="w-4 h-4 text-orange-500" />,
        [TaskPriority.Medium]: <PriorityMediumIcon className="w-4 h-4 text-yellow-500" />,
        [TaskPriority.Low]: <PriorityLowIcon className="w-4 h-4 text-blue-500" />,
    };
    return iconMap[priority];
};

const TaskCard: React.FC<{ task: Task, users: User[] }> = ({ task, users }) => {
    const { openModal } = useModalContext();
    const assignees = users.filter(u => task.assigneeIds.includes(u.id));

    return (
        <div
            onClick={() => openModal({ type: 'editTask', props: { task } })}
            className="bg-white p-3 rounded-md shadow-sm border hover:shadow-md cursor-pointer"
        >
            <p className="font-semibold text-sm mb-2">{task.title}</p>
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <PriorityIcon priority={task.priority} />
                    {task.dueDate && (
                        <span className="text-xs text-gray-500">{new Date(task.dueDate).toLocaleDateString()}</span>
                    )}
                </div>
                <div className="flex -space-x-2">
                    {assignees.map(a => (
                        <div key={a.id} title={a.name} className="relative inline-block">
                             {a.imageUrl ? (
                                <img className="h-6 w-6 rounded-full ring-2 ring-white" src={a.imageUrl} alt={a.name} />
                            ) : (
                                <div className="h-6 w-6 rounded-full ring-2 ring-white bg-ever-purple-light flex items-center justify-center text-ever-purple-dark font-bold text-xs">
                                    {a.name.charAt(0)}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const Tasks: React.FC = () => {
    const { isJapanese, currentUser } = useSessionContext();
    const { tasks } = useProjectContext();
    const { users } = useUserContext();
    const { openModal } = useModalContext();

    const myTasks = useMemo(() => {
        if (!currentUser) return [];
        return tasks.filter(t => t.assigneeIds.includes(currentUser.id) || t.createdByUserId === currentUser.id);
    }, [tasks, currentUser]);

    const columns: { status: TaskStatus, titleJP: string, titleEN: string }[] = [
        { status: TaskStatus.ToDo, titleJP: '未着手', titleEN: 'To Do' },
        { status: TaskStatus.InProgress, titleJP: '進行中', titleEN: 'In Progress' },
        { status: TaskStatus.InReview, titleJP: 'レビュー中', titleEN: 'In Review' },
        { status: TaskStatus.Done, titleJP: '完了', titleEN: 'Done' },
    ];

    const tasksByStatus = useMemo(() => {
        const grouped: Record<TaskStatus, Task[]> = {
            [TaskStatus.ToDo]: [],
            [TaskStatus.InProgress]: [],
            [TaskStatus.InReview]: [],
            [TaskStatus.Done]: [],
        };
        myTasks.forEach(task => {
            grouped[task.status].push(task);
        });
        return grouped;
    }, [myTasks]);

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-ever-black">
                    {isJapanese ? 'タスク管理' : 'Task Management'}
                </h2>
                <button
                    onClick={() => openModal({ type: 'editTask', props: { task: null } })}
                    className="bg-ever-blue hover:bg-ever-blue-dark text-white font-bold py-2 px-4 rounded-lg"
                >
                    {isJapanese ? '新規タスク' : 'New Task'}
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {columns.map(col => (
                    <div key={col.status} className="bg-gray-100 rounded-lg p-3">
                        <h3 className="font-semibold mb-3 px-1">{isJapanese ? col.titleJP : col.titleEN} ({tasksByStatus[col.status].length})</h3>
                        <div className="space-y-3 h-[calc(100vh-20rem)] overflow-y-auto pr-1">
                            {tasksByStatus[col.status].map(task => (
                                <TaskCard key={task.id} task={task} users={users} />
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Tasks;