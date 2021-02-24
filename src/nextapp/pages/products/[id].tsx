import * as React from 'react';
import api from '@/shared/services/api';
import {
  Box,
  Container,
  Heading,
  Select,
  Badge,
  Text,
  Switch,
} from '@chakra-ui/react';
// import ClientRequest from '@/components/client-request';
import PageHeader from '@/components/page-header';
import ServicesManager from '@/components/services-manager';
import {
  GET_ENVIRONMENT,
  GET_ENVIRONMENT_LIST,
  UPDATE_ENVIRONMENT,
} from '@/shared/queries/products-queries';
import { Mutation, Query } from '@/types/query.types';
import { GetStaticPaths, GetStaticProps, InferGetStaticPropsType } from 'next';
import { useAuth } from '@/shared/services/auth';
import { useMutation, useQueryClient } from 'react-query';

export const getStaticPaths: GetStaticPaths = async () => {
  const data = await api<Query>(GET_ENVIRONMENT_LIST);
  const paths =
    data.allEnvironments?.map((d) => ({ params: { id: d.id } })) || [];

  return {
    paths,
    fallback: false,
  };
};

export const getStaticProps: GetStaticProps = async (context) => {
  const data = await api<Query>(GET_ENVIRONMENT, { id: context.params.id });

  return {
    props: {
      data: data.Environment,
    },
  };
};

const EnvironmentPage: React.FC<
  InferGetStaticPropsType<typeof getStaticProps>
> = ({ data }) => {
  const { user } = useAuth();
  const client = useQueryClient();
  const mutation = useMutation(
    async (changes: unknown) => await api(UPDATE_ENVIRONMENT, changes)
  );
  const statusBoxColorScheme = data.active ? 'green' : 'orange';
  const statusText = data.active ? 'Running' : 'Idle';
  const breadcrumb = [
    { href: '/products', text: 'Products' },
    { text: `${data.product.organization.name} Product Environment` },
  ];
  const onToggleActive = async (event: React.ChangeEvent<HTMLInputElement>) => {
    await mutation.mutateAsync({
      id: data.id,
      data: { active: event.target.checked },
    });
    client.invalidateQueries('environment');
  };

  return (
    <Container maxW="6xl">
      <PageHeader
        breadcrumb={breadcrumb}
        title={
          <>
            Edit Environment{' '}
            <Badge ml={1} fontSize="1rem" colorScheme="blue" variant="solid">
              {data.name}
            </Badge>
          </>
        }
      >
        <>
          <Text>
            Lorem ipsum dolor sit, amet consectetur adipisicing elit. Alias sunt
            facere aliquam harum dolorem error soluta, iusto ad vel nesciunt
            sequi et excepturi ex modi dignissimos, iste reprehenderit. Commodi,
            minus!
          </Text>
          <Box
            bgColor="white"
            mt={8}
            p={4}
            display="flex"
            border="2px solid"
            borderColor={data.active ? 'green.500' : 'orange.500'}
            borderRadius={4}
            overflow="hidden"
          >
            <Box display="flex">
              <Switch
                isChecked={data.active}
                value="active"
                onChange={onToggleActive}
              />
            </Box>
            <Box flex={1} ml={5} display="flex" flexDirection="column">
              <Heading
                size="sm"
                mb={2}
                color="inherit"
                display="flex"
                alignItems="center"
              >
                {data.product.organization.name}{' '}
                <Badge
                  px={2}
                  mx={1}
                  colorScheme="blue"
                  variant="solid"
                  fontSize="inherit"
                >
                  {data.name}
                </Badge>{' '}
                Environment is{' '}
                <Badge
                  colorScheme={statusBoxColorScheme}
                  px={2}
                  mx={1}
                  variant="solid"
                  fontSize="inherit"
                >
                  {statusText}
                </Badge>
              </Heading>
              <Box mr={8}>
                <Text mb={4}>
                  Lorem ipsum dolor sit amet consectetur adipisicing elit. Eius
                  a facere velit ullam ea! Minima, nemo voluptatibus, expedita,
                  libero quae itaque eos qui sapiente commodi repudiandae
                  provident laboriosam odio voluptates.
                </Text>
                <Box>
                  <Box display="flex" alignItems="center">
                    <Text fontWeight="bold" mr={4}>
                      Authentication
                    </Text>
                    <Select
                      size="sm"
                      variant="filled"
                      width="auto"
                      value={data.authMethod}
                    >
                      <option value="public">Public</option>
                      <option value="keys">API Keys</option>
                      <option value="private">Private</option>
                      <option value="jwt">JWT</option>
                    </Select>
                  </Box>
                </Box>
              </Box>
            </Box>
          </Box>
        </>
      </PageHeader>
      <Box my={5}>
        {user?.namespace && (
          <ServicesManager data={data.services} namespace={user.namespace} />
        )}
      </Box>
    </Container>
  );
};

export default EnvironmentPage;
