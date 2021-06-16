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
  console.log(routes);
  const d = {
    data: {
      GatewayService: {
        id: '58',
        name: 'apidata-geocoder-geocoder',
        namespace: 'dss-loc',
        tags:
          '["ns.dss-loc.apidata","ns.dss-loc","production","serv-geocoder"]',
        host: 'geocoder.lb.v1',
        environment: {
          id: '3',
          name: 'prod',
          active: true,
          flow: 'public',
          product: {
            name: 'BC Address Geocoder',
            organization: null,
            organizationUnit: null,
          },
        },
        plugins: [
          { id: '25', name: 'statsd' },
          { id: '24', name: 'response-transformer' },
          { id: '33', name: 'acl' },
          { id: '26', name: 'bcgov-gwa-endpoint' },
          { id: '28', name: 'http-log' },
          { id: '32', name: 'key-auth' },
          { id: '30', name: 'cors' },
          { id: '22', name: 'rate-limiting' },
        ],
        routes: [
          {
            id: '53',
            name: 'apidata-geocoder-geocoder-geocoder-906eb-0',
            hosts: '["geocoder.api.gov.bc.ca"]',
            paths:
              '["/addresses*","/sites/*","/intersections/*","/occupants/*"]',
            methods: '["GET","OPTIONS"]',
          },
        ],
        updatedAt: '2021-06-15T19:44:48.732Z',
      },
    },
  };
  const _routes = d.data.GatewayService.routes;
  return (
    <>
      {_routes.map((route) => {
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
