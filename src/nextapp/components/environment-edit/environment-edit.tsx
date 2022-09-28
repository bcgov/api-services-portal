import * as React from 'react';
import { Button, Icon, useDisclosure } from '@chakra-ui/react';

import { FaPen } from 'react-icons/fa';
import EnvironmentEditDialog from './environment-edit-dialog';
import { Environment, Product } from '@/shared/types/query.types';

interface EnvironmentEditProps {
  data: Environment;
  product: Product;
}

const EnvironmentEdit: React.FC<EnvironmentEditProps> = ({ data, product }) => {
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
      />
    </>
  );
};

export default EnvironmentEdit;
