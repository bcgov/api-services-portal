import * as React from 'react';
import {
  useDisclosure,
  FormControl,
  FormLabel,
  Select,
  RadioGroup,
  Stack,
  Radio,
} from '@chakra-ui/react';
import startCase from 'lodash/startCase';
import { useApi } from '@/shared/services/api';
import { gql } from 'graphql-request';
import { GatewayRoute, GatewayService } from '@/shared/types/query.types';

const query = gql`
  query GetControlContent {
    allGatewayRoutes {
      id
      name
    }
    allGatewayServices {
      id
      name
    }
  }
`;

const ControlTypeSelect: React.FC = () => {
  const [control, setControl] = React.useState<string>('route');
  const { data, isLoading } = useApi(
    ['consumerControlsOptions'],
    { query },
    { suspense: false }
  );
  const options:
    | Pick<GatewayService, 'id' | 'name'>[]
    | Pick<GatewayRoute, 'id' | 'name'>[] = React.useMemo(() => {
    if (isLoading) return [];

    switch (control) {
      case 'service':
        return data?.allGatewayServices;
      case 'route':
        return data?.allGatewayRoutes;
      default:
        return [];
    }
  }, [data, control, isLoading]);

  return (
    <>
      <FormControl id="type" mb={4}>
        <FormLabel>Type</FormLabel>
        <RadioGroup onChange={setControl} value={control}>
          <Stack spacing={4} direction="row">
            <Radio name="type" value="route">
              Route
            </Radio>
            <Radio name="type" value="service">
              Service
            </Radio>
          </Stack>
        </RadioGroup>
      </FormControl>
      <FormControl id="allowed" mb={4}>
        <FormLabel>{startCase(control)}</FormLabel>
        <Select isRequired isDisabled={isLoading} variant="bc-input">
          {options.map((o) => (
            <option key={o.id} value={o.id}>
              {o.name}
            </option>
          ))}
        </Select>
      </FormControl>
    </>
  );
};

export default ControlTypeSelect;
