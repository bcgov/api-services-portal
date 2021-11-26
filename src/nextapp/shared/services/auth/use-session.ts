import { useQuery, QueryStatus } from 'react-query';
import { apiHost } from '@/shared/config';
import type { UserData } from '@/types/app.types';

export interface AuthFailedResponse {
  error: boolean;
}

export interface UserSessionResult {
  ok: boolean;
  maintenance: boolean;
  user?: UserData;
  status: QueryStatus;
  error?: Error;
}

export const getSession = async (
  headers: HeadersInit = { Accept: 'application/json' }
): Promise<UserData> => {
  try {
    const req = await fetch(`${apiHost}/admin/session`, {
      headers: headers,
    });
    if (req.ok) {
      const json = await req.json();
      return json.user;
    }
    if (req.status == 401 || req.status == 403) {
      throw new Error(req.statusText);
    }

    return undefined;
  } catch (err) {
    throw new Error(err);
  }
};

export const getSessionL = async (): Promise<UserData> => {
  try {
    const req = await fetch(`${apiHost}/admin/session`, {
      headers: { 'Content-Type': 'application/json' },
    });
    if (req.ok) {
      const json = await req.json();
      if (json.anonymous) {
        throw new Error('Anonymous');
      }
      return json.user;
    }
    if (req.status == 401 || req.status == 403) {
      throw new Error(req.statusText);
    }

    return undefined;
  } catch (err) {
    throw new Error(err);
  }
};

export const useSession = (): UserSessionResult => {
  const { data, status, error } = useQuery<UserData, Error>(
    'user',
    getSessionL,
    {
      retry: false,
      refetchOnWindowFocus: true,
    }
  );

  return {
    ok: !data,
    user: data,
    maintenance: true,
    status,
    error,
  };
};
