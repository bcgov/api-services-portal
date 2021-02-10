import * as React from 'react';
import { Button, useDisclosure } from '@chakra-ui/react';

import NewPackageDialog from './new-package-dialog';

const NewPackage: React.FC = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <>
      <Button variant="primary" onClick={onOpen}>
        New Package
      </Button>
      <NewPackageDialog open={isOpen} onClose={onClose} />
    </>
  );
};

export default NewPackage;
