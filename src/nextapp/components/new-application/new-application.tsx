import * as React from 'react';
import { Button, useDisclosure } from '@chakra-ui/react';

import NewApplicationDialog from './new-application-dialog';

interface NewApplicationProps {
  userId: string;
}

const NewApplication: React.FC<NewApplicationProps> = ({ userId }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <>
      <Button isDisabled={!userId} onClick={onOpen} variant="primary">
        Create Application
      </Button>
      <NewApplicationDialog open={isOpen} onClose={onClose} userId={userId} />
    </>
  );
};

export default NewApplication;
