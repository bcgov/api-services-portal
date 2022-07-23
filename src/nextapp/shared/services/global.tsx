import * as React from 'react';
import { useRestApi } from './api';

type GlobalContent = {
  readonly version: string;
  readonly revision: string;
  readonly cluster: string;
  readonly accountLinks: Record<string, string>;
  readonly helpLinks: Record<string, string>;
  readonly identities: {
    developer: string[];
    provider: string[];
  };
};

const defaultState = {
  version: '',
  revision: '',
  cluster: '',
  identities: {
    developer: ['idir'],
    provider: ['idir'],
  },
  accountLinks: {},
  helpLinks: {},
};
const GlobalContext = React.createContext<GlobalContent>(null);

export const useGlobal = (): GlobalContent => React.useContext(GlobalContext);

interface GlobalProps {
  children: React.ReactNode;
}

const Global: React.FC<GlobalProps> = ({ children }) => {
  const { data } = useRestApi<GlobalContent>('globalContent', '/about', {
    suspense: false,
  });

  return (
    <GlobalContext.Provider value={data ?? defaultState}>
      {children}
    </GlobalContext.Provider>
  );
};

export default Global;
