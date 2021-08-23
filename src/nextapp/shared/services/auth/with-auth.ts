import { getSession } from './use-session';
import links from '@/shared/data/links';
import { UserData } from 'types';
import fetch from 'isomorphic-unfetch';
import type { GetServerSideProps, GetServerSidePropsContext } from 'next';

import { apiHost } from '../../config';

/**
 * Authentication function for pages
 *
 * To use, set this helper as the getServerSideProps
 *
 * e.g.
 * ```javascript
 * import { withAuth } from 'shared/services/auth'
 * ...
 * export const getServerSideProps = withAuth((req, res) => ({ props: { user: req.user } }));
 * ```
 */
export function withAuth(handler: GetServerSideProps) {
  return async (context: GetServerSidePropsContext) => {
    let isAuthenticated = false;

    try {
      const res = await fetch(`${apiHost}/oauth2/auth`, {
        headers: context.req.headers as any,
      });

      if (res.ok) {
        isAuthenticated = true;
      }
    } catch (err) {
      console.error('[AUTH]', err);
    }

    if (!isAuthenticated) {
      return {
        props: {
          authenticated: false,
        },
      };
    }

    return handler(context);
  };
}
