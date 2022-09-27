import * as React from 'react';
import {
  Box,
  Heading,
  Text,
  Icon,
  Flex,
  Divider,
  Center,
  CircularProgress,
} from '@chakra-ui/react';
import { FaCode } from 'react-icons/fa';
import { Environment } from '@/shared/types/query.types';
import YamlViewer from '../yaml-viewer';
import JwtKeycloak from './templates/jwt-keycloak';
import KongAclOnly from './templates/kong-acl-only';
import KongApiKeyAcl from './templates/kong-api-key-acl';
import KongApiKeyOnly from './templates/kong-api-key-only';
import { gql } from 'graphql-request';
import { useApi } from '@/shared/services/api';

interface EnvironmentPluginsProps {
  environment: Environment;
}

const EnvironmentPlugins: React.FC<EnvironmentPluginsProps> = ({
  environment,
}) => {
  const id = environment?.credentialIssuer?.id;
  const { data, isLoading, isSuccess } = useApi(
    ['environment-credential', environment?.credentialIssuer?.id],
    {
      query,
      variables: { id },
    },
    {
      enabled: Boolean(id),
      suspense: false,
    }
  );

  const issuer = data?.allCredentialIssuersByNamespace[0];
  const pluginConfigs = {
    'kong-api-key-acl': KongApiKeyAcl(
      environment?.product.namespace,
      environment?.appId
    ),
    'kong-api-key-only': KongApiKeyOnly(
      environment?.product.namespace,
      environment?.appId
    ),
    'kong-acl-only': KongAclOnly(
      environment?.product.namespace,
      environment?.appId
    ),
    'client-credentials': JwtKeycloak(
      environment?.product.namespace,
      environment?.name,
      issuer
    ),
  };

  return (
    <>
      <Box mb={4}>
        <Text>
          Ensure that services associated with this environment have the
          following plugins configured:
        </Text>
      </Box>
      <Box>
        {isLoading && (
          <Center minH="200px">
            <CircularProgress />
          </Center>
        )}
        {isSuccess && <YamlViewer doc={pluginConfigs[environment.flow]} />}
      </Box>
    </>
  );
};

export default EnvironmentPlugins;

const query = gql`
  query GetAllCredentialIssuersByNamespace($id: ID!) {
    allCredentialIssuersByNamespace(where: { id: $id }) {
      environmentDetails
    }
  }
`;
