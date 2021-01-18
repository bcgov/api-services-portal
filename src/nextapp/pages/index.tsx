import * as React from 'react';
import { Box, Heading } from '@chakra-ui/react';
import Head from 'next/head';

import Card from '../components/card';
import GridLayout from '../layouts/grid';

const HomePage = ({ pages }) => {
  return (
    <>
      <Head>
        <title>API Program Services | Documentation</title>
      </Head>
      <GridLayout>
        {[1, 2, 3, 4, 5, 6, 7].map((d) => (
          <Card key={d}>
            <Heading size="md" mb={2}>
              API Provider
            </Heading>
            <p>
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Ad nulla
              error doloribus ducimus magni iste aut ea quidem impedit, non
              suscipit sapiente praesentium dolorum ratione nobis quibusdam
              delectus. Nihil, unde?
            </p>
          </Card>
        ))}
      </GridLayout>
    </>
  );
};

export default HomePage;
