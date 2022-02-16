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

const Controls: React.FC = () => {
  return (
    <Box>
      <ExpandableCards>
        <ExpandableCard heading="IP Restrictions" icon={FaDoorClosed}>
          <FormControl mb={5}>
            <FormLabel>Scope</FormLabel>
            <RadioGroup>
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
            <Select mb={5}>
              <option>a-services-for-a-route</option>
            </Select>
            <FormControl>
              <FormLabel>Allowed IPs</FormLabel>
              <FormHelperText>
                Comma-separated list, i.e. 1.1.1.1, 0.0.0.0
              </FormHelperText>
              <Input />
            </FormControl>
          </Box>
        </ExpandableCard>
        <ExpandableCard heading="Rate Limiting" icon={HiChartBar}>
          <FormControl mb={5}>
            <FormLabel>Scope</FormLabel>
            <RadioGroup>
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
            <Select mb={5}>
              <option>a-services-for-a-route</option>
            </Select>
            <HStack spacing={5} mb={5}>
              {['second', 'minute', 'hour', 'day'].map((t) => (
                <FormControl key={t}>
                  <FormLabel>{startCase(t)}</FormLabel>
                  <Input placeholder="00" type="number" name={t} />
                </FormControl>
              ))}
            </HStack>
            <FormControl>
              <FormLabel>Policy</FormLabel>
              <Select>
                <option>a-services-for-a-route</option>
              </Select>
            </FormControl>
          </Box>
        </ExpandableCard>
      </ExpandableCards>
    </Box>
  );
};

export default Controls;
