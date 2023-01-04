import * as React from 'react';
import { useAuth } from '@/shared/services/auth';
import { useRouter } from 'next/router';
import { GetServerSideProps, InferGetServerSidePropsType } from 'next';

export const getServerSideProps: GetServerSideProps = async (context) => {
  return {
    props: {},
  };
};

const AuthCallbackPage: React.FC<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = () => {
  const { ok } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (ok) {
      router.push('/devportal/api-directory');
    } else {
      router.push('/login');
    }
  }, [ok]);

  return <></>;
};

export default AuthCallbackPage;
