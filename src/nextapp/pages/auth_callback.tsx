import * as React from 'react';
import { useAuth } from '@/shared/services/auth';
import { useRouter } from 'next/router';
import { GetServerSideProps, InferGetServerSidePropsType } from 'next';

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { identity } = context.query;

  return {
    props: {
      identity: identity || null,
    },
  };
};

const AuthCallbackPage: React.FC<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ identity }) => {
  const { ok } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (ok) {
      if (identity === 'provider') {
        router.push('/manager/gateways');
      } else {
        router.push('/devportal/api-directory');
      }        
    } else {
      router.push('/login');
    }
  }, [ok]);

  return <></>;
};

export default AuthCallbackPage;
