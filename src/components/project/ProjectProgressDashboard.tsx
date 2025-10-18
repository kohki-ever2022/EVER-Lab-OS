// src/components/dashboard/ProjectProgressDashboard.tsx
import React, { useMemo } from 'react';
import { useUsages } from '../../contexts/UsageContext';
import { useProjectContext } from '../../contexts/ProjectContext';
import { useSessionContext } from '../../contexts/SessionContext';
import {
  Project,
  Task,
  TaskStatus,
  Milestone,
  MilestoneStatus,
} from '../../types';
import { Usage } from '../../types';
import { useTranslation } from '../../hooks/useTranslation';

const ProjectProgressDashboard: React.FC = () => {
  const usage = useUsages();
  const { projects, tasks } = useProjectContext();
  const { t } = useTranslation();

  const projectStats = useMemo(() => {
    return projects.map((project) => {
      const projectTasks = tasks.filter((t) => t.projectId === project.id);
      const completedTasks = projectTasks.filter(
        (t) => t.status === TaskStatus.Done
      );
      const progressPercent =
        projectTasks.length > 0
          ? Math.round((completedTasks.length / projectTasks.length) * 100)
          : 0;

      const overdueTasks = projectTasks.filter(
        (t) =>
          t.dueDate &&
          new Date(t.dueDate) < new Date() &&
          t.status !== TaskStatus.Done
      );

      // Aggregate equipment usage time correctly linked by projectId
      const totalUsageHours = usage
        .filter((u) => u.projectId === project.id)
        .reduce((sum, u) => sum + u.durationMinutes / 60, 0);

      return {
        ...project,
        progressPercent,
        totalTasks: projectTasks.length,
        completedTasks: completedTasks.length,
        overdueTasks: overdueTasks.length,
        totalUsageHours: Math.round(totalUsageHours * 10) / 10,
      };
    });
  }, [projects, tasks, usage]);

  return (
    <div className='p-6'>
      <h2 className='text-2xl font-bold mb-6'>
        {t('projectProgressDashboard')}
      </h2>

      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
        {projectStats.map((project) => (
          <div
            key={project.id}
            className='bg-white rounded-lg shadow p-6 flex flex-col'
          >
            <h3 className='text-xl font-bold mb-2 text-ever-purple'>
              {project.name}
            </h3>
            <p className='text-sm text-gray-600 mb-4 flex-grow'>
              {project.description}
            </p>

            {/* Progress Bar */}
            <div className='mb-4'>
              <div className='flex justify-between text-sm mb-1'>
                <span>{t('progress')}</span>
                <span className='font-bold'>{project.progressPercent}%</span>
              </div>
              <div className='w-full bg-gray-200 rounded-full h-3'>
                <div
                  className='bg-ever-blue h-3 rounded-full transition-all'
                  style={{ width: `${project.progressPercent}%` }}
                />
              </div>
            </div>

            {/* Task Stats */}
            <div className='grid grid-cols-3 gap-2 mb-4 text-center'>
              <div className='bg-gray-50 p-2 rounded'>
                <div className='text-xs text-gray-600'>{t('totalTasks')}</div>
                <div className='text-lg font-bold'>{project.totalTasks}</div>
              </div>
              <div className='bg-green-50 p-2 rounded'>
                <div className='text-xs text-green-600'>
                  {t('taskStatusDone')}
                </div>
                <div className='text-lg font-bold text-green-700'>
                  {project.completedTasks}
                </div>
              </div>
              <div className='bg-red-50 p-2 rounded'>
                <div className='text-xs text-red-600'>
                  {t('projectTaskOverdue')}
                </div>
                <div className='text-lg font-bold text-red-700'>
                  {project.overdueTasks}
                </div>
              </div>
            </div>

            {/* Milestones */}
            {project.milestones.length > 0 && (
              <div className='mb-4'>
                <div className='text-sm font-medium mb-2'>
                  {t('milestones')}
                </div>
                <div className='flex gap-2 flex-wrap'>
                  {project.milestones.map((m) => {
                    const isOverdue =
                      m.status === MilestoneStatus.Pending &&
                      new Date(m.dueDate) < new Date();
                    const milestoneClass =
                      m.status === MilestoneStatus.Completed
                        ? 'bg-green-100 text-green-800'
                        : m.status === MilestoneStatus.InProgress
                          ? 'bg-yellow-100 text-yellow-800'
                          : isOverdue
                            ? 'bg-red-100 text-red-800'
                            : 'bg-gray-100 text-gray-800';

                    return (
                      <div
                        key={m.id}
                        className={`px-2 py-1 rounded-full text-xs font-medium ${milestoneClass}`}
                        title={`${m.name} (${new Date(m.dueDate).toLocaleDateString()})`}
                      >
                        {m.name}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Equipment Usage */}
            <div className='text-sm text-gray-600 mt-auto pt-4 border-t'>
              {t('totalEquipmentUsage')}:
              <span className='font-bold ml-2'>{project.totalUsageHours}h</span>
            </div>
          </div>
        ))}
        {projectStats.length === 0 && (
          <p className='text-gray-500 col-span-full text-center py-8'>
            {t('noProjectsToDisplay')}
          </p>
        )}
      </div>
    </div>
  );
};

export default ProjectProgressDashboard;
