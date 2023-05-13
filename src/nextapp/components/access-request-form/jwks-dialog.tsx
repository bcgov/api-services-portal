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
} from '@chakra-ui/react';
import CopyButton from '../copy-button/copy-button';

interface JwksDialogProps {
  id: string;
  jwksUrl: string;
  isOpen: boolean;
  onClose: () => void;
}

const JwksDialog: React.FC<JwksDialogProps> = ({
  id,
  jwksUrl,
  isOpen,
  onClose,
}) => {
  const formRef = React.useRef(null);
  const handleSubmitClick = () => {
    if (formRef?.current.checkValidity()) {
      const form = new FormData(formRef?.current);
      const payload = Object.fromEntries(form);
      onClose();
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
                  placeholder="https://"
                  name="jwksUrl"
                  variant="bc-input"
                  type="url"
                />
              </FormControl>
              <Heading size="sm" mb={2}>
                Client ID
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
                c7e5189b-675e-4701-95b8-f684ca8497de
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
                c7e5189b-675e-4701-95b8-f684ca8497de
              </Box>
            </Box>
          </ModalBody>
          <ModalFooter>
            <ButtonGroup>
              <Button variant="secondary" onClick={onClose}>
                Cancel
              </Button>
              <Button
                onClick={handleSubmitClick}
                data-testid="jwks-update-button"
              >
                Update
              </Button>
            </ButtonGroup>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default JwksDialog;
