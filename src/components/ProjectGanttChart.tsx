// src/components/ProjectGanttChart.tsx
import React, { useState, useMemo } from 'react';
import { useProjectContext } from '../contexts/ProjectContext';
import { useSessionContext } from '../contexts/SessionContext';
import { Project, Task, TaskStatus, Milestone, MilestoneStatus } from '../types/research';

const dayInMillis = 1000 * 60 * 60 * 24;

const getDaysDiff = (date1: Date, date2: Date) => {
    return Math.floor((date1.getTime() - date2.getTime()) / dayInMillis);
}

interface TooltipData {
    task: Task;
    x: number;
    y: number;
}

export const ProjectGanttChart: React.FC = () => {
    const { projects, tasks } = useProjectContext();
    const { isJapanese } = useSessionContext();
    const [selectedProjectId, setSelectedProjectId] = useState<string | null>(projects[0]?.id || null);
    const [tooltip, setTooltip] = useState<TooltipData | null>(null);

    const { chartTasks, chartStartDate, totalDays, milestones } = useMemo(() => {
        if (!selectedProjectId) {
            return { chartTasks: [], chartStartDate: new Date(), totalDays: 0, milestones: [] };
        }

        const project = projects.find(p => p.id === selectedProjectId);
        const projectTasks = tasks.filter(t => t.projectId === selectedProjectId);

        if (projectTasks.length === 0) {
            return { chartTasks: projectTasks, chartStartDate: new Date(), totalDays: 30, milestones: project?.milestones || [] };
        }

        const dates = projectTasks.flatMap(t => [new Date(t.startDate).getTime(), t.dueDate ? new Date(t.dueDate).getTime() : new Date(t.startDate).getTime()]);
        const start = new Date(Math.min(...dates));
        start.setDate(start.getDate() - 2); // Add some padding
        const end = new Date(Math.max(...dates));
        end.setDate(end.getDate() + 2); // Add some padding

        return {
            chartTasks: projectTasks,
            chartStartDate: start,
            totalDays: getDaysDiff(end, start) + 1,
            milestones: project?.milestones || []
        };
    }, [selectedProjectId, projects, tasks]);

    const todayIndex = getDaysDiff(new Date(), chartStartDate);

    const handleMouseOver = (e: React.MouseEvent, task: Task) => {
        setTooltip({ task, x: e.clientX, y: e.clientY });
    };

    const statusColors: Record<TaskStatus, { bg: string, border: string }> = {
        [TaskStatus.ToDo]: { bg: 'bg-gray-300', border: 'border-gray-400' },
        [TaskStatus.InProgress]: { bg: 'bg-blue-400', border: 'border-blue-600' },
        [TaskStatus.InReview]: { bg: 'bg-yellow-400', border: 'border-yellow-600' },
        [TaskStatus.Done]: { bg: 'bg-green-400', border: 'border-green-600' },
    };

    const renderGrid = () => {
        const months: { name: string, year: number, days: number }[] = [];
        const date = new Date(chartStartDate);

        for (let i = 0; i < totalDays; i++) {
            const month = date.toLocaleString(isJapanese ? 'ja-JP' : 'en-US', { month: 'short' });
            const year = date.getFullYear();

            if (i === 0 || date.getDate() === 1) {
                months.push({ name: month, year, days: 0 });
            }
            months[months.length - 1].days++;
            date.setDate(date.getDate() + 1);
        }

        return (
            <div className="relative" style={{ gridTemplateColumns: `180px repeat(${totalDays}, minmax(30px, 1fr))` }}>
                {/* Headers */}
                <div className="sticky left-0 top-0 z-20 bg-gray-100 border-b border-r border-gray-300 p-2 font-semibold text-sm">
                    {isJapanese ? 'タスク' : 'Task'}
                </div>
                {months.map((m) => (
                    <div key={`${m.name}-${m.year}`} className="bg-gray-50 border-b border-r border-gray-300 text-center p-1 text-xs" style={{ gridColumn: `span ${m.days}` }}>
                        {m.name} {m.year}
                    </div>
                ))}

                {/* Day numbers */}
                <div className="sticky left-0 top-10 z-20 bg-gray-100 border-r border-gray-300"></div>
                {Array.from({ length: totalDays }).map((_, i) => (
                    <div key={i} className="text-center text-xs p-1 border-b border-r border-gray-200">
                        {new Date(chartStartDate.getTime() + i * dayInMillis).getDate()}
                    </div>
                ))}

                {/* Task Rows */}
                {chartTasks.map((task, index) => {
                    const duration = task.dueDate ? getDaysDiff(new Date(task.dueDate), new Date(task.startDate)) + 1 : 1;
                    const startOffset = getDaysDiff(new Date(task.startDate), chartStartDate);

                    return (
                        <React.Fragment key={task.id}>
                            <div className="sticky left-0 z-10 bg-white border-b border-r border-gray-300 p-2 text-sm truncate" title={task.title}>
                                {task.title}
                            </div>
                            <div className="col-span-full border-b border-gray-200 relative" style={{ gridRow: index + 3 }}>
                                <div
                                    className={`absolute h-6 top-1/2 -translate-y-1/2 rounded ${statusColors[task.status].bg} border ${statusColors[task.status].border}`}
                                    style={{
                                        gridColumnStart: startOffset + 2,
                                        gridColumnEnd: startOffset + 2 + duration,
                                        left: `calc(${(100 / totalDays) * startOffset}%)`,
                                        width: `calc(${(100 / totalDays) * duration}%)`,
                                    }}
                                    onMouseMove={(e) => handleMouseOver(e, task)}
                                    onMouseLeave={() => setTooltip(null)}
                                ></div>
                            </div>
                        </React.Fragment>
                    );
                })}
                
                 {/* Today Line */}
                {todayIndex >= 0 && todayIndex < totalDays &&
                    <div className="absolute top-0 bottom-0 border-r-2 border-red-500 z-10" style={{ left: `calc(180px + ${(100 / totalDays) * todayIndex}%)` }}>
                         <div className="absolute -top-4 -translate-x-1/2 bg-red-500 text-white text-xs px-1 rounded">Today</div>
                    </div>
                }

                {/* Milestones */}
                {milestones.map(m => {
                    const milestoneIndex = getDaysDiff(new Date(m.dueDate), chartStartDate);
                    if (milestoneIndex < 0 || milestoneIndex >= totalDays) return null;
                    return (
                        <div key={m.id} className="absolute top-0 bottom-0 border-r border-dashed border-purple-500 z-10" style={{ left: `calc(180px + ${(100 / totalDays) * milestoneIndex}%)` }} title={m.name}>
                             <div className="absolute -top-4 -translate-x-1/2 text-purple-600 text-xs">◆</div>
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">{isJapanese ? 'プロジェクトガントチャート' : 'Project Gantt Chart'}</h2>

            <div className="mb-4">
                <label className="text-sm font-medium mr-2">{isJapanese ? 'プロジェクト選択:' : 'Select Project:'}</label>
                <select value={selectedProjectId || ''} onChange={(e) => setSelectedProjectId(e.target.value)} className="border rounded-md p-2">
                    {projects.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                </select>
            </div>
            
            <div className="bg-white rounded-lg shadow-md overflow-x-auto">
                <div className="grid" style={{ minWidth: '800px' }}>
                    {renderGrid()}
                </div>
            </div>

            {tooltip && (
                <div className="fixed bg-gray-800 text-white p-2 rounded-md text-sm shadow-lg z-30 pointer-events-none" style={{ top: tooltip.y + 15, left: tooltip.x + 15 }}>
                    <p className="font-bold">{tooltip.task.title}</p>
                    <p>{new Date(tooltip.task.startDate).toLocaleDateString()} - {tooltip.task.dueDate ? new Date(tooltip.task.dueDate).toLocaleDateString() : 'N/A'}</p>
                    <p>Status: {tooltip.task.status}</p>
                </div>
            )}
        </div>
    );
};
