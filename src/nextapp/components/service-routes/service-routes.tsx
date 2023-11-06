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
import { GatewayService } from '@/shared/types/query.types';
import { uid } from 'react-uid';

interface ServiceRoutesProps {
  data: GatewayService;
}

const ServiceRoutes: React.FC<ServiceRoutesProps> = ({ data }) => {
  const routes = React.useMemo(() => {
    const result = data.routes.map((route) => {
      const parsedMethods = JSON.parse(route.methods);
      const methods =
        Array.isArray(parsedMethods) && parsedMethods.length > 0
          ? parsedMethods
          : ['ALL'];
      const hosts: string[] = JSON.parse(route.hosts);
      const paths: string[] = JSON.parse(route.paths) ?? ['/'];
      if (paths.length === 0) {
        paths.push('/');
      }
      const hostPaths = hosts
        .map((h: string) => paths.map((p) => `https://${h}${p}`))
        .flat();

      return {
        id: route.id,
        name: route.name,
        hosts,
        paths,
        hostPaths,
        methods,
      };
    });
    return result ?? [];
  }, [data.routes]);

  return (
    <>
      {routes.map((route) => {
        return (
          <VStack
            key={route.id}
            align="left"
            divider={<StackDivider borderColor="gray.200" />}
          >
            {route.hostPaths.map((h) => (
              <SimpleGrid key={uid(h)} columns={1}>
                <Stack
                  direction="row"
                  wrap="nowrap"
                  spacing={1}
                  shouldWrapChildren={true}
                >
                  {route.methods.map((m) => (
                    <Tag
                      key={uid(m)}
                      size="sm"
                      colorScheme="green"
                      borderRadius="5px"
                    >
                      <TagLabel>{m}</TagLabel>
                    </Tag>
                  ))}
                </Stack>
                <Box
                  m={1}
                  data-testid={`${data.name}-service-details-${route.name}-route`}
                >
                  {h}
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
