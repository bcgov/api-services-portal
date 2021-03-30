import * as React from 'react';
import {
  FormControl,
  FormLabel,
  FormHelperText,
  Input,
} from '@chakra-ui/react';
import { FaDoorClosed } from 'react-icons/fa';
import { useApi } from '@/shared/services/api';
import { useQueryClient, QueryKey } from 'react-query';

import ControlsDialog from './controls-dialog';
import ControlTypeSelect from './control-type-select';

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
      buttonText="IP Restritions"
      icon={FaDoorClosed}
      mode={mode}
      onSubmit={onSubmit}
      title="IP Restrition"
    >
      <ControlTypeSelect />
      <FormControl id="allowed">
        <FormLabel>Allowed IPs</FormLabel>
        <Input isRequired variant="bc-input" />
        <FormHelperText>
          Comma-separated list, i.e. 1.1.1.1, 0.0.0.0
        </FormHelperText>
      </FormControl>
    </ControlsDialog>
  );
};

export default IpRestriction;
