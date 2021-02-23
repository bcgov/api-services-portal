import * as React from 'react';
import { Button, Icon, useDisclosure } from '@chakra-ui/react';

import NewProductDialog from './new-product-dialog';
import { FaLayerGroup } from 'react-icons/fa';

const NewProduct: React.FC = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <>
      <Button
        variant="primary"
        onClick={onOpen}
        leftIcon={<Icon as={FaLayerGroup} />}
      >
        New Product
      </Button>
      <NewProductDialog open={isOpen} onClose={onClose} />
    </>
  );
};

export default NewProduct;
