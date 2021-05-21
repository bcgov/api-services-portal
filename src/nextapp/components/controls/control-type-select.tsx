import * as React from 'react';
import {
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

interface ControlTypeSelectProps {
  routeId?: string;
  serviceId?: string;
}



const ControlTypeSelect: React.FC<ControlTypeSelectProps> = ({
  routeId,
  serviceId,
}) => {
  const defaultScope = routeId ? 'route' : 'service';
  const defaultScopeId = routeId ?? serviceId;
  const [control, setControl] = React.useState<string>(defaultScope);
  const { data, isLoading } = useApi(
    ['consumerControlsOptions'],
    { query },
    { suspense: false }
  );
  const options:
    | Pick<GatewayService, 'extForeignKey' | 'name'>[]
    | Pick<GatewayRoute, 'extForeignKey' | 'name'>[] = React.useMemo(() => {
    if (isLoading) return [];

    switch (control) {
      case 'service':
        return data?.allGatewayServicesByNamespace;
      case 'route':
        return [];
      default:
        return [];
    }
  }, [data, control, isLoading]);
  const onChange = (value: string) => {
    setControl(value);
  };

  return (
    <>
      <FormControl id="scope" mb={4}>
        <FormLabel>Scope</FormLabel>
        <RadioGroup onChange={onChange} value={control}>
          <Stack spacing={4} direction="row">
            <Radio name="scope" value="service">
              Service
            </Radio>
            <Radio name="scope" value="route">
              Route
            </Radio>
          </Stack>
        </RadioGroup>
      </FormControl>
      <FormControl id="allowed" mb={4}>
        <FormLabel>{startCase(control)}</FormLabel>
        <Select
          isRequired
          isDisabled={isLoading}
          name={control}
          variant="bc-input"
          defaultValue={defaultScopeId}
        >
          {options.map((o) => (
            <option key={o.extForeignKey} value={o.extForeignKey}>
              {o.name}
            </option>
          ))}
        </Select>
      </FormControl>
    </>
  );
};

export default ControlTypeSelect;

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