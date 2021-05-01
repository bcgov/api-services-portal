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
  FormControl,
  FormLabel,
  FormHelperText,
  Icon,
  RadioGroup,
  Radio,
  Stack,
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

import { CREATE_ISSUER } from './queries';

import NextLink from 'next/link';

import { styles } from '@/shared/styles/devportal.css';

import graphql from '@/shared/services/graphql';
import toArray from '@/shared/services/toarray';

import NameValue from '@/components/name-value';
import YamlViewer from '@/components/yaml-viewer';

import { ButtonGroup, Input, Textarea, Flex, useToast } from '@chakra-ui/react';

import { useAppContext } from '@/pages/context';

import { useAuth } from '@/shared/services/auth';

import breadcrumbs from '@/components/ns-breadcrumb'

const ListArray = ({name, value, edit, onChange}) => {

    const display = value && typeof(value) != 'undefined' ? value : []

    return edit ? 
        (
            <Textarea name={name} defaultValue={display.join('\n')} onChange={(e) => onChange(e.target.value)}/>
        ) : (
            <Text as="dd">{display.map(v => ( <li>{v}</li> ))}</Text>
        )
}

const CreateIssuer = () => {
  const context = useAppContext();
  const [{ state, data }, setState] = useState({
    state: 'loading',
    data: { name: "", mode: "", flow: "", clientRegistration: "", oidcDiscoveryUrl: "", apiKeyName: "", owner: { username: "B", email: "a@b", name: "A" } },
  });

  const { user } = useAuth()
  
  console.log(JSON.stringify(user))
  //useEffect(() => { setState({state: 'loaded', data: issuer})}, [ issuer ])

  const form = React.useRef<HTMLFormElement>();

  const breadcrumb = breadcrumbs([
    { href: '/manager/poc/credential-issuers', text: 'Authorization Profiles' },
  ]);

  const toast = useToast();
  const errorToast = (message) => {
    toast({
      title: 'Failed to create issuer',
      description: message,
      status: 'error',
      duration: 9000,
      isClosable: true,
    });
  };

  const refetch = (id : string) => {
    window.location.href = `/manager/poc/credential-issuers/issuer/${id}`;
  };

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    createProfile();
  };
  const createProfile = async () => {
    if (form.current) {
      const data = new FormData(form.current);

      // Display the key/value pairs
      for(var pair of data.entries()) {
            console.log(pair[0]+ ', '+ pair[1]);
      }
      var object = {};
      object['namespace'] = user.namespace
      data.forEach((value, key) => object[key] = value);
      console.log(JSON.stringify(object, null, 5))
      fulfill(object)
      if (form.current.checkValidity()) {
        // const productName = data.get('name') as string;
        // const environment = data.get('environment') as string;
      }
    }
  }

  const [issuer, setIssuer] = React.useState({ name: "", flow: "", clientRegistration: "", mode: "", availableScopes: [], clientRoles: [], owner: (user == null ? { name:"", username:"", email:""}:user) });

  const flow = issuer.flow

  useEffect(() => {
      setIssuer ( { ...issuer, ... { owner : (user == null ? { name:"", username:"", email:""}:user) }})
  }, [ user ])

  const fulfill = (object) => {
    const vars = { data : {...object, ...{ 
        availableScopes: JSON.stringify(issuer.availableScopes),
        clientRoles: JSON.stringify(issuer.clientRoles),
        owner: { connect: { id: user.userId }}
    } } }

    graphql(CREATE_ISSUER, vars)
      .then((data) => refetch(data.data.createCredentialIssuer.id))
      .catch((err) => {
        errorToast(JSON.stringify(err.message));
      });
  };

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
        <form ref={form} onSubmit={onSubmit}>


        <Box
            display="grid"
            gridGap={4}
            gridTemplateColumns="repeat(12, 1fr)"
            >

            <Box bgColor="white" mb={4} gridColumn="span 8">
              <Box
                p={4}
                display="flex"
                alignItems="center"
                justifyContent="space-between"
              >
                <Heading size="md">Profile</Heading>
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

                        <FormControl
                        isRequired
                        mb={4}
                        isDisabled={false}
                        >
                            <FormLabel>Name</FormLabel>
                            <Input
                                placeholder="Name"
                                name="name"
                                variant="bc-input"
                            />
                        </FormControl> 
                        <Box></Box>

                    </Box>
             </Box>
            </Box>


            <Box bgColor="white" mb={4} gridColumn="span 4">
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
                            fontSize="md"
                            flexWrap="wrap"
                            gridColumnGap={4}
                            gridRowGap={2}
                            gridTemplateColumns="1fr 2fr"
                        >
                            <Text as="dt" fontWeight="normal">
                            Name
                            </Text>
                            <Text as="dd">{issuer.owner.name}</Text>
                            <Text as="dt" fontWeight="normal">
                            Username
                            </Text>
                            <Text as="dd">{issuer.owner.username}</Text>
                            <Text as="dt" fontWeight="normal">
                            Email
                            </Text>
                            <Text as="dd">{issuer.owner.email}</Text>
                        </Box>
                </Box>
            </Box>
        </Box>

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
                  gridTemplateColumns="2fr 2fr"
                >

 

                    <FormControl as="fieldset" isRequired>
                        <FormLabel as="legend">Flow</FormLabel>
                        <RadioGroup defaultValue="" onChange={(e : string) => setIssuer({...issuer, ...{flow:e}})}>
                            <Stack>
                                <Radio name="flow" value="client-credentials">
                                    Client Credential flow
                                </Radio>
                                <Radio name="flow" value="authorization-code">
                                    Authorization Code Flow
                                </Radio>
                                <Radio name="flow" value="kong-api-key-acl">
                                    Kong API Key
                                </Radio>
                            </Stack>
                        </RadioGroup>
                        <FormHelperText>
                        </FormHelperText>
                    </FormControl>

                  
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

                    <FormControl as="fieldset" isRequired>
                        <FormLabel as="legend">Mode</FormLabel>
                        <RadioGroup defaultValue="" onChange={(e : string) => setIssuer({...issuer, ...{mode:e}})}>
                            <Stack>
                                <Radio name="mode" value="manual">
                                    Manual
                                </Radio>
                                <Radio name="mode" value="auto">
                                    Automatic
                                </Radio>
                            </Stack>
                        </RadioGroup>
                        <FormHelperText>
                        </FormHelperText>
                    </FormControl>
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
                </Box>
                {flow === 'client-credentials' && (
                  <Box
                    as="dl"
                    display="grid"
                    fontSize="sm"
                    flexWrap="wrap"
                    gridColumnGap={4}
                    gridRowGap={2}
                    gridTemplateColumns="2fr 2fr"
                  >

                    {/* <FormControl as="fieldset" isRequired>
                        <FormLabel as="legend">Identity Provider (idP)</FormLabel>
                            <Stack>
                                <Radio value="keycloak">
                                    Keycloak
                                </Radio>
                            </Stack>
                        <FormHelperText>
                        </FormHelperText>
                    </FormControl>                      
                    <Box></Box> */}
                    <FormControl
                    isRequired
                    mb={4}
                    isDisabled={false}
                    >
                        <FormLabel>OIDC Discovery URL</FormLabel>
                        <Input
                            placeholder="Discovery URL"
                            name="oidcDiscoveryUrl"
                            variant="bc-input"
                        />
                    </FormControl>
                    <Box></Box>
                  </Box>
                )}
                {flow == 'kong-api-key-acl' && (
                  <Box
                    as="dl"
                    display="grid"
                    fontSize="sm"
                    flexWrap="wrap"
                    gridColumnGap={4}
                    gridRowGap={2}
                    gridTemplateColumns="2fr 2fr"
                  >
                    <FormControl
                    isRequired
                    mb={4}
                    isDisabled={false}
                    >
                        <FormLabel>Key Name</FormLabel>
                        <Input
                            placeholder="Key Name"
                            name="apiKeyName"
                            variant="bc-input"
                        />
                    </FormControl>
                    <Box></Box>
                  </Box>
                )}
              </Box>
            </Box>

            {issuer.flow == 'client-credentials' && (

                <Box bgColor="white" mb={4}>
                <Box
                p={4}
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                >
                    <Heading size="md">Authorization</Heading>
                
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
                        gridTemplateColumns="2fr 2fr"
                        >
                            <FormControl
                                    mb={4}
                                    isDisabled={false}
                                >
                                    <FormLabel>Scopes</FormLabel>
                                    <Textarea name="availableScopes" defaultValue={issuer.availableScopes} onChange={(e : any) => setIssuer({...issuer, ...{availableScopes:e.target.value.split('\n')}})}/>

                            </FormControl>
                            <Alert status="info">
                                <AlertIcon />
                                <Box>
                                    If your APIs are protected by Scope, then provide the full list of Scopes setup in the idP.
                                </Box>
                            </Alert>
                            <FormControl
                                    mb={4}
                                    isDisabled={false}
                                >
                                    <FormLabel>Roles</FormLabel>
                                    <ListArray name="clientRoles" value={issuer.clientRoles} edit={true} onChange={(value : string[]) => setIssuer({...issuer, ...{clientRoles:value}})}/>
                            </FormControl>    
                            <Alert status="info">
                                <AlertIcon />
                                <Box>
                                    If your APIs are protected by Roles, provide the full list of Client Roles that will be used to manage access to the APIs that are protected with this Authorization configuration.
                                </Box>
                            </Alert>

                                <FormControl
                                    mb={4}
                                    isDisabled={false}
                                >
                                    <FormLabel>UMA2 Resource Type</FormLabel>
                                    <Input
                                        placeholder="Resource Type"
                                        name="resourceType"
                                        variant="bc-input"
                                        onChange={(e : any) => setIssuer({...issuer, ...{resourceType:e.target.value}})}
                                    />
                                </FormControl>    
                            <Box/>

                    </Box>
                </Box>
                </Box>     
            )}

            {flow == 'client-credentials' && (
              <Box bgColor="white" mb={4}>
                <Box
                  p={4}
                  display="flex"
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <Heading size="md">Client Registration</Heading>
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
                    gridTemplateColumns="2fr 2fr"
                  >
                    <FormControl as="fieldset" isRequired>
                        <FormLabel as="legend">Client Registration</FormLabel>
                        <RadioGroup defaultValue="" onChange={(e : string) => setIssuer({...issuer, ...{clientRegistration:e}})}>
                            <Stack>
                                <Radio name="clientRegistration" value="anonymous">
                                    Anonymous
                                </Radio>
                                {issuer.mode == "auto" && <Radio name="clientRegistration" value="iat">
                                    Initial Access Token
                                </Radio>}
                                {issuer.mode == "auto" && <Radio name="clientRegistration" value="managed">
                                    Managed
                                </Radio>}
                            </Stack>
                        </RadioGroup>
                        <FormHelperText>
                        </FormHelperText>
                    </FormControl>
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
                    {issuer.clientRegistration == 'iat'  && (
                        <>
                            <FormControl
                            isRequired
                            mb={4}
                            isDisabled={false}
                            >
                                <FormLabel>Initial Acccess Token</FormLabel>
                                <Input
                                    placeholder="Initial Acccess Token"
                                    name="initialAccessToken"
                                    variant="bc-input"
                                />
                            </FormControl>
                          <Box></Box>
                        </>
                      )}
                    {issuer.clientRegistration == 'managed'  && (
                        <>
                           <FormControl
                            isRequired
                            mb={4}
                            isDisabled={false}
                            >
                                <FormLabel>Client ID</FormLabel>
                                <Input
                                    placeholder="Client ID"
                                    name="clientId"
                                    variant="bc-input"
                                />
                            </FormControl>
                            <Box></Box>

                            <FormControl
                            isRequired
                            mb={4}
                            isDisabled={false}
                            >
                                <FormLabel>Client Secret</FormLabel>
                                <Input
                                    placeholder="Client Secret"
                                    name="clientSecret"
                                    variant="bc-input"
                                />
                            </FormControl>                            
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
                    gridTemplateColumns="2fr 2fr"
                  >
                    <FormControl
                    isRequired
                    mb={4}
                    isDisabled={false}
                    >
                        <FormLabel>Client ID</FormLabel>
                        <Input
                            placeholder="Client ID"
                            name="clientId"
                            variant="bc-input"
                        />
                    </FormControl>
                    <Box></Box>
                  </Box>
                </Box>
              </Box>
            )}


          </>
        )}
        </form>

        <Box mt={5}>

            
                <ButtonGroup variant="outline" spacing="6" className="m-5">
                    <Button colorScheme="blue" onClick={createProfile}>Create</Button>
                    <Button>Cancel</Button>
                </ButtonGroup>
            </Box>
      </Container>
    </>
  );
};

export default CreateIssuer;
