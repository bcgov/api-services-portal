import * as React from 'react';
import {
  Alert,
  AlertIcon,
  Badge,
  Box,
  Button,
  Container,
  Divider,
  Heading,
  Icon,
  Skeleton,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
} from '@chakra-ui/react';
import Head from 'next/head';
import PageHeader from '@/components/page-header';

import { useRouter } from 'next/router';

const { useEffect, useState } = React;

import { UPDATE_ISSUER, GET_ISSUER } from './../queries';

import NextLink from 'next/link';

import { styles } from '@/shared/styles/devportal.css';

import graphql from '@/shared/services/graphql';
import toArray from '@/shared/services/toarray';

import NameValue from '@/components/name-value';
import YamlViewer from '@/components/yaml-viewer';

import { ButtonGroup, Input, Textarea, Flex, useToast } from '@chakra-ui/react';

import { useAppContext } from '@/pages/context';

import AuthorizationSection from './authorization';

import breadcrumbs from '@/components/ns-breadcrumb'

const UpdateIssuer = () => {
  const context = useAppContext();
  const [{ state, data }, setState] = useState({
    state: 'loading',
    data: null,
  });
  const fetch = () => {
    const {
      router: {
        pathname,
        query: { id },
      },
    } = context;
    if (context['router'] != null && id) {
      graphql(GET_ISSUER, { id: id })
        .then(({ data }) => {
          toArray(data.allCredentialIssuers[0], [
            'availableScopes',
            'clientRoles',
          ]);
          setState({ state: 'loaded', data });
        })
        .catch((err) => {
          setState({ state: 'error', data: null });
        });
    }
  };
  useEffect(fetch, [context]);

  const issuer = data ? data.allCredentialIssuers[0] : null;

  const products =
    issuer == null
      ? null
      : [...new Set(issuer.environments.map((g) => g.product.name))];

  const breadcrumb = breadcrumbs([
    { href: '/manager/poc/credential-issuers', text: 'Authorization Profiles' },
  ]);

  const refetch = () => {
    window.location.href = '/manager/poc/credential-issuers';
  };

  const toast = useToast();
  const errorToast = (message) => {
    toast({
      title: 'Failed to update issuer',
      description: message,
      status: 'error',
      duration: 9000,
      isClosable: true,
    });
  };

  const fulfill = () => {
    graphql(UPDATE_ISSUER, { id: issuer.id })
      .then(refetch)
      .catch((err) => {
        errorToast(JSON.stringify(err.message));
      });
  };

  var pluginYaml = `
services:
- name: my-service
  plugins:
  - name: acl
    config:
      allow: [ P08.D08 ]
  - name: key-auth
    config:
      key_names: [ X-API-KEY ]
      run_on_preflight: true
      hide_credentials: true
      key_in_body: false
    `;
  if (issuer != null && issuer.flow == 'client-credentials') {
    pluginYaml = `
services:
- name: my-service
  plugins:
  - name: jwt-keycloak
    tags: [ ns.<NS> ]
    config:
      client_roles: null
      allowed_iss:
      - https://dev.oidc.gov.bc.ca/auth/realms/xtmke7ky
      run_on_preflight: true
      iss_key_grace_period: 10
      maximum_expiration: 0
      claims_to_verify:
      - exp
      consumer_match_claim_custom_id: true
      cookie_names: []
      scope: null
      uri_param_names:
      - jwt
      roles: null
      consumer_match: true
      well_known_template: ${issuer.oidcDiscoveryUrl}
      consumer_match_ignore_not_found: false
      anonymous: null
      algorithm: RS256
      realm_roles: null
      consumer_match_claim: azp
    `;
  }
  return (
    <>
      <Head>
        <title>API Program Services | Authorization Settings</title>
      </Head>
      <Container maxW="6xl">
        <PageHeader
          actions={false}
          breadcrumb={breadcrumb}
          title={<Box as="span">{issuer?.name}</Box>}
        />

        {issuer != null && (
          <>
            <Box bgColor="white" mb={4}>
              <Box
                p={4}
                display="flex"
                alignItems="center"
                justifyContent="space-between"
              >
                <Heading size="md">Authentication</Heading>
              </Box>
              <Divider />
              <Box p={4}>
                <Box
                  as="dl"
                  display="grid"
                  fontSize="sm"
                  flexWrap="wrap"
                  gridColumnGap={4}
                  gridRowGap={2}
                  gridTemplateColumns="1fr 2fr 3fr"
                >
                  <Text as="dt" fontWeight="bold">
                    Flow
                  </Text>
                  <Text as="dd">{issuer.flow}</Text>
                  <Alert status="info">
                    <AlertIcon />
                    <Box>
                      <b>client-credentials</b> implements the OAuth2 Client
                      Credential Flow
                      <br />
                      <b>authorization-code</b> implements the OAuth2
                      Authorization Code Flow
                      <br />
                      <b>kong-api-key-acl</b> implements Kong's API Key and ACL
                      flow
                    </Box>
                  </Alert>
                  <Text as="dt" fontWeight="bold">
                    Mode
                  </Text>
                  <Text as="dd">{issuer.mode}</Text>
                  {true && (
                    <Alert status="info">
                      <AlertIcon />
                      <Box>
                        <b>Manual</b> issuing of the credential means that this
                        owner ({issuer.owner.name}) will complete setup of the
                        new credential with the particular OIDC Provider, and
                        communicate that to the requestor via email or other
                        means.
                        <br />
                        <b>Automatic</b> issuing of the credential means that
                        this owner ({issuer.owner.name}) has configured
                        appropriate credentials here to allow the API Manager to
                        manage Clients on the particular OIDC Provider.
                      </Box>
                    </Alert>
                  )}
                </Box>
                {issuer.flow == 'client-credentials' && (
                  <Box
                    as="dl"
                    display="grid"
                    fontSize="sm"
                    flexWrap="wrap"
                    gridColumnGap={4}
                    gridRowGap={2}
                    gridTemplateColumns="1fr 2fr 3fr"
                  >
                    <Text as="dt" fontWeight="bold">
                      Identity Provider (idP)
                    </Text>
                    <Text as="dd">keycloak</Text>
                    <Box></Box>
                    <Text as="dt" fontWeight="bold">
                      Discovery URL
                    </Text>
                    <Text as="dd">{issuer.oidcDiscoveryUrl}</Text>
                    <Box></Box>
                  </Box>
                )}
                {issuer.flow == 'kong-api-key-acl' && (
                  <Box
                    as="dl"
                    display="grid"
                    fontSize="sm"
                    flexWrap="wrap"
                    gridColumnGap={4}
                    gridRowGap={2}
                    gridTemplateColumns="1fr 2fr 3fr"
                  >
                    <Text as="dt" fontWeight="bold">
                      Key Name
                    </Text>
                    <Text as="dd">{issuer.apiKeyName}</Text>
                    <Box></Box>
                  </Box>
                )}
              </Box>
            </Box>

            {issuer.flow == 'client-credentials' && (
              <AuthorizationSection fetch={fetch} issuer={issuer} />
            )}

            {issuer.flow == 'kong-api-key-acl' && (
              <Box bgColor="white" mb={4}>
                <Box
                  p={4}
                  display="flex"
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <Heading size="md">Kong API Key with ACL Flow</Heading>
                </Box>
                <Divider />
                <Box p={4}>
                  <Alert status="info">
                    <AlertIcon />
                    <Box>
                      The Kong API Key issuing is automated, no further
                      configuration required.
                    </Box>
                  </Alert>
                </Box>
              </Box>
            )}
            {issuer.flow == 'client-credentials' && (
              <Box bgColor="white" mb={4}>
                <Box
                  p={4}
                  display="flex"
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <Heading size="md">Client Registration</Heading>
                  <Button size="xs" variant="secondary">
                    Edit
                  </Button>
                </Box>
                <Divider />
                <Box p={4}>
                  <Box
                    as="dl"
                    display="grid"
                    fontSize="sm"
                    flexWrap="wrap"
                    gridColumnGap={4}
                    gridRowGap={2}
                    gridTemplateColumns="1fr 2fr 3fr"
                  >
                    <Text as="dt" fontWeight="bold">
                      Client Registration
                    </Text>
                    <Text as="dd">{issuer.clientRegistration}</Text>
                    <Alert status="info">
                      <AlertIcon />
                      <Box>
                        <b>Anonymous</b> registration allows the API Manager to
                        create a client on the OIDC Provider without requiring
                        any authentication.
                        <br />
                        <b>Initial Access Token</b> is created on the OIDC
                        Provider and has the authorization to create clients.
                        <br />
                        <b>Managed</b> is where the Credential Issuer Owner has
                        provided sufficient access for the API Manager to create
                        new clients on the OIDC Provider.
                      </Box>
                    </Alert>
                    {issuer.clientRegistration == 'iat' &&
                      issuer.mode == 'auto' && (
                        <>
                          <Text as="dt" fontWeight="bold">
                            Initial Access Token
                          </Text>
                          <Text as="dd">**********</Text>
                          <Box></Box>
                        </>
                      )}
                    {issuer.clientRegistration == 'managed' &&
                      issuer.mode == 'auto' && (
                        <>
                          <Text as="dt" fontWeight="bold">
                            Client ID
                          </Text>
                          <Text as="dd">{issuer.clientId}</Text>
                          <Box></Box>
                          <Text as="dt" fontWeight="bold">
                            Client Secret
                          </Text>
                          <Text as="dd">**********</Text>
                          <Box></Box>
                        </>
                      )}
                  </Box>
                </Box>
              </Box>
            )}

            {issuer.flow == 'authorization-code' && (
              <Box bgColor="white" mb={4}>
                <Box
                  p={4}
                  display="flex"
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <Heading size="md">OAuth2 Authorization Code Flow</Heading>
                </Box>
                <Divider />
                <Box p={4}>
                  <Box
                    as="dl"
                    display="grid"
                    fontSize="sm"
                    flexWrap="wrap"
                    gridColumnGap={4}
                    gridRowGap={2}
                    gridTemplateColumns="1fr 2fr 3fr"
                  >
                    <Text as="dt" fontWeight="bold">
                      Client ID
                    </Text>
                    <Text as="dd">{issuer.clientID}</Text>
                    <Box></Box>
                  </Box>
                </Box>
              </Box>
            )}

            <Box bgColor="white" mb={4}>
              <Box
                p={4}
                display="flex"
                alignItems="center"
                justifyContent="space-between"
              >
                <Heading size="md">Gateway Plugin Setup</Heading>
              </Box>
              <Divider />
              <Box p={4}>
                <Box
                  as="dl"
                  display="grid"
                  fontSize="sm"
                  flexWrap="wrap"
                  gridColumnGap={4}
                  gridRowGap={2}
                >
                  <YamlViewer doc={pluginYaml} />
                </Box>
              </Box>
            </Box>

            <Box
              display="grid"
              gridGap={4}
              gridTemplateColumns="repeat(12, 1fr)"
            >
              <Box bgColor="white" gridColumn="span 8">
                <Box
                  p={4}
                  display="flex"
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <Heading size="md">Protected Services</Heading>
                </Box>
                <Divider />
                <Table variant="simple">
                  <Thead>
                    <Tr>
                      <Th>Product</Th>
                      <Th>Environments</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {products.map((prod: string) => (
                      <Tr key={prod}>
                        <Td>{prod}</Td>
                        <Td>
                          {issuer.environments
                            .filter((t) => t.product.name == prod)
                            .map((t) => (
                              <Badge key={t.name}>{t.name}</Badge>
                            ))}
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </Box>
              <Box bgColor="white" gridColumn="span 4">
                <Box
                  p={4}
                  display="flex"
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <Heading size="md">Resource Owner</Heading>
                </Box>
                <Divider />
                <Box p={4}>
                  <Box
                    as="dl"
                    display="grid"
                    fontSize="sm"
                    flexWrap="wrap"
                    gridColumnGap={4}
                    gridRowGap={2}
                    gridTemplateColumns="1fr 2fr"
                  >
                    <Text as="dt" fontWeight="bold">
                      Name
                    </Text>
                    <Text as="dd">{issuer.owner.name}</Text>
                    <Text as="dt" fontWeight="bold">
                      Username
                    </Text>
                    <Text as="dd">{issuer.owner.username}</Text>
                    <Text as="dt" fontWeight="bold">
                      Email
                    </Text>
                    <Text as="dd">{issuer.owner.email}</Text>
                  </Box>
                </Box>
              </Box>
            </Box>
          </>
        )}

        {/* <Box mt={5}>

            
                <ButtonGroup variant="outline" spacing="6" className="m-5">
                    <Button colorScheme="blue" onClick={() => fulfill()}>Update</Button>
                    <Button>Cancel</Button>
                </ButtonGroup>
            </Box> */}
      </Container>
    </>
  );
};

export default UpdateIssuer;
