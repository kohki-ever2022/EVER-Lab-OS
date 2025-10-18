// src/hooks/useProjectActions.ts
import { useCallback, useMemo } from 'react';
import { useDataAdapter } from '../contexts/DataAdapterContext';
import { useProjectContext } from '../contexts/ProjectContext';
import { useAudit } from './useAudit';
import { sanitizeObject } from '../utils/sanitization';
import { Result } from '../types';
import { Project, LabNotebookEntry, Task } from '../types';

export const useProjectActions = () => {
    const adapter = useDataAdapter();
    const { labNotebookEntries, tasks } = useProjectContext();
    const { addAuditLog } = useAudit();

    const addProject = useCallback(async (project: Omit<Project, 'id'>): Promise<Result<Project, Error>> => {
        const sanitizedProject = sanitizeObject(project);
        const result = await adapter.createProject(sanitizedProject);
        if(result.success){
            addAuditLog('PROJECT_CREATE', `Created project '${result.data.name}'`);
        }
        return result;
    }, [adapter, addAuditLog]);

    const updateProject = useCallback(async (project: Project): Promise<Result<Project, Error>> => {
        const sanitizedProject = sanitizeObject(project);
        const result = await adapter.updateProject(sanitizedProject);
        if(result.success){
            addAuditLog('PROJECT_UPDATE', `Updated project '${project.name}'`);
        }
        return result;
    }, [adapter, addAuditLog]);

    const addLabNotebookEntry = useCallback(async (entry: Omit<LabNotebookEntry, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<Result<LabNotebookEntry, Error>> => {
        const { content, ...restOfEntry } = entry;
        const newEntryData: Omit<LabNotebookEntry, 'id'> = {
            ...sanitizeObject(restOfEntry),
            content,
            userId: 'current-user-id', // This should be replaced with actual user ID
            createdAt: new Date(), // This will be replaced by serverTimestamp in FirebaseAdapter
            updatedAt: new Date(),
        };
        const result = await adapter.createLabNotebookEntry(newEntryData);
        if (result.success) {
            addAuditLog('ELN_ENTRY_CREATE', `Created ELN entry '${result.data.title}'`);
        }
        return result;
    }, [adapter, addAuditLog]);

    const updateLabNotebookEntry = useCallback(async (entry: LabNotebookEntry): Promise<Result<LabNotebookEntry, Error>> => {
        const { content, ...restOfEntry } = entry;
        const updatedEntry = { 
            ...sanitizeObject(restOfEntry), 
            content, 
            updatedAt: new Date() 
        };
        const result = await adapter.updateLabNotebookEntry(updatedEntry as LabNotebookEntry);
        if (result.success) {
            addAuditLog('ELN_ENTRY_UPDATE', `Updated ELN entry '${entry.title}'`);
        }
        return result;
    }, [adapter, addAuditLog]);

    const deleteLabNotebookEntry = useCallback(async (entryId: string): Promise<Result<void, Error>> => {
        const entryToDelete = labNotebookEntries.find(e => e.id === entryId);
        const result = await adapter.deleteLabNotebookEntry(entryId);
        if (result.success && entryToDelete) {
            addAuditLog('ELN_ENTRY_DELETE', `Deleted ELN entry '${entryToDelete.title}'`);
        }
        return result;
    }, [adapter, labNotebookEntries, addAuditLog]);

    const addTask = useCallback(async (task: Omit<Task, 'id' | 'createdByUserId' | 'createdAt' | 'updatedAt'>): Promise<Result<Task, Error>> => {
        const newTaskData: Omit<Task, 'id'> = {
            ...task,
            createdByUserId: 'current-user-id', // This should be replaced with actual user ID
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        const result = await adapter.createTask(sanitizeObject(newTaskData));
        if (result.success) {
            addAuditLog('TASK_CREATE', `Created task '${result.data.title}'`);
        }
        return result;
    }, [adapter, addAuditLog]);

    const updateTask = useCallback(async (task: Task): Promise<Result<Task, Error>> => {
        const updatedTask = { ...task, updatedAt: new Date() };
        const result = await adapter.updateTask(sanitizeObject(updatedTask));
        if (result.success) {
            addAuditLog('TASK_UPDATE', `Updated task '${task.title}'`);
        }
        return result;
    }, [adapter, addAuditLog]);

    const deleteTask = useCallback(async (taskId: string): Promise<Result<void, Error>> => {
        const taskToDelete = tasks.find(t => t.id === taskId);
        const result = await adapter.deleteTask(taskId);
        if (result.success && taskToDelete) {
            addAuditLog('TASK_DELETE', `Deleted task '${taskToDelete.title}'`);
        }
        return result;
    }, [adapter, tasks, addAuditLog]);


    return useMemo(() => ({
        addProject,
        updateProject,
        addLabNotebookEntry,
        updateLabNotebookEntry,
        deleteLabNotebookEntry,
        addTask,
        updateTask,
        deleteTask,
    }), [addProject, updateProject, addLabNotebookEntry, updateLabNotebookEntry, deleteLabNotebookEntry, addTask, updateTask, deleteTask]);
};