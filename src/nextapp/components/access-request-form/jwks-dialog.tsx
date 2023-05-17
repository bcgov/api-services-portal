import * as React from 'react';
import {
  Box,
  Button,
  ButtonGroup,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useToast,
} from '@chakra-ui/react';
import CopyButton from '../copy-button/copy-button';
import { useApiMutation } from '@/shared/services/api';
import { controlsMutation } from './shared';
import { useQueryClient } from 'react-query';

interface JwksDialogProps {
  id: string;
  issuer: string;
  tokenEndpoint: string;
  jwksUrl: string;
  isOpen: boolean;
  onClose: () => void;
}

const JwksDialog: React.FC<JwksDialogProps> = ({
  id,
  issuer,
  tokenEndpoint,
  jwksUrl,
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
          title: 'JWKS Url updated',
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
          <ModalHeader>Update JWKS URL</ModalHeader>
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
                <FormLabel>Current JWKS URL</FormLabel>
                <Flex>
                  <Input
                    isRequired
                    readOnly
                    placeholder="https://"
                    variant="bc-input"
                    type="url"
                    value={jwksUrl}
                  />
                  <CopyButton value={jwksUrl} />
                </Flex>
              </FormControl>
              <FormControl mb={4}>
                <FormLabel>New JWKS URL</FormLabel>
                <Input
                  isRequired
                  isDisabled={mutate.isLoading}
                  placeholder="https://"
                  name="jwksUrl"
                  variant="bc-input"
                  type="url"
                />
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
                data-testid="jwks-update-button"
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

export default JwksDialog;
