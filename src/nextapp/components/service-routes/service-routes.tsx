import * as React from 'react';
import {
  Stack,
  Tag,
  TagLabel,
  Box,
  SimpleGrid,
  VStack,
  StackDivider,
} from '@chakra-ui/react';
import { GatewayRoute } from '@/shared/types/query.types';

interface ServiceRoutesProps {
  routes: GatewayRoute[];
}

const ServiceRoutes: React.FC<ServiceRoutesProps> = ({ routes }) => {
  return (
    <>
      {routes.map((route) => {
        const _methods = JSON.parse(route['methods']);
        const methods =
          Array.isArray(_methods) && _methods.length > 0 ? _methods : ['ALL'];
        const hosts = Array.isArray(JSON.parse(route['hosts']))
          ? JSON.parse(route['hosts'])
          : [];
        const paths = Array.isArray(JSON.parse(route['paths']))
          ? JSON.parse(route['paths'])
          : ['/'];
        const hostPaths = hosts
          .map((h) => paths.map((p) => `https://${h}${p}`))
          .flat();
        return (
          <VStack
            align="left"
            divider={<StackDivider borderColor="gray.200" />}
          >
            {hostPaths.map((hp) => (
              <SimpleGrid columns={1}>
                <Stack
                  direction="row"
                  wrap="nowrap"
                  spacing={1}
                  m={1}
                  shouldWrapChildren={true}
                >
                  {methods.map((p) => (
                    <Tag
                      key={p}
                      size="sm"
                      colorScheme="green"
                      borderRadius="5px"
                    >
                      <TagLabel>{p}</TagLabel>
                    </Tag>
                  ))}
                </Stack>
                <Box m={1}>{hp}</Box>
              </SimpleGrid>
            ))}
          </VStack>
        );
      })}
    </>
  );
};

export default ServiceRoutes;
