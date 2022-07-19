import * as React from 'react';
import { Box, Text } from '@chakra-ui/react';
import { ExpandableCards } from '@/components/card';
import { gql } from 'graphql-request';
import { useApi } from '@/shared/services/api';
import {
  ConsumerPlugin,
  GatewayPlugin,
  GatewayPluginCreateInput,
  GatewayRoute,
  GatewayService,
} from '@/shared/types/query.types';

import IpRestrictions from './ip-restriction';
import RateLimiting from './rate-limiting';

interface ControlsProps {
  prodEnvId: string;
  rateLimits: [
    ConsumerPlugin[],
    React.Dispatch<React.SetStateAction<ConsumerPlugin[]>>
  ];
  restrictions: [
    ConsumerPlugin[],
    React.Dispatch<React.SetStateAction<ConsumerPlugin[]>>
  ];
}

const Controls: React.FC<ControlsProps> = ({
  prodEnvId,
  rateLimits,
  restrictions,
}) => {
  const { data, isLoading } = useApi(
    ['nsProductServices', prodEnvId],
    { query, variables: { prodEnvId } },
    { suspense: false }
  );

  // Map the options for each of the route/service dropdowns
  const serviceOptions: GatewayService[] = React.useMemo(() => {
    if (data?.allGatewayServicesByNamespace) {
      return data.allGatewayServicesByNamespace;
    }
    return [];
  }, [data]);
  const routeOptions: GatewayRoute[] = React.useMemo(() => {
    if (data?.allGatewayServicesByNamespace) {
      return data.allGatewayServicesByNamespace.map((s) => s.routes).flat();
    }
    return [];
  }, [data]);
  const serviceNameDict: Record<string, string> = React.useMemo(() => {
    const result = {};
    routeOptions.forEach((r) => (result[r.id] = r.name));
    serviceOptions.forEach((s) => (result[s.id] = s.name));
    return result;
  }, [routeOptions, serviceOptions]);
  // New records won't have a name embedded in them, so this will look them up on
  // above option lists
  const getControlName = (plugin: unknown & ConsumerPlugin): string => {
    if (plugin.service?.name || plugin.route?.name) {
      return plugin.service?.name ?? plugin.route?.name;
    }
    const id = plugin.service?.id ?? plugin.route?.id;

    if (!id) {
      return 'N/A';
    }

    return serviceNameDict[id];
  };

  if (!isLoading && serviceOptions.length == 0) {
    return (
      <Box data-testid="controls">
        This environment has no gateway services assigned to it.
      </Box>
    );
  }

  return (
    <Box data-testid="controls">
      {isLoading && <Text data-testid="controls-loading">Loading...</Text>}
      <ExpandableCards>
        <IpRestrictions
          getControlName={getControlName}
          routeOptions={routeOptions}
          serviceOptions={serviceOptions}
          state={restrictions}
        />
        <RateLimiting
          getControlName={getControlName}
          routeOptions={routeOptions}
          serviceOptions={serviceOptions}
          state={rateLimits}
        />
      </ExpandableCards>
    </Box>
  );
};

export default Controls;

const query = gql`
  query GetControlContent($prodEnvId: ID!) {
    allGatewayServicesByNamespace(where: { environment: { id: $prodEnvId } }) {
      id
      name
      extForeignKey
      routes {
        id
        name
        extForeignKey
      }
    }
  }
`;
