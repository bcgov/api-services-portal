import * as React from 'react';
import {
  Alert,
  AlertTitle,
  AlertDescription,
  AlertIcon,
  Box,
  Button,
  Container,
  Heading,
  Divider,
  Text,
  Center,
  Icon,
} from '@chakra-ui/react';
import gfm from 'remark-gfm';
import { gql } from 'graphql-request';
import Head from 'next/head';
import PageHeader from '@/components/page-header';
import ReactMarkdownWithHtml from 'react-markdown/with-html';
import { useApi, useApiMutation } from '@/shared/services/api';
import { useRouter } from 'next/router';
import ViewSecret from '@/components/view-secret';
import { Mutation } from '@/shared/types/query.types';
import { FaExclamationTriangle } from 'react-icons/fa';

const ApiAccessPage: React.FC = () => {
  const router = useRouter();
  const id = router?.query.requestId;
  const [credentials, setCredentials] = React.useState<Record<string, string>>(
    {}
  );
  const credentialGenerator = useApiMutation(mutation);
  const access = useApi(
    'accessSuccess',
    { query },
    {
      suspense: false,
      enabled: Boolean(router?.query.requestId),
    }
  );
  const instruction = access.data?.allAccessRequests.find((r) => r.id === id)
    ?.productEnvironment?.credentialIssuer?.instruction;

  const generateCredentials = React.useCallback(async () => {
    const res: Mutation = await credentialGenerator.mutateAsync({ id });
    if (res.updateAccessRequest.credential !== 'NEW') {
      setCredentials(JSON.parse(res.updateAccessRequest.credential));
    }
  }, [credentialGenerator, id, setCredentials]);
  const onSecretClose = () => {
    router?.push('/devportal/access');
  };

  return (
    <>
      <Head>
        <title>API Program Services | API Access</title>
      </Head>
      <Container maxW="6xl">
        <PageHeader title="Access Requested">
          <Alert status="info" p={4}>
            <AlertIcon />
            <AlertTitle>Your new credentials:</AlertTitle>
            <AlertDescription>
              Take note of these credentials, you will only see them once.
            </AlertDescription>
          </Alert>
        </PageHeader>
        <Box my={5} bgColor="white">
          <Box
            p={4}
            display="flex"
            alignItems="center"
            justifyContent="space-between"
          >
            <Heading size="md">Your Credentials</Heading>
          </Box>
          <Divider />
          <Box p={4}>
            <Box mb={4}>
              <Heading size="sm" mb={2}>
                Instructions
              </Heading>
              {instruction && (
                <Box className="markdown-body">
                  <ReactMarkdownWithHtml allowDangerousHtml plugins={[gfm]}>
                    {instruction}
                  </ReactMarkdownWithHtml>
                </Box>
              )}
              {!instruction && <Text>No instructions provided</Text>}
            </Box>
          </Box>
          <Divider />
          <Box p={4}>
            <Box mb={4}>
              <Heading size="sm">Secrets</Heading>
            </Box>
            <Text mb={4}>
              Clicking "View Secrets" will generate your credentials one time.
              Take care not to generate secrets before you are ready.
            </Text>
            {!credentialGenerator.isSuccess && (
              <Center w="100%" py={4}>
                <Button
                  isLoading={credentialGenerator.isLoading}
                  onClick={generateCredentials}
                  variant="primary"
                >
                  View Secrets
                </Button>
              </Center>
            )}
          </Box>
          {credentialGenerator.isError && (
            <Center py={4}>
              <Box textAlign="center">
                <Icon
                  as={FaExclamationTriangle}
                  boxSize={8}
                  color="red.400"
                  mb={2}
                />
                <Heading size="sm">Secret Generation Failed</Heading>
              </Box>
            </Center>
          )}
          {credentialGenerator.isSuccess && (
            <ViewSecret credentials={credentials} />
          )}
        </Box>
      </Container>
    </>
  );
};

export default ApiAccessPage;

const query = gql`
  query GET {
    allTemporaryIdentities {
      id
      userId
    }
    allAccessRequests(where: { isComplete: null }) {
      productEnvironment {
        credentialIssuer {
          instruction
        }
      }
    }
  }
`;
const mutation = gql`
  mutation GenCredential($id: ID!) {
    updateAccessRequest(id: $id, data: { credential: "NEW" }) {
      credential
    }
  }
`;
