import * as React from 'react';
import { Box } from '@chakra-ui/react';
import EmptyPane from '@/components/empty-pane';
import NewProduct from '@/components/new-product';
import { useApi } from '@/shared/services/api';
import { LIST_GATEWAY_SERVICES } from '@/shared/queries/gateway-service-queries';

import { dateRange, useTotalRequests } from './utils';
import ServiceItem from './service-item';

interface ServicesListProps {
  search: string;
}

const ServicesList: React.FC<ServicesListProps> = ({ search }) => {
  const range = dateRange();
  const { data } = useApi(
    'gateway-services',
    {
      query: LIST_GATEWAY_SERVICES,
      variables: {
        days: range,
      },
    },
    {
      suspense: true,
    }
  );
  const totalNamespaceRequests = useTotalRequests(data);
  const filterServices = React.useCallback(
    (d) => {
      return d.name.search(search) >= 0;
    },
    [search]
  );

  return (
    <>
      {data.allGatewayServicesByNamespace.length <= 0 && (
        <Box gridColumnStart="1" gridColumnEnd="4">
          <EmptyPane
            title="No services created yet."
            message="You need to publish configuration to the API Gateway."
          />
        </Box>
      )}
      {data.allGatewayServicesByNamespace.filter(filterServices).map((d) => (
        <ServiceItem
          key={d.id}
          data={d}
          range={range}
          totalRequests={totalNamespaceRequests}
        />
      ))}
    </>
  );
};

export default ServicesList;
