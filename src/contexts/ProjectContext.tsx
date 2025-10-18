// src/contexts/ProjectContext.tsx
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useRef,
} from 'react';
import { Project, Task, LabNotebookEntry, Protocol } from '../types';
import { useDataAdapter } from './DataAdapterContext';

const ProjectsDataContext = createContext<Project[]>([]);
const TasksDataContext = createContext<Task[]>([]);
const LabNotebookEntriesDataContext = createContext<LabNotebookEntry[]>([]);
const ProtocolsDataContext = createContext<Protocol[]>([]);
const ProjectLoadingContext = createContext<boolean>(true);

export const ProjectProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const adapter = useDataAdapter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [labNotebookEntries, setLabNotebookEntries] = useState<
    LabNotebookEntry[]
  >([]);
  const [protocols, setProtocols] = useState<Protocol[]>([]); // Keep for compatibility
  const [loading, setLoading] = useState(true);

  const loadedFlags = useRef({ projects: false, tasks: false, entries: false });

  useEffect(() => {
    setLoading(true);

    const checkAllLoaded = () => {
      if (
        loadedFlags.current.projects &&
        loadedFlags.current.tasks &&
        loadedFlags.current.entries
      ) {
        setLoading(false);
      }
    };

    const unsubProjects = adapter.subscribeToProjects((data) => {
      setProjects(data);
      if (!loadedFlags.current.projects) {
        loadedFlags.current.projects = true;
        checkAllLoaded();
      }
    });
    const unsubTasks = adapter.subscribeToTasks((data) => {
      setTasks(data);
      if (!loadedFlags.current.tasks) {
        loadedFlags.current.tasks = true;
        checkAllLoaded();
      }
    });
    const unsubEntries = adapter.subscribeToLabNotebookEntries((data) => {
      setLabNotebookEntries(data);
      if (!loadedFlags.current.entries) {
        loadedFlags.current.entries = true;
        checkAllLoaded();
      }
    });

    return () => {
      unsubProjects();
      unsubTasks();
      unsubEntries();
    };
  }, [adapter]);

  return (
    <ProjectsDataContext.Provider value={projects}>
      <TasksDataContext.Provider value={tasks}>
        <LabNotebookEntriesDataContext.Provider value={labNotebookEntries}>
          <ProtocolsDataContext.Provider value={protocols}>
            <ProjectLoadingContext.Provider value={loading}>
              {children}
            </ProjectLoadingContext.Provider>
          </ProtocolsDataContext.Provider>
        </LabNotebookEntriesDataContext.Provider>
      </TasksDataContext.Provider>
    </ProjectsDataContext.Provider>
  );
};

export const useProjectContext = () => {
  const projects = useContext(ProjectsDataContext);
  const tasks = useContext(TasksDataContext);
  const labNotebookEntries = useContext(LabNotebookEntriesDataContext);
  const protocols = useContext(ProtocolsDataContext);
  const loading = useContext(ProjectLoadingContext);
  if (
    projects === undefined ||
    tasks === undefined ||
    labNotebookEntries === undefined ||
    protocols === undefined ||
    loading === undefined
  ) {
    throw new Error('useProjectContext must be used within ProjectProvider');
  }
  return { projects, tasks, labNotebookEntries, protocols, loading };
};
