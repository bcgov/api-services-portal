import * as React from 'react';
import {
  Box,
  FormControl,
  FormHelperText,
  FormLabel,
  HStack,
  Input,
  Radio,
  RadioGroup,
  Select,
} from '@chakra-ui/react';
import { ExpandableCards, ExpandableCard } from '@/components/card';
import { FaDoorClosed } from 'react-icons/fa';
import { HiChartBar } from 'react-icons/hi';
import startCase from 'lodash/startCase';
import { gql } from 'graphql-request';
import { useApi } from '@/shared/services/api';

const Controls: React.FC = () => {
  const [restrictionType, setRestrictionType] = React.useState('service');
  const [rateLimitingType, setRateLimitingType] = React.useState('service');
  const { data, isLoading } = useApi(
    'consumerControls',
    { query },
    { suspense: false }
  );

  // Events
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
  };

  return (
    <Box>
      <ExpandableCards>
        <ExpandableCard heading="IP Restrictions" icon={FaDoorClosed}>
          <form onSubmit={handleSubmit} name="ipRestrictionsForm">
            <FormControl mb={5}>
              <FormLabel>Scope</FormLabel>
              <RadioGroup onChange={setRestrictionType} value={restrictionType}>
                <HStack spacing={4}>
                  <Radio value="service">Service</Radio>
                  <Radio value="route">Route</Radio>
                </HStack>
              </RadioGroup>
            </FormControl>
            <Box
              as="fieldset"
              borderLeft="1px solid"
              borderColor="ui"
              px={4}
              maxW="50%"
            >
              <Select isDisabled={isLoading} mb={5} name={restrictionType}>
                {data?.allGatewayServicesByNamespace.map((s) => (
                  <option key={s.id} value={s.extForeignKey}>
                    {s.name}
                  </option>
                ))}
              </Select>
              <FormControl isRequired>
                <FormLabel>Allowed IPs</FormLabel>
                <FormHelperText>
                  Comma-separated list, i.e. 1.1.1.1, 0.0.0.0
                </FormHelperText>
                <Input name="allow" />
              </FormControl>
            </Box>
          </form>
        </ExpandableCard>
        <ExpandableCard heading="Rate Limiting" icon={HiChartBar}>
          <form onSubmit={handleSubmit} name="rateLimitingForm">
            <FormControl mb={5}>
              <FormLabel>Scope</FormLabel>
              <RadioGroup
                onChange={setRateLimitingType}
                value={rateLimitingType}
              >
                <HStack spacing={4}>
                  <Radio value="service">Service</Radio>
                  <Radio value="route">Route</Radio>
                </HStack>
              </RadioGroup>
            </FormControl>
            <Box
              as="fieldset"
              borderLeft="1px solid"
              borderColor="ui.500"
              px={4}
              maxW="50%"
            >
              <Select isDisabled={isLoading} mb={5} name={rateLimitingType}>
                {data?.allGatewayServicesByNamespace.map((s) => (
                  <option key={s.id} value={s.extForeignKey}>
                    {s.name}
                  </option>
                ))}
              </Select>
              <HStack spacing={5} mb={5}>
                {['second', 'minute', 'hour', 'day'].map((t) => (
                  <FormControl key={t}>
                    <FormLabel>{startCase(t)}</FormLabel>
                    <Input
                      placeholder="00"
                      type="number"
                      name={t}
                      data-testid={`ratelimit-${t}-input`}
                    />
                  </FormControl>
                ))}
              </HStack>
              <FormControl>
                <FormLabel>Policy</FormLabel>
                <Select name="policy">
                  <option value="local">Local</option>
                  <option value="redis">Redis</option>
                </Select>
              </FormControl>
            </Box>
          </form>
        </ExpandableCard>
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
