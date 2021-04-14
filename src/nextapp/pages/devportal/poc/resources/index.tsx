import * as React from 'react';
import {
    Alert,
    AlertIcon,
    AlertDescription,
    Box,
    Button,
    Checkbox,
    Container,
    Divider,
    Link,
    FormControl,
    FormLabel,
    Heading,
    Input,
    Stack,
    VStack,
    Skeleton,
  } from '@chakra-ui/react';
import Head from 'next/head';
import PageHeader from '@/components/page-header';
import ModelIcon from '@/components/model-icon/model-icon';

const { useEffect, useState } = React;

import { GET_ACCESS_LIST, GET_PERMISSIONS, GET_RESOURCES, GRANT_ACCESS, REVOKE_ACCESS } from './queries'

import { styles } from '@/shared/styles/devportal.css';

import ResourcesList from './resource-list'

import graphql from '@/shared/services/graphql'

import { useAuth } from '@/shared/services/auth';

const ResourcesPage = () => {
    const { user } = useAuth();

    const [{ state, data }, setState] = useState({ state: 'loading', data: null });
    const fetch = () => {
        graphql(GET_ACCESS_LIST, {})
        .then(({ data }) => {
            setState({ state: 'loaded', data });
        })
        .catch((err) => {
            setState({ state: 'error', data: null });
        });
    };
    

    useEffect(fetch, [user]);

    const actions = [
        // (                <Button variant="primary">Add Resource</Button>
        // )
    ]
    const availableScopes = ["a", "b", "c"]
    const form = React.useRef<HTMLFormElement>();
    const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      //createApplication();
    };


    return (
        <>
        <Head>
          <title>API Program Services | Resources</title>
        </Head>
        <Container maxW="6xl">
  
          <PageHeader
            breadcrumb={[
            ]}
            title={
                <Box as="span" display="flex" alignItems="center">
                <ModelIcon model="resources" size="sm" mr={2} />
                    API Resources
                </Box>
            }
            actions={actions}
          >
          </PageHeader>


            {data?.allServiceAccesses.filter(item => item.productEnvironment.credentialIssuer != null).map(item => (
                <Box bgColor="white" mb={4}>
                    <Box
                        p={4}
                        display="flex"
                        alignItems="center"
                        justifyContent="space-between"
                    >
                        <Heading size="md">{item.productEnvironment.product.name} - {item.productEnvironment.name}</Heading>
                    </Box>
                    <Box p={0}>
                        <ResourcesList credIssuerId={item.productEnvironment.credentialIssuer.id} resourceType={item.productEnvironment.credentialIssuer.resourceType}/>
                    </Box>
                </Box>
            ))}

        </Container>
        </>
    )
}

export default ResourcesPage;

