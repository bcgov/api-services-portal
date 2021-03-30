import * as React from 'react';
import {
  FormControl,
  FormLabel,
  HStack,
  Input,
  Select,
} from '@chakra-ui/react';
import { FaTrafficLight } from 'react-icons/fa';

import ControlsDialog from './controls-dialog';
import ControlTypeSelect from './control-type-select';
import { QueryKey, useQueryClient } from 'react-query';

interface IpRestrictionProps {
  mode: 'edit' | 'create';
  queryKey: QueryKey;
}

const IpRestriction: React.FC<IpRestrictionProps> = ({ mode, queryKey }) => {
  const client = useQueryClient();
  const onSubmit = async (formData: FormData) => {
    client.invalidateQueries(queryKey);
  };

  return (
    <ControlsDialog
      buttonText="Rate Limiting"
      icon={FaTrafficLight}
      mode={mode}
      onSubmit={onSubmit}
      title="Rate Limiting"
    >
      <ControlTypeSelect />
      <HStack spacing={4} mb={4}>
        <FormControl id="second">
          <FormLabel>Second</FormLabel>
          <Input variant="bc-input" placeholder="00" />
        </FormControl>
        <FormControl id="minute">
          <FormLabel>Minute</FormLabel>
          <Input variant="bc-input" placeholder="00" />
        </FormControl>
        <FormControl id="hour">
          <FormLabel>Hour</FormLabel>
          <Input variant="bc-input" placeholder="00" />
        </FormControl>
        <FormControl id="day">
          <FormLabel>Day</FormLabel>
          <Input variant="bc-input" placeholder="00" />
        </FormControl>
      </HStack>
      <FormControl id="policy">
        <FormLabel>Policy</FormLabel>
        <Select variant="bc-input">
          <option value="local">Local</option>
          <option value="redis">Redis</option>
        </Select>
      </FormControl>
    </ControlsDialog>
  );
};

export default IpRestriction;
