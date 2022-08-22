import * as React from 'react';
import {
  Box,
  FormControl,
  FormLabel,
  HStack,
  Radio,
  RadioGroup,
  Select,
} from '@chakra-ui/react';
import { uid } from 'react-uid';
import { GatewayRoute, GatewayService } from '@/shared/types/query.types';

interface ScopeControlProps {
  children: React.ReactNode;
  routeOptions: GatewayRoute[];
  serviceOptions: GatewayService[];
  testId: string;
}

const ScopeControl: React.FC<ScopeControlProps> = ({
  children,
  routeOptions,
  serviceOptions,
  testId,
}) => {
  const [target, setTarget] = React.useState('service');
  // Map the options for each of the route/service dropdowns
  const options = React.useMemo(() => {
    if (target === 'service') {
      return serviceOptions;
    }
    return routeOptions;
  }, [routeOptions, serviceOptions, target]);
  return (
    <>
      <FormControl mb={5}>
        <FormLabel>Scope</FormLabel>
        <RadioGroup name="scope" onChange={setTarget} value={target}>
          <HStack spacing={4}>
            <Radio value="service" data-testid={`${testId}-service-radio`}>
              Service
            </Radio>
            <Radio value="route" data-testid={`${testId}-route-radio`}>
              Route
            </Radio>
          </HStack>
        </RadioGroup>
      </FormControl>
      <Box as="fieldset" borderLeft="1px solid" borderColor="ui" px={4}>
        <Select
          mb={5}
          name={target}
          data-testid={`${testId}-${target}-dropdown`}
        >
          {options.map((s) => (
            <option key={uid(s.id)} value={s.id}>
              {s.name}
            </option>
          ))}
        </Select>
        {children}
      </Box>
    </>
  );
};

export default ScopeControl;
