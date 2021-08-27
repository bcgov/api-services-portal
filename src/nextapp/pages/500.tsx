import * as React from 'react';
import {
  Box,
  Center,
  Container,
  Flex,
  Heading,
  Icon,
  Link,
  Text,
} from '@chakra-ui/react';
import { FaExclamationCircle } from 'react-icons/fa';
import Head from 'next/head';
import NextLink from 'next/link';

const AppError: React.FC = () => {
  return (
    <>
      <Head>
        <title>API Program Services | 500 | An error has occurred</title>
      </Head>
      <Container maxW="6xl">
        <Center minH={200}>
          <Flex flexDir="column" textAlign="center" bgColor="white" p={4}>
            <Flex align="center" color="red.500" mb={4}>
              <Icon as={FaExclamationCircle} mr={2} />
              <Heading size="md">An error has occurred</Heading>
            </Flex>
            <Text>
              Don&apos;t worry, the gateway is still running. Try refreshing the
              page or return{' '}
              <NextLink passHref href="/">
                <Link>Home</Link>
              </NextLink>
            </Text>
          </Flex>
        </Center>
      </Container>
    </>
  );
};

export default AppError;
