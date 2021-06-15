import * as React from 'react';
import { Box, Heading, Text, Icon, Flex, Divider } from '@chakra-ui/react';
import { FaCircle, FaCode } from 'react-icons/fa';
import { Environment } from '@/shared/types/query.types';
import YamlViewer from '../yaml-viewer';

interface EnvironmentPluginsProps {
  data: Environment;
}

const EnvironmentPlugins: React.FC<EnvironmentPluginsProps> = ({ data }) => {
  const flow = data.flow;

  const pluginConfigs = {
    'kong-api-key-acl': `  plugins:\n  - name: key-auth\n    tags: [ ns.${data.product.namespace} ]\n    protocols: [ http, https ]\n    config:\n      key_names: ["X-API-KEY"]\n      run_on_preflight: true\n      hide_credentials: true\n      key_in_body: false\n  - name: acl\n    tags: [ ns.${data.product.namespace} ]\n    config:\n      hide_groups_header: true\n      allow: [ ${data.appId} ]`,
    'kong-acl-only': `  plugins:\n  - name: acl\n    tags: [ ns.${data.product.namespace} ]\n    config:\n      hide_groups_header: true\n      allow: [ ${data.appId} ]`,
  };
  return (
    flow in pluginConfigs && (
      <Box my={4} bgColor="white">
        <Flex as="header" p={4} align="center">
          <Icon as={FaCode} color="bc-link" mr={2} boxSize={6} />
          <Heading size="md">Plugin Configuration</Heading>
        </Flex>
        <Divider />
        <Box p={4}>
          <Text fontSize="sm">
            Ensure that services associated with this environment have the
            following plugins:
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
