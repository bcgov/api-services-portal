import { createContext, useContext } from 'react';

const AppContext = createContext();

export function AppWrapper({ children, router }) {
  let sharedState = { router: router }

  return (
    <AppContext.Provider value={sharedState}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  return useContext(AppContext);
}

export default () => ( <></> )