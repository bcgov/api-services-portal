import * as React from 'react';
import { Container, Heading } from '@chakra-ui/react';
import Head from 'next/head';

import Card from '../components/card';
import GridLayout from '../layouts/grid';
import PageHeader from '../components/page-header';

const HomePage: React.FC = () => {
  return (
    <>
      <Head>
        <title>API Program Services | Documentation</title>
      </Head>
      <Container maxW="6xl">
        <PageHeader title="APS Gateway Services">
          <p>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Dolores
            laborum neque esse praesentium aliquid harum ducimus magnam
            explicabo sapiente! Blanditiis aliquam fugit molestias quia
            adipisci. Illo minima pariatur deleniti saepe?
          </p>
        </PageHeader>
        <GridLayout>
          {[1, 2, 3, 4, 5, 6, 7].map((d) => (
            <Card key={d}>
              <Heading size="md" mb={2}>
                API Provider
              </Heading>
              <p>
                Lorem ipsum dolor sit amet consectetur adipisicing elit. Ad
                nulla error doloribus ducimus magni iste aut ea quidem impedit,
                non suscipit sapiente praesentium dolorum ratione nobis
                quibusdam delectus. Nihil, unde?
              </p>
            </Card>
          ))}
        </GridLayout>
      </Container>
    </>
  );
};

export default HomePage;
