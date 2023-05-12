import * as React from 'react';
import {
  Box,
  Button,
  ButtonGroup,
  Flex,
  FormControl,
  FormLabel,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Textarea,
} from '@chakra-ui/react';

import AccessRequestCredentials from './access-request-credentials';
import CopyButton from '../copy-button/copy-button';

interface PublicKeyDialogProps {
  id: string;
  clientCertificate: string;
  isOpen: boolean;
  onClose: () => void;
}

const PublicKeyDialog: React.FC<PublicKeyDialogProps> = ({
  id,
  clientCertificate,
  isOpen,
  onClose,
}) => {
  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        scrollBehavior="inside"
        size="xl"
      >
        <ModalOverlay />
        <ModalContent minW="75%">
          <ModalHeader>Update JWKS URL</ModalHeader>
          <ModalBody>
            <Box
              p={4}
              borderRadius={4}
              border="1px solid"
              borderColor="bc-outline"
            >
              <FormControl mb={4}>
                <FormLabel>Current Public Key</FormLabel>
                <Flex>
                  <Textarea
                    isRequired
                    height="64px"
                    name="publicKey"
                    variant="bc-input"
                    value={clientCertificate}
                  />
                  <CopyButton value="alskdfjalsjfalskdfjlsdkj" />
                </Flex>
              </FormControl>
              <FormControl mb={4}>
                <FormLabel>New Public Key</FormLabel>
                <Flex>
                  <Textarea
                    isRequired
                    height="64px"
                    name="publicKey"
                    variant="bc-input"
                  />
                  <CopyButton value="alskdfjalsjfalskdfjlsdkj" />
                </Flex>
              </FormControl>
            </Box>
          </ModalBody>
          <ModalFooter>
            <ButtonGroup>
              <Button variant="secondary" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={onClose} data-testid="public-key-update-button">
                Update
              </Button>
            </ButtonGroup>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default PublicKeyDialog;
