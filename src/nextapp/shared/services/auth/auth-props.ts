import { getSession } from './use-session';
import type { NextPageContext } from 'next';

type InnerProps = (context: NextPageContext, props: unknown) => void;

export const authPageProps = (inner: InnerProps | undefined) => {
  return async (context: NextPageContext): Promise<unknown> => {
    try {
      const user = await getSession();

      if (!user) {
        context.res.writeHead(307, { Location: '/' });
        context.res.end();
        return { props: {} };
      }

      const props = {
        props: {
          user,
        },
      };

      if (inner) {
        return inner(context, props);
      }

      return props;
    } catch (err) {
      throw new Error(err);
    }
  };
};
