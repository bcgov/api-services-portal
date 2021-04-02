import * as React from 'react';
import {
  Alert,
  AlertIcon,
  Button,
  Box,
  Container,
  Stack,
  VStack,
  Skeleton,
} from '@chakra-ui/react';
import EmptyPane from '@/components/empty-pane';
import Head from 'next/head';
import PageHeader from '@/components/page-header';

const ApiAccessPage: React.FC = () => {
  return (
    <>
      <Head>
        <title>API Program Services | API Access</title>
      </Head>
      <Container maxW="6xl">
        <Stack spacing={10} my={4}>
          <Alert status="info">
            <AlertIcon />
            List of the BC Government Service APIs that you have access to.
          </Alert>
        </Stack>

        <PageHeader title="API Access"></PageHeader>

        <Box mt={5}>hi</Box>
      </Container>
    </>
  );
};

export default ApiAccessPage;
