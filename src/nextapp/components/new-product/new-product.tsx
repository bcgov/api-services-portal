import * as React from 'react';
import { Button, Icon, useDisclosure } from '@chakra-ui/react';

import NewProductDialog from './new-product-dialog';
import { FaLayerGroup } from 'react-icons/fa';
import { QueryKey } from 'react-query';

interface NewProductProps {
  queryKey: QueryKey;
}

const NewProduct: React.FC<NewProductProps> = ({ queryKey }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <>
      <Button
        variant="primary"
        onClick={onOpen}
        leftIcon={<Icon as={FaLayerGroup} />}
        data-testid="prds-new-btn"
      >
        New Product
      </Button>
      <NewProductDialog open={isOpen} onClose={onClose} queryKey={queryKey} />
    </>
  );
};

export default NewProduct;
