import * as React from 'react';
import { Box, Heading, Text, Icon, Flex, Divider } from '@chakra-ui/react';
import { FaCircle, FaCode } from 'react-icons/fa';
import { Environment } from '@/shared/types/query.types';
import YamlViewer from '../yaml-viewer';
import JwtKeycloak from './templates/jwt-keycloak';
import KongAclOnly from './templates/kong-acl-only';
import KongApiKeyAcl from './templates/kong-api-key-acl';
interface EnvironmentPluginsProps {
  data: Environment;
}

const EnvironmentPlugins: React.FC<EnvironmentPluginsProps> = ({ data }) => {
  const flow = data.flow;

  const pluginConfigs = {
    'kong-api-key-acl': KongApiKeyAcl(data.product.namespace, data.appId),
    'kong-acl-only': KongAclOnly(data.product.namespace, data.appId),
    'client-credentials': JwtKeycloak(
      data.product.namespace,
      data.name,
      data.credentialIssuer
    ),
  };
  return (
    flow in pluginConfigs && (
      <Box my={4} bgColor="white">
        <Flex as="header" p={4} align="center">
          <Icon as={FaCode} color="bc-link" mr={2} boxSize={6} />
          <Heading size="md">Plugin Template</Heading>
        </Flex>
        <Divider />
        <Box p={4}>
          <Text fontSize="sm">
            Ensure that services associated with this environment have the
            following plugins configured:
          </Text>
        </Box>
        <Box p={4} bg="white">
          <YamlViewer doc={pluginConfigs[flow]} />
        </Box>
      </Box>
    )
  );
};

export default EnvironmentPlugins;
