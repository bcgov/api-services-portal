import * as React from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';

const HomePage: React.FC = () => {
  const router = useRouter();
  router.push('/manager/gateways');

  return (
    <>
      <Head>
        <title>API Program Services | Home</title>
      </Head>
    </>
  );
};

export default HomePage;
