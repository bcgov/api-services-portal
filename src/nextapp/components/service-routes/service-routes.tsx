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
import { GatewayRoute, GatewayService } from '@/shared/types/query.types';

interface ServiceRoutesProps {
  data: GatewayService;
}

const ServiceRoutes: React.FC<ServiceRoutesProps> = ({ data }) => {
  return (
    <>
      {data.routes.map((route) => {
        const _methods = JSON.parse(route.methods);
        const methods =
          Array.isArray(_methods) && _methods.length > 0 ? _methods : ['ALL'];
        const hosts = JSON.parse(route.hosts);
        const paths = JSON.parse(route.paths) ?? ['/'];
        const hostPaths = hosts
          .map((h) => paths.map((p) => `https://${h}${p}`))
          .flat();
        return (
          <VStack
            key={route.id}
            align="left"
            divider={<StackDivider borderColor="gray.200" />}
          >
            {hostPaths.map((hp) => (
              <SimpleGrid key={hp} columns={1}>
                <Stack
                  direction="row"
                  wrap="nowrap"
                  spacing={1}
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
                <Box
                  m={1}
                  data-testid={`${data.name}-service-details-${route.name}-route`}
                >
                  {hp}
                </Box>
              </SimpleGrid>
            ))}
          </VStack>
        );
      })}
    </>
  );
};

export default ServiceRoutes;
