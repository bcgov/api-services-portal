import { useQuery, QueryStatus } from 'react-query';

import type { UserData } from '../../../types';

export const getSession = async (): Promise<UserData> => {
  try {
    const req = await fetch('/admin/session');

    if (req.ok) {
      const json = await req.json();
      return json;
    } else {
      throw new Error('Auth Error');
    }
  } catch (err) {
    throw new Error(err);
  }
};

interface UserSessionResult {
  ok: boolean;
  user: UserData;
  status: QueryStatus;
  error?: Error;
}

export const useSession = (): UserSessionResult => {
  const { data, status, error } = useQuery<UserData, Error>(
    'user',
    getSession,
    {
      retry: false,
    }
  );

  return {
    ok: !!data,
    user: data,
    status,
    error,
  };
};
