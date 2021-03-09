import * as React from 'react';
import { Box } from '@chakra-ui/react';
import EmptyPane from '@/components/empty-pane';
import NewProduct from '@/components/new-product';
import { useApi } from '@/shared/services/api';

import { LIST_GATEWAY_SERVICES } from '@/shared/queries/gateway-service-queries';
import { dateRange } from './utils';
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
    },
    {
      suspense: true,
    }
  );
  const filterServices = React.useCallback(
    (d) => {
      return d.name.search(search) >= 0;
    },
    [search]
  );

  return (
    <>
      {data.allGatewayServices.length <= 0 && (
        <Box gridColumnStart="2" gridColumnEnd="4">
          <EmptyPane
            title="No services created yet."
            message="You need to create a product before services are available"
            action={<NewProduct />}
          />
        </Box>
      )}
      {data.allGatewayServices.filter(filterServices).map((d) => (
        <ServiceItem key={d.id} data={d} range={range} />
      ))}
    </>
  );
};

export default ServicesList;
