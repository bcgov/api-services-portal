import * as React from 'react';
import {
  Box,
  Button,
  ButtonGroup,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Textarea,
  useToast,
} from '@chakra-ui/react';

import CopyButton from '../copy-button/copy-button';
import { useApiMutation } from '@/shared/services/api';
import { controlsMutation, publicKeyPlaceholder } from './shared';
import { useQueryClient } from 'react-query';

interface PublicKeyDialogProps {
  id: string;
  issuer: string;
  tokenEndpoint: string;
  clientCertificate: string;
  isOpen: boolean;
  onClose: () => void;
}

const PublicKeyDialog: React.FC<PublicKeyDialogProps> = ({
  id,
  issuer,
  tokenEndpoint,
  clientCertificate,
  isOpen,
  onClose,
}) => {
  const client = useQueryClient();
  const mutate = useApiMutation(controlsMutation);
  const toast = useToast();

  const formRef = React.useRef(null);
  const handleSubmitClick = async () => {
    if (formRef?.current.checkValidity()) {
      try {
        const form = new FormData(formRef?.current);
        const controls = Object.fromEntries(form);
        const payload = {
          id,
          controls,
        };
        await mutate.mutateAsync(payload);
        toast({
          title: 'Public Key updated',
          status: 'success',
          isClosable: true,
        });
        client.invalidateQueries('allServiceAccesses');
        onClose();
      } catch (err) {
        toast({
          title: 'Update failed',
          description: err,
          status: 'error',
          isClosable: true,
        });
      }
    } else {
      formRef?.current.reportValidity();
    }
  };

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
          <ModalHeader>Update Public Key</ModalHeader>
          <ModalBody>
            <Box
              as="form"
              ref={formRef}
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
                    isDisabled={mutate.isLoading}
                    height="64px"
                    variant="code"
                    value={clientCertificate}
                  />
                  <CopyButton value={clientCertificate} />
                </Flex>
              </FormControl>
              <FormControl mb={4}>
                <FormLabel>New Public Key</FormLabel>
                <Flex>
                  <Textarea
                    isRequired
                    height="64px"
                    name="clientCertificate"
                    variant="code"
                    placeholder={publicKeyPlaceholder}
                  />
                </Flex>
              </FormControl>
              <Heading size="sm" mb={2}>
                Issuer
              </Heading>
              <Box
                h="40px"
                d="flex"
                alignItems="center"
                backgroundColor="#C2ED9850"
                border="1px solid"
                borderColor="#C2ED98"
                px={4}
                py={1}
                borderRadius={4}
                mb={4}
              >
                {issuer}
              </Box>
              <Heading size="sm" mb={2}>
                Token Endpoint
              </Heading>
              <Box
                h="40px"
                d="flex"
                alignItems="center"
                backgroundColor="#C2ED9850"
                border="1px solid"
                borderColor="#C2ED98"
                px={4}
                py={1}
                borderRadius={4}
              >
                {tokenEndpoint}
              </Box>
            </Box>
          </ModalBody>
          <ModalFooter>
            <ButtonGroup>
              <Button variant="secondary" onClick={onClose}>
                Cancel
              </Button>
              <Button
                isDisabled={mutate.isLoading}
                onClick={handleSubmitClick}
                data-testid="public-key-update-button"
              >
                {mutate.isLoading ? 'Updating...' : 'Update'}
              </Button>
            </ButtonGroup>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default PublicKeyDialog;
