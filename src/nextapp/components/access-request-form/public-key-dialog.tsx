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
                <Box height="0.1rem"></Box>
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
                <Textarea
                  isRequired
                  height="64px"
                  name="clientCertificate"
                  variant="code"
                  placeholder={publicKeyPlaceholder}
                />
              </FormControl>
              <Heading size="sm" mb={2}>
                Issuer
              </Heading>
              <Flex align="center" mb={4}>
                <Box
                  h="40px"
                  d="flex"
                  alignItems="center"
                  backgroundColor="#C2ED9850"
                  border="2px solid"
                  borderColor="#C2ED98"
                  px={4}
                  py={1}
                  borderRadius={4}
                  flex="1"
                >
                  {issuer}
                </Box>
                <CopyButton value={issuer} />
              </Flex>
              <Heading size="sm" mb={2}>
                Token Endpoint
              </Heading>
              <Flex align="center">
                <Box
                  h="40px"
                  d="flex"
                  alignItems="center"
                  backgroundColor="#C2ED9850"
                  border="2px solid"
                  borderColor="#C2ED98"
                  px={4}
                  py={1}
                  flex="1"
                  borderRadius={4}
                >
                  {tokenEndpoint}
                </Box>
                <CopyButton value={tokenEndpoint} />
              </Flex>
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
