import * as React from 'react';
import {
  Alert,
  AlertIcon,
  Button,
  Box,
  Container,
  FormLabel,
  FormControl,
  Input,
  Icon,
  VStack,
  Text,
  Flex,
  ButtonGroup,
  Link,
  Textarea,
  Checkbox,
  HStack,
  Heading,
  Avatar,
  Select,
  StackDivider,
  useToast,
  Center,
  useDisclosure,
  Tooltip,
} from '@chakra-ui/react';
import Head from 'next/head';
import isEmpty from 'lodash/isEmpty';
import NextLink from 'next/link';
import PageHeader from '@/components/page-header';
import { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import { gql } from 'graphql-request';
import { QueryClient, useQueryClient } from 'react-query';
import { Application, Environment, Query } from '@/shared/types/query.types';
import api, { useApi } from '@/shared/services/api';
import graphql from '@/shared/services/graphql';
import { dehydrate } from 'react-query/hydration';
import { FieldsetBox, RadioGroup } from '@/components/forms';
import { FaBook } from 'react-icons/fa';
import { useRouter } from 'next/router';
import isNotBlank from '@/shared/isNotBlank';
import {
  FaChevronDown,
  FaEdit,
  FaNetworkWired,
  FaPlusCircle,
} from 'react-icons/fa';
import NewApplicationDialog from '@/components/new-application/new-application-dialog';

const queryKey = 'newAccessRequest';

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { id } = context.params;
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery(
    queryKey,
    async () =>
      await api<Query>(
        query,
        { id },
        {
          headers: context.req.headers as HeadersInit,
        }
      )
  );

  return {
    props: {
      id,
      dehydratedState: dehydrate(queryClient),
    },
  };
};

