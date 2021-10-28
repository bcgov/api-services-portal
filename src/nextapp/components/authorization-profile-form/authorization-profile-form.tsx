import * as React from 'react';
import { useDisclosure } from '@chakra-ui/react';

import AuthorizationProfileDialog from './authorization-profile-dialog';
import { CredentialIssuer } from '@/shared/types/query.types';

interface AuthorizationProfileFormProps {
  children: React.ReactElement;
  data?: CredentialIssuer;
  id?: string;
  open?: boolean;
}

const AuthorizationProfileForm: React.FC<AuthorizationProfileFormProps> = ({
  children,
  data,
  id,
  open,
}) => {
  const { isOpen, onClose, onOpen } = useDisclosure();
  return (
    <>
      <AuthorizationProfileDialog
        data={data}
        id={id}
        open={open ?? isOpen}
        onClose={onClose}
      />
      {React.cloneElement(children, {
        onClick: onOpen,
      })}
    </>
  );
};

export default AuthorizationProfileForm;
