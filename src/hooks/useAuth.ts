import { useSessionContext } from '../contexts/SessionContext';

export const useAuth = () => {
  const { currentUser, loading } = useSessionContext();
  return { user: currentUser, loading };
};
