import * as React from 'react';

import type { UserData } from '../../../types';
import { useSession } from './use-session';

const authContext = React.createContext<UserData>(null);

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const { user } = useSession();
  return <authContext.Provider value={user}>{children}</authContext.Provider>;
};

export const useAuth = (): UserData => React.useContext(authContext);
