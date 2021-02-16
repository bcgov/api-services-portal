import * as React from 'react';
import api from '@/shared/services/api';
import {
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useToast,
} from '@chakra-ui/react';
import { useMutation, useQueryClient } from 'react-query';
import { ADD_ENVIRONMENT } from '@/shared/queries/packages-queries';

const environments: { name: string; value: string }[] = [
  { name: 'Development', value: 'dev' },
  { name: 'Sandbox', value: 'sandbox' },
  { name: 'Test', value: 'test' },
  { name: 'Production', value: 'prod' },
  { name: 'Other', value: 'other' },
];

interface AddEnvironmentProps {
  children: React.ReactNode;
  packageId: string;
}

const AddEnvironment: React.FC<AddEnvironmentProps> = ({
  children,
  packageId,
}) => {
  const toast = useToast();
  const client = useQueryClient();
  const mutation = useMutation(
    async (value: string) =>
      await api(ADD_ENVIRONMENT, { package: packageId, name: value }),
    {
      onSuccess: () => {
        client.invalidateQueries('packages');
        toast({
          title: 'Environment Added',
          description:
            'You may now configure it. By default it is not enabled.',
          status: 'success',
        });
      },
      onError: () => {
        toast({
          title: 'Action Failed',
          description: 'Environment could not be added',
          status: 'error',
        });
      },
    }
  );
  const onSelect = (value: string) => async () => {
    await mutation.mutateAsync(value);
  };

  return (
    <Menu>
      <MenuButton>{children}</MenuButton>
      <MenuList>
        {environments.map((e) => (
          <MenuItem key={e.value} onClick={onSelect(e.value)} value={e.value}>
            {e.name}
          </MenuItem>
        ))}
      </MenuList>
    </Menu>
  );
};

export default AddEnvironment;
