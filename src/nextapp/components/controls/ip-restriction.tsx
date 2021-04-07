import * as React from 'react';
import {
  FormControl,
  FormLabel,
  FormHelperText,
  Input,
  useToast,
} from '@chakra-ui/react';
import { FaDoorClosed } from 'react-icons/fa';
import api, { useApi } from '@/shared/services/api';
import { useQueryClient, QueryKey, useMutation } from 'react-query';
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
    allow: string;
  };
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
  const mutation = useMutation((payload: { id: string; controls: string }) =>
    api(FULFILL_REQUEST, payload)
  );
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
          allow: formData.get('allow') as string,
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
      buttonText="IP Restritions"
      icon={FaDoorClosed}
      mode={mode}
      onSubmit={onSubmit}
      title="IP Restrition"
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
        />
        <FormHelperText>
          Comma-separated list, i.e. 1.1.1.1, 0.0.0.0
        </FormHelperText>
      </FormControl>
    </ControlsDialog>
  );
};

export default IpRestriction;
