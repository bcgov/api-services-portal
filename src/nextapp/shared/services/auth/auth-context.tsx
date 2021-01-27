import * as React from 'react';

import { useSession, UserSessionResult } from './use-session';

const authContext = React.createContext<UserSessionResult>(null);

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const session = useSession();

  return (
    <authContext.Provider value={session}>{children}</authContext.Provider>
  );
};

export const useAuth = (): UserSessionResult => React.useContext(authContext);
