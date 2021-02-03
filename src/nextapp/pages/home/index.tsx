import * as React from 'react';
import Head from 'next/head';

const Homepage: React.FC = () => {
  return (
    <>
      <Head>
        <title>API Services Portal</title>
      </Head>
      <div>
        <main style={{ marginTop: 100 }}>
          <h1>BC Government API Program Service</h1>
          <p>
            Discover and access APIs from various ministries and programs across
            government.
          </p>
        </main>
      </div>
    </>
  );
};

export default Homepage;
