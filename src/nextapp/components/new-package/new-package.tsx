import * as React from 'react';
import { Button, Icon, useDisclosure } from '@chakra-ui/react';

import NewPackageDialog from './new-package-dialog';
import { FaLayerGroup } from 'react-icons/fa';

const NewPackage: React.FC = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <>
      <Button
        variant="primary"
        onClick={onOpen}
        leftIcon={<Icon as={FaLayerGroup} />}
      >
        New Package
      </Button>
      <NewPackageDialog open={isOpen} onClose={onClose} />
    </>
  );
};

export default NewPackage;
