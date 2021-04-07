import * as React from 'react';
import api from '@/shared/services/api';
import {
  FormControl,
  FormLabel,
  HStack,
  Input,
  Select,
  useToast,
} from '@chakra-ui/react';
import { FaTrafficLight } from 'react-icons/fa';
import { QueryKey, useMutation, useQueryClient } from 'react-query';
import { serializeFormData } from '@/shared/services/utils';

import ControlsDialog from './controls-dialog';
import ControlTypeSelect from './control-type-select';
import { FULFILL_REQUEST } from './queries';

type ControlsPayload = {
  name: string;
  route?: {
    id: string;
  };
  service?: {
    id: string;
  };
  config: {
    second: string;
    minute: string;
    hour: string;
    day: string;
    policy: string;
  };
};

interface RateLimitingProps {
  data?: any;
  id: string;
  mode: 'edit' | 'create';
  queryKey: QueryKey;
}

const RateLimiting: React.FC<RateLimitingProps> = ({
  data,
  id,
  mode,
  queryKey,
}) => {
  const client = useQueryClient();
  const mutation = useMutation((payload: { id: string; controls: string }) =>
    api(FULFILL_REQUEST, payload)
  );
  const toast = useToast();
  const config = data?.config
    ? JSON.parse(data.config)
    : {
        second: '',
        minute: '',
        hour: '',
        day: '',
        policy: 'local',
      };

  const onSubmit = async (formData: FormData) => {
    try {
      const controls: ControlsPayload = {
        name: 'rate-limiting',
        config: {
          second: formData.get('second') as string,
          minute: formData.get('minute') as string,
          hour: formData.get('hour') as string,
          day: formData.get('day') as string,
          policy: formData.get('policy') as string,
        },
      };

      if (formData.has('route')) {
        controls.route = {
          id: formData.get('route') as string,
        };
      }

      if (formData.has('service')) {
        controls.service = {
          id: formData.get('service') as string,
        };
      }

      const payload = {
        id,
        controls: JSON.stringify(controls),
      };
      await mutation.mutateAsync(payload);
      client.invalidateQueries(queryKey);
      toast({
        title: 'Control Updated',
        status: 'success',
      });
    } catch (err) {
      toast({
        title: 'Control Update Failed',
        description: err?.message,
        status: 'error',
      });
    }
  };

  return (
    <ControlsDialog
      buttonText="Rate Limiting"
      icon={FaTrafficLight}
      mode={mode}
      onSubmit={onSubmit}
      title="Rate Limiting"
    >
      <ControlTypeSelect
        serviceId={data?.service?.id}
        routeId={data?.route?.id}
      />
      <HStack spacing={4} mb={4}>
        <FormControl id="second">
          <FormLabel>Second</FormLabel>
          <Input
            variant="bc-input"
            name="second"
            placeholder="00"
            defaultValue={config.second}
          />
        </FormControl>
        <FormControl id="minute">
          <FormLabel>Minute</FormLabel>
          <Input
            variant="bc-input"
            name="minute"
            placeholder="00"
            defaultValue={config.minute}
          />
        </FormControl>
        <FormControl id="hour">
          <FormLabel>Hour</FormLabel>
          <Input
            variant="bc-input"
            name="hour"
            placeholder="00"
            defaultValue={config.hour}
          />
        </FormControl>
        <FormControl id="day">
          <FormLabel>Day</FormLabel>
          <Input
            variant="bc-input"
            name="day"
            placeholder="00"
            defaultValue={config.day}
          />
        </FormControl>
      </HStack>
      <FormControl id="policy">
        <FormLabel>Policy</FormLabel>
        <Select name="policy" variant="bc-input" defaultValue={config.policy}>
          <option value="local">Local</option>
          <option value="redis">Redis</option>
        </Select>
      </FormControl>
    </ControlsDialog>
  );
};

export default RateLimiting;
