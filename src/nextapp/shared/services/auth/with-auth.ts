import { getSession } from './use-session';
import type { GetServerSideProps } from 'next';

import links from '../../data/links';

/**
 * Authentication function for pages
 *
 * To use, set this helper as the getServerSideProps
 *
 * e.g.
 * ```javascript
 * import { withAuth } from 'shared/services/auth'
 * ...
 * export const getServerSideProps = withAuth;
 * ```
 * TODO: Make into a HOC
 */
export const withAuth: GetServerSideProps = async (context) => {
  const redirect = (): void => {
    context.res.writeHead(307, { Location: '/' });
    context.res.end();
  };

  try {
    const user = await getSession();
    const [section] = /\/?(poc\/)([a-zA-Z-_]*)/.exec(context.req.url);
    const currentRoute = links.find((link) => section === link.url);

    if (
      currentRoute &&
      currentRoute.access.some((role) => user.roles.includes(role))
    ) {
      return {
        props: {
          user,
        },
      };
    } else {
      redirect();
    }
  } catch (err) {
    redirect();

    return {
      props: {
        err: err.message,
      },
    };
  }
};
