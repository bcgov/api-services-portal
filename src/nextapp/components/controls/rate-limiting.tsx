import * as React from 'react';
import {
  FormControl,
  FormLabel,
  HStack,
  Input,
  Select,
  useToast,
} from '@chakra-ui/react';
import { FaTrafficLight } from 'react-icons/fa';
import { QueryKey, useQueryClient } from 'react-query';
import { useApiMutation } from '@/shared/services/api';

import ControlsDialog from './controls-dialog';
import ControlTypeSelect from './control-type-select';
import { CREATE_PLUGIN, UPDATE_PLUGIN } from './queries';

type ControlsPayload = {
  name: string;
  protocols: string[];
  route?: {
    id: string;
  };
  service?: {
    id: string;
  };
  config: {
    second: number;
    minute: number;
    hour: number;
    day: number;
    policy: string;
  };
  tags: string[];
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
  const mutation = useApiMutation<{ id: string; controls: string }>(
    mode == 'edit' ? UPDATE_PLUGIN : CREATE_PLUGIN
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

  const numOrNull = (value: FormDataEntryValue) =>
    Number(value) == 0 ? null : Number(value);

  const onSubmit = async (formData: FormData) => {
    try {
      const controls: ControlsPayload = {
        name: 'rate-limiting',
        protocols: ['http', 'https'],
        config: {
          second: numOrNull(formData.get('second')) as number,
          minute: numOrNull(formData.get('minute')) as number,
          hour: numOrNull(formData.get('hour')) as number,
          day: numOrNull(formData.get('day')) as number,
          policy: formData.get('policy') as string,
        },
        tags: [],
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
      if (mode == 'edit') {
        payload['pluginExtForeignKey'] = data.extForeignKey;
      }

      await mutation.mutateAsync(payload);
      client.invalidateQueries(queryKey);
      toast({
        title: 'Control updated',
        status: 'success',
        isClosable: true,
      });
    } catch (err) {
      toast({
        title: 'Control update failed',
        description: err,
        status: 'error',
        isClosable: true,
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
      data-testid="rate-limiting-control-btn"
    >
      <ControlTypeSelect
        serviceId={data?.service?.extForeignKey}
        routeId={data?.route?.extForeignKey}
      />
      <HStack spacing={4} mb={4}>
        <FormControl id="second">
          <FormLabel>Second</FormLabel>
          <Input
            variant="bc-input"
            name="second"
            placeholder="00"
            defaultValue={config.second}
            data-testid="ratelimit-second-input"
          />
        </FormControl>
        <FormControl id="minute">
          <FormLabel>Minute</FormLabel>
          <Input
            variant="bc-input"
            name="minute"
            placeholder="00"
            defaultValue={config.minute}
            data-testid="ratelimit-minute-input"
          />
        </FormControl>
        <FormControl id="hour">
          <FormLabel>Hour</FormLabel>
          <Input
            variant="bc-input"
            name="hour"
            placeholder="00"
            defaultValue={config.hour}
            data-testid="ratelimit-hour-input"
          />
        </FormControl>
        <FormControl id="day">
          <FormLabel>Day</FormLabel>
          <Input
            variant="bc-input"
            name="day"
            placeholder="00"
            defaultValue={config.day}
            data-testid="ratelimit-day-input"
          />
        </FormControl>
      </HStack>
      <FormControl id="policy">
        <FormLabel>Policy</FormLabel>
        <Select
          name="policy"
          variant="bc-input"
          data-testid="ratelimit-policy-dropdown"
          defaultValue={config.policy}
        >
          <option value="local">Local</option>
          <option value="redis">Redis</option>
        </Select>
      </FormControl>
    </ControlsDialog>
  );
};

export default RateLimiting;
