import * as React from 'react';
import {
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Text,
  useDisclosure,
  ButtonProps,
  Flex,
  VStack,
} from '@chakra-ui/react';

import LoginButtons from '../login-buttons';
import { useGlobal } from '@/shared/services/global';

interface LoginDialogProps {
  buttonText: string;
  buttonVariant?: ButtonProps['variant'];
}

const LoginDialog: React.FC<LoginDialogProps> = ({
  buttonText = 'Login',
  buttonVariant,
}) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { identities, identityContent } = useGlobal();
  const isInline = buttonVariant === 'link';
  const buttonProps = !isInline
    ? {}
    : {
        fontWeight: 'normal',
        fontSize: 'inherit',
        color: 'bc-link',
        textDecor: 'underline',
      };

  return (
    <>
      <Button onClick={onOpen} variant={buttonVariant} {...buttonProps}>
        {buttonText}
      </Button>
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Login to request access</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text>
              You will go to a secure website to log in and automatically
              return.
            </Text>
          </ModalBody>

          <VStack justifyContent="stretch" gridGap={2} px={8} pt={5} pb={6}>
            <LoginButtons
              identities={identities.developer}
              identityContent={identityContent}
              variant="inline"
            />
          </VStack>
        </ModalContent>
      </Modal>
    </>
  );
};

export default LoginDialog;
