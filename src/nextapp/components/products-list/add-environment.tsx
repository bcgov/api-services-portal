import * as React from 'react';
import {
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useToast,
} from '@chakra-ui/react';
import { useQueryClient } from 'react-query';
import { ADD_ENVIRONMENT } from '@/shared/queries/products-queries';
import { useApiMutation } from '@/shared/services/api';
import { kebabCase } from 'lodash';

const options: { name: string; value: string }[] = [
  { name: 'Development', value: 'dev' },
  { name: 'Sandbox', value: 'sandbox' },
  { name: 'Test', value: 'test' },
  { name: 'Production', value: 'prod' },
  { name: 'Other', value: 'other' },
];

interface AddEnvironmentProps {
  children: React.ReactNode;
  environments: string[];
  productId: string;
  productName: string;
}

const AddEnvironment: React.FC<AddEnvironmentProps> = ({
  children,
  environments,
  productId,
  productName,
}) => {
  const toast = useToast();
  const client = useQueryClient();
  const mutation = useApiMutation<{ product: string; name: string }>(
    ADD_ENVIRONMENT
  );
  const onSelect = (value: string) => async () => {
    try {
      await mutation.mutateAsync({ product: productId, name: value });
      client.invalidateQueries('products');
      toast({
        title: 'Environment Added',
        description: 'You may now configure it. By default it is not enabled.',
        status: 'success',
      });
    } catch {
      toast({
        title: 'Action Failed',
        description: 'Environment could not be added',
        status: 'error',
      });
    }
  };

  return (
    <Menu>
      <MenuButton
        as={Button}
        variant="unstyled"
        data-testid={kebabCase(productName) + '-add-env-btn'}
      >
        {children}
      </MenuButton>
      <MenuList>
        {options
          .filter((e) => !environments.includes(e.value))
          .map((e) => (
            <MenuItem
              key={e.value}
              onClick={onSelect(e.value)}
              value={e.value}
              data-testid={kebabCase(productName) + `-prd-env-item-${e.value}`}
            >
              {e.name}
            </MenuItem>
          ))}
      </MenuList>
    </Menu>
  );
};

export default AddEnvironment;
