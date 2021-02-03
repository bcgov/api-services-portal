import { getSession } from './use-session';
import links from '@/shared/data/links';
import { UserData } from 'types';
import type { GetServerSidePropsContext } from 'next';

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
interface ReturnServerSideContext extends GetServerSidePropsContext {
  user?: UserData;
}

export function withAuth(handler) {
  return async (
    context: GetServerSidePropsContext
  ): Promise<ReturnServerSideContext> => {
    const nextContext: ReturnServerSideContext = { ...context };
    const user = await getSession();
    const [section] = /\/?(poc\/)([a-zA-Z-_]*)/.exec(context.req.url);
    const currentRoute = links.find((link) => section === link.url);

    if (
      user &&
      currentRoute &&
      currentRoute.access.some((role) => user.roles.includes(role))
    ) {
      nextContext.user = user;
    }

    return handler(nextContext);
  };
}
