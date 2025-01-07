import { useQuery, QueryStatus } from 'react-query';
import { apiHost } from '@/shared/config';
import type { UserData } from '@/types/app.types';

export interface AuthFailedResponse {
  error: boolean;
}

export interface UserSessionResult {
  isLoading: boolean;
  isFetching: boolean;
  ok: boolean;
  maintenance: boolean;
  user?: UserData;
  status: QueryStatus;
  error?: Error;
}

export interface SessionData {
  user?: UserData;
  maintenance?: boolean;
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

export const getSessionL = async (): Promise<SessionData> => {
  try {
    const req = await fetch(`${apiHost}/admin/session`, {
      headers: { 'Content-Type': 'application/json' },
    });
    if (req.ok) {
      const json = await req.json();
      if (json.anonymous) {
        return { maintenance: json.maintenance };
      }
      return { user: json.user, maintenance: json.maintenance };
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
  const { data, status, error, isLoading, isFetching } = useQuery<SessionData, Error>(
    'user',
    getSessionL,
    {
      retry: false,
      refetchOnWindowFocus: true,
    }
  );

  return {
    isLoading,
    isFetching,
    ok: Boolean(data?.user),
    user: data?.user,
    maintenance: data?.maintenance,
    status,
    error,
  };
};
