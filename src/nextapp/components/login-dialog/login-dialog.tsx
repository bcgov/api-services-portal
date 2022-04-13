import * as React from 'react';
import {
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Text,
  useDisclosure,
} from '@chakra-ui/react';

import LoginButtons from '../login-buttons';

interface LoginDialogProps {
  buttonText: string;
}

const LoginDialog: React.FC<LoginDialogProps> = ({ buttonText = 'Login' }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  return (
    <>
      <Button onClick={onOpen}>{buttonText}</Button>
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Login to request access</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text mb={7}>
              Choose which of the options you want to authenticate with. You
              will go to a secure website to log in and automatically return.{' '}
            </Text>
            <Text>
              Access to certain features of the APS portal will be based on the
              account type that you choose.
            </Text>
          </ModalBody>

          <ModalFooter justifyContent="center">
            <LoginButtons />
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default LoginDialog;
