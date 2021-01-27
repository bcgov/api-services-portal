import { useQuery, QueryStatus } from 'react-query';

import type { UserData } from '../../../types';

export interface UserSessionResult {
  ok: boolean;
  user: UserData;
  status: QueryStatus;
  error?: Error;
}

export const getSession = async (): Promise<UserData> => {
  try {
    const req = await fetch('http://localhost:4000/admin/session');

    if (req.ok) {
      const json = await req.json();
      return json.user;
    } else {
      throw new Error('Auth Error');
    }
  } catch (err) {
    throw new Error(err);
  }
};

export const useSession = (): UserSessionResult => {
  const { data, status, error } = useQuery<UserData, Error>(
    'user',
    getSession,
    {
      retry: false,
      refetchOnWindowFocus: true,
    }
  );

  return {
    ok: !!data,
    user: data,
    status,
    error,
  };
};
