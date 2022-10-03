import * as React from 'react';
import { Button, Icon, useDisclosure } from '@chakra-ui/react';

import { FaPen } from 'react-icons/fa';
import EnvironmentEditDialog from './environment-edit-dialog';
import { Environment, Product } from '@/shared/types/query.types';
import { QueryKey } from 'react-query';

interface EnvironmentEditProps {
  data: Environment;
  product: Product;
  productQueryKey: QueryKey;
}

const EnvironmentEdit: React.FC<EnvironmentEditProps> = ({
  data,
  product,
  productQueryKey,
}) => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <>
      <Button
        leftIcon={<Icon as={FaPen} />}
        variant="ghost"
        size="sm"
        onClick={onOpen}
        data-testid={`edit-env-btn-${data.id}`}
      >
        Edit
      </Button>
      <EnvironmentEditDialog
        environment={data}
        open={isOpen}
        onClose={onClose}
        product={product}
        productQueryKey={productQueryKey}
      />
    </>
  );
};

export default EnvironmentEdit;
