import * as React from 'react';
import {
  FormControl,
  FormLabel,
  FormHelperText,
  Input,
  useToast,
} from '@chakra-ui/react';
import { FaDoorClosed } from 'react-icons/fa';
import { useApiMutation } from '@/shared/services/api';
import { useQueryClient, QueryKey } from 'react-query';

import ControlsDialog from './controls-dialog';
import ControlTypeSelect from './control-type-select';
import { CREATE_PLUGIN, UPDATE_PLUGIN } from './queries';

type ControlsPayload = {
  name: string;
  route?: {
    id: string;
  };
  service?: {
    id: string;
  };
  config: {
    allow: string[];
  };
  tags: string[];
};

interface IpRestrictionProps {
  data?: any;
  id: string;
  mode: 'edit' | 'create';
  queryKey: QueryKey;
}

const IpRestriction: React.FC<IpRestrictionProps> = ({
  data,
  id,
  mode,
  queryKey,
}) => {
  const client = useQueryClient();
  const mutation = useApiMutation<{
    id: string;
    controls: string;
    pluginExtForeignKey?: string;
  }>(mode == 'edit' ? UPDATE_PLUGIN : CREATE_PLUGIN);
  const toast = useToast();
  const config = data?.config
    ? JSON.parse(data.config)
    : {
        allow: [],
      };

  const onSubmit = async (formData: FormData) => {
    try {
      const controls: ControlsPayload = {
        name: 'ip-restriction',
        config: {
          allow: [formData.get('allow') as string],
        },
        tags: ['consumer'],
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
      buttonText="IP Restrictions"
      icon={FaDoorClosed}
      mode={mode}
      onSubmit={onSubmit}
      title="IP Restriction"
      data-testid="ip-restriction-control-btn"
    >
      <ControlTypeSelect
        serviceId={data?.service?.id}
        routeId={data?.route?.id}
      />
      <FormControl isRequired id="allow">
        <FormLabel>Allowed IPs</FormLabel>
        <Input
          variant="bc-input"
          name="allow"
          defaultValue={config.allow?.join(',')}
          data-testid="allow-ip-restriction-input"
        />
        <FormHelperText>
          Comma-separated list, i.e. 1.1.1.1, 0.0.0.0
        </FormHelperText>
      </FormControl>
    </ControlsDialog>
  );
};

export default IpRestriction;