const NewRequestsPage: React.FC<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ id }) => {
  const router = useRouter();
  const client = useQueryClient();
  const toast = useToast();
  const { data } = useApi(
    queryKey,
    {
      query,
      variables: {
        id,
      },
    },
    { suspense: false }
  );
  const [environment, setEnvironment] = React.useState<string>('');
  const dataset = data?.allDiscoverableProducts[0];
  const requestor = data?.allTemporaryIdentities[0];
  const hasSelectedEnvironment = Boolean(environment);
  const selectedEnvironment: Environment = dataset.environments.find(
    (e) => e.id === environment
  );
  const clientAuthenticator =
    selectedEnvironment?.credentialIssuer?.clientAuthenticator;

  const apiTitle = data.allDiscoverableProducts.reduce((memo: string, d) => {
    if (isEmpty(memo) && d.id !== id) {
      return 'API';
    }
    return d.name;
  }, '');
  const hasNotAgreedLegal = React.useMemo(() => {
    const legalsAgreed = !isEmpty(data?.mySelf?.legalsAgreed)
      ? JSON.parse(data.mySelf.legalsAgreed)
      : [];

    if (selectedEnvironment?.legal) {
      const { reference } = selectedEnvironment?.legal;

      if (!isEmpty(reference)) {
        const legalAgreements = legalsAgreed.filter(
          (ag: { reference: string }) => ag.reference === reference
        );

        return legalAgreements.length === 0;
      }
    }

    return true;
  }, [data.mySelf, selectedEnvironment]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    if (!form.checkValidity()) {
      return;
    }

    try {
      const payload = {
        name: `${dataset.name} FOR ${
          data.allTemporaryIdentities[0].name
            ? data.allTemporaryIdentities[0].name
            : data.allTemporaryIdentities[0].username
        }`,
        controls: JSON.stringify({
          clientGenCertificate: clientAuthenticator === 'client-jwt',
          jwksUrl:
            clientAuthenticator === 'client-jwt-jwks-url'
              ? formData.get('jwksUrl')
              : '',
        }),
        requestor: data.allTemporaryIdentities[0].userId,
        applicationId: formData.get('applicationId'),
        productEnvironmentId: formData.get('environmentId'),
        additionalDetails: formData.get('additionalDetails'),
        acceptLegal: formData.has('acceptLegal') ? true : false,
      };
      const result = await graphql(mutation, payload);
      client.invalidateQueries('allAccessRequests');
      toast({
        title: 'Request submitted',
        status: 'success',
      });
      router?.push(
        `/devportal/requests/new/tokens?requestId=${result.data.createAccessRequest.id}`
      );
    } catch (err) {
      toast({
        title: 'Unable to make request',
        description: err.message,
        status: 'error',
      });
    }
  };
  const handleCancel = () => router?.back();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedApplication, setSelectedApplication] = React.useState('');

  const handleAfterCreate = (app: Application) => {
    setSelectedApplication(app.id);
  };

  return (
    <>
      <Head>
        <title>API Program Services | API Discovery</title>
      </Head>
      <Container maxW="6xl">
        {data.allApplications?.length === 0 && (
          <Alert status="warning">
            <AlertIcon />
            {'To get started, you must '}
            <NextLink passHref href="/devportal/poc/applications">
              <Link colorScheme="blue" size="sm">
                Register an Application
              </Link>
            </NextLink>
            {' first.'}
          </Alert>
        )}
        <PageHeader title="New Access Request" />
        <NewApplicationDialog
          open={isOpen}
          onClose={onClose}
          userId={requestor.userId}
          refreshQueryKey={queryKey}
          handleAfterCreate={handleAfterCreate}
        />
        <form onSubmit={handleSubmit}>
          <FieldsetBox title={apiTitle}>
            <HStack spacing={4}>
              <Box flex={1}>
                <Select
                  name="applicationId"
                  isRequired={true}
                  value={selectedApplication}
                  onChange={(e) => {
                    setSelectedApplication(e.target.value);
                  }}
                  data-testid="access-rqst-app-select"
                >
                  <option value="">No Application Selected</option>
                  {data.myApplications.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name}
                    </option>
                  ))}
                </Select>
              </Box>
              <Tooltip
                label="Create New Application"
                fontSize="md"
                placement="top"
                hasArrow
              >
                <Box mx={4}>
                  <Icon as={FaPlusCircle} boxSize={6} onClick={onOpen} />
                </Box>
              </Tooltip>
              <Box mx={4} w={100}>
                <Center>as</Center>
              </Box>
              <Box flex={1}>
                <Flex>
                  <Avatar name={requestor.name} />
                  <Box ml={2}>
                    <Text fontWeight="bold">
                      {requestor.name}{' '}
                      <Text as="span" fontWeight="normal" color="gray.400">
                        {requestor.username}
                      </Text>
                    </Text>
                    <Text fontSize="xs">{requestor.email}</Text>
                  </Box>
                </Flex>
              </Box>
            </HStack>
          </FieldsetBox>
          <FieldsetBox
            isRequired
            title={`Which ${dataset?.name} API Environment?`}
          >
            <RadioGroup
              name="environmentId"
              onChange={setEnvironment}
              options={dataset?.environments
                .filter((e) => e.active)
                .filter((e) => e.flow !== 'public')
                .map((e) => ({
                  value: e.id,
                  icon: FaBook,
                  label: (
                    <Box>
                      <Text
                        fontWeight="bold"
                        data-testid={'access-rqst-app-env-' + e.name}
                      >
                        {e.name}
                      </Text>
                      <Text fontSize="sm" color="gray.400">
                        {e.flow}
                      </Text>
                    </Box>
                  ),
                }))}
              value={environment}
            />
            {clientAuthenticator === 'client-jwt-jwks-url' && (
              <Box pt={4}>
                <FormControl>
                  <FormLabel>
                    JWKS URL of Public Key for Signed JWT Authentication
                  </FormLabel>
                  <Input
                    placeholder="https://"
                    name="jwksUrl"
                    variant="bc-input"
                    defaultValue=""
                  />
                </FormControl>
              </Box>
            )}
          </FieldsetBox>

          <FieldsetBox
            isRequired={
              hasSelectedEnvironment &&
              isNotBlank(selectedEnvironment?.additionalDetailsToRequest)
            }
            title="Additional Information & Terms"
          >
            {isNotBlank(selectedEnvironment?.additionalDetailsToRequest) && (
              <Box pb={4}>
                <Text>
                  <Text as="strong">From the API Provider</Text>:{' '}
                  {selectedEnvironment.additionalDetailsToRequest}
                </Text>
              </Box>
            )}
            <Textarea
              name="additionalDetails"
              placeholder="Add any addtional notes for the API Provider"
              variant="bc-input"
              data-testid="access-rqst-add-notes-text"
            />
            {selectedEnvironment?.legal && hasNotAgreedLegal && (
              <Flex
                justify="space-between"
                mt={4}
                p={4}
                bgColor="blue.50"
                borderRadius={4}
              >
                <Checkbox
                  colorScheme="blue"
                  name="acceptLegal"
                  data-testid="access-rqst-legal-terms-cb"
                >
                  {selectedEnvironment.legal.title}
                </Checkbox>
                <Link
                  fontWeight="bold"
                  href={selectedEnvironment.legal.link}
                  colorScheme="blue"
                  target="_blank"
                  rel="noreferrer"
                >
                  View Legal
                </Link>
              </Flex>
            )}
          </FieldsetBox>
          <Box mt={4} bgColor="white">
            <Flex justify="flex-end" p={4}>
              <ButtonGroup>
                <Button
                  variant="secondary"
                  onClick={handleCancel}
                  data-testid="access-rqst-cancel-btn"
                >
                  Cancel
                </Button>
                <Button type="submit" data-testid="access-rqst-submit-btn">
                  Submit
                </Button>
              </ButtonGroup>
            </Flex>
          </Box>
        </form>
      </Container>
    </>
  );
};

export default NewRequestsPage;

const query = gql`
  query Get($id: ID!) {
    allDiscoverableProducts(where: { id: $id }) {
      id
      name
      environments {
        id
        name
        active
        flow
        additionalDetailsToRequest
        legal {
          title
          description
          link
          reference
        }
        credentialIssuer {
          clientAuthenticator
        }
      }
    }
    myApplications {
      id
      appId
      name
      owner {
        name
      }
    }
    mySelf {
      legalsAgreed
    }
    allTemporaryIdentities {
      id
      userId
      name
      username
      email
    }
  }
`;

const mutation = gql`
  mutation AddAccessRequest(
    $name: String!
    $controls: String
    $requestor: ID!
    $applicationId: ID!
    $productEnvironmentId: ID!
    $additionalDetails: String
    $acceptLegal: Boolean!
  ) {
    acceptLegal(
      productEnvironmentId: $productEnvironmentId
      acceptLegal: $acceptLegal
    ) {
      legalsAgreed
    }

    createAccessRequest(
      data: {
        name: $name
        controls: $controls
        additionalDetails: $additionalDetails
        requestor: { connect: { id: $requestor } }
        application: { connect: { id: $applicationId } }
        productEnvironment: { connect: { id: $productEnvironmentId } }
      }
    ) {
      id
    }
  }
`;
