import * as React from 'react';
import { Button, useDisclosure } from '@chakra-ui/react';

import NewApplicationDialog from './new-application-dialog';

interface NewApplicationProps {
  userId: string;
  refreshQueryKey: string;
}

const NewApplication: React.FC<NewApplicationProps> = ({
  userId,
  refreshQueryKey,
}) => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <>
      <Button
        isDisabled={!userId}
        onClick={onOpen}
        variant="primary"
        data-testid="create-app-btn"
      >
        Create Application
      </Button>
      <NewApplicationDialog
        open={isOpen}
        onClose={onClose}
        userId={userId}
        refreshQueryKey={refreshQueryKey}
      />
    </>
  );
};

export default NewApplication;
