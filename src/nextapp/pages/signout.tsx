import * as React from 'react';
import {
  Box,
  Button,
  Container,
  Grid,
  GridItem,
  Heading,
  Text,
} from '@chakra-ui/react';
import Head from 'next/head';
import NextLink from 'next/link';

const LoginPage: React.FC = () => {
  return (
    <>
      <Head>
        <title>API Program Services | Login</title>
      </Head>
      <Container maxW="6xl">
        <Box as="header" mt={12} mb={6}>
          <Heading>Logged out </Heading>
        </Box>
        <Grid as="section" mb={7} templateColumns="1fr 1fr" gap={6}>
          <GridItem>
            <Text>You have succesfully logged out.</Text>
          </GridItem>
        </Grid>
        <NextLink passHref href="/login">
          <Button as="a">Log Back In</Button>
        </NextLink>
      </Container>
    </>
  );
};

export default LoginPage;
