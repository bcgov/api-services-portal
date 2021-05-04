import * as React from 'react';
import { Button, useDisclosure } from '@chakra-ui/react';

import NewIssuerEnvironmentDialog from './new-issuer-environment-dialog';

interface NewIssuerEnvironmentProps {
    onCreate: (obj: any) => void
    mode: string
}

const NewIssuerEnvironment: React.FC<NewIssuerEnvironmentProps> = ({ onCreate, mode }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <>
      <Button isDisabled={false} onClick={onOpen} variant="primary">
        Add Environment
      </Button>
      <NewIssuerEnvironmentDialog mode={mode} open={isOpen} onClose={onClose} onCreate={onCreate} />
    </>
  );
};

export default NewIssuerEnvironment;
