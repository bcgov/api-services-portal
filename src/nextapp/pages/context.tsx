import { createContext, useContext } from 'react';

const AppContext = createContext({router: null, user: null});

export function AppWrapper({ children, router, user }) {
  let sharedState = { router: router, user: user }

  return (
    <AppContext.Provider value={sharedState}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  return useContext(AppContext);
}

const Empty = () => ( <></> )
export default Empty
