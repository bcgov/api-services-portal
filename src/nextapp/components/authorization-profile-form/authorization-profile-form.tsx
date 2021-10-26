import * as React from 'react';
import { useDisclosure } from '@chakra-ui/react';

import AuthorizationProfileDialog from './authorization-profile-dialog';

interface AuthorizationProfileFormProps {
  children: React.ReactElement;
  id?: string;
}

const AuthorizationProfileForm: React.FC<AuthorizationProfileFormProps> = ({
  children,
  id,
}) => {
  const { isOpen, onClose, onOpen } = useDisclosure();
  return (
    <>
      <AuthorizationProfileDialog id={id} open={isOpen} onClose={onClose} />
      {React.cloneElement(children, {
        onClick: onOpen,
      })}
    </>
  );
};

export default AuthorizationProfileForm;
