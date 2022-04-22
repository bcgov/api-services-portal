import * as React from 'react';
import { Box } from '@chakra-ui/react';
import { ExpandableCards } from '@/components/card';
import { gql } from 'graphql-request';
import { useApi } from '@/shared/services/api';
import {
  GatewayPlugin,
  GatewayPluginCreateInput,
  GatewayRoute,
  GatewayService,
} from '@/shared/types/query.types';

import IpRestrictions from './ip-restriction';
import RateLimiting from './rate-limiting';
import type {
  RateLimitingItem,
  IpRestrictionItem,
  RateLimitingConfig,
} from './types';

interface ControlsProps {
  rateLimits: [
    (GatewayPlugin | GatewayPluginCreateInput)[],
    React.Dispatch<
      React.SetStateAction<(GatewayPlugin | GatewayPluginCreateInput)[]>
    >
  ];
  restrictions: [
    (GatewayPlugin | GatewayPluginCreateInput)[],
    React.Dispatch<
      React.SetStateAction<(GatewayPlugin | GatewayPluginCreateInput)[]>
    >
  ];
}

const Controls: React.FC<ControlsProps> = ({ rateLimits, restrictions }) => {
  const { data } = useApi('consumerControls', { query }, { suspense: false });

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
    routeOptions.forEach((r) => (result[r.extForeignKey] = r.name));
    serviceOptions.forEach((s) => (result[s.extForeignKey] = s.name));
    return result;
  }, [routeOptions, serviceOptions]);
  // New records won't have a name embedded in them, so this will look them up on
  // above option lists
  const getControlName = (
    plugin: unknown & GatewayPlugin & GatewayPluginCreateInput
  ): string => {
    if (plugin.service?.name || plugin.route?.name) {
      return plugin.service?.name ?? plugin.route?.name;
    }
    const id = plugin.service?.connect?.id ?? plugin.route?.connect?.id;

    if (!id) {
      return 'N/A';
    }

    return serviceNameDict[id];
  };

  return (
    <Box>
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
  query GetControlContent {
    allGatewayServicesByNamespace {
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
