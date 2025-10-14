// src/contexts/ProjectContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import { Project, Task, LabNotebookEntry, Protocol } from '../types';
import { useDataAdapter } from './DataAdapterContext';

interface ProjectContextValue {
  projects: Project[];
  tasks: Task[];
  labNotebookEntries: LabNotebookEntry[];
  setLabNotebookEntries: React.Dispatch<React.SetStateAction<LabNotebookEntry[]>>;
  protocols: Protocol[];
  loading: boolean;
}

const ProjectContext = createContext<ProjectContextValue | null>(null);

export const ProjectProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const adapter = useDataAdapter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  // @ts-ignore
  const [labNotebookEntries, setLabNotebookEntries] = useState<LabNotebookEntry[]>([]);
  // @ts-ignore
  const [protocols, setProtocols] = useState<Protocol[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const unsubProjects = adapter.subscribeToProjects(setProjects);
    const unsubTasks = adapter.subscribeToTasks(setTasks);
    // TODO: The adapter should be updated to provide subscriptions for labNotebookEntries and protocols.
    // For now, this will allow the app to run without crashing.
    
    // A simple loading indicator; assumes data arrives reasonably quickly.
    const timer = setTimeout(() => {
      if (loading) setLoading(false);
    }, 2000);

    return () => {
      unsubProjects();
      unsubTasks();
      clearTimeout(timer);
    };
  }, [adapter, loading]);

  useEffect(() => {
      if(projects.length > 0 && tasks.length > 0 && loading) {
          setLoading(false);
      }
  }, [projects, tasks, loading]);

  const value = useMemo(() => ({ projects, tasks, loading, labNotebookEntries, setLabNotebookEntries, protocols }), [projects, tasks, loading, labNotebookEntries, protocols]);

  return <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>;
};

export const useProjectContext = () => {
  const context = useContext(ProjectContext);
  if (!context) throw new Error('useProjectContext must be used within ProjectProvider');
  return context;
};