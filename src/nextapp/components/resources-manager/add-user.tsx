import * as React from 'react';
import {
  Button,
  Checkbox,
  CheckboxGroup,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalOverlay,
  ModalHeader,
  HStack,
  Input,
  ButtonGroup,
  FormControl,
  FormLabel,
  Icon,
  useDisclosure,
  VStack,
} from '@chakra-ui/react';
import { FaMinusCircle, FaPlusCircle } from 'react-icons/fa';

interface ShareResourceDialogProps {}

const ShareResourceDialog: React.FC<ShareResourceDialogProps> = () => {
  const { isOpen, onClose, onOpen } = useDisclosure();
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // const formData = new FormData(event.currentTarget);
  };

  return (
    <>
      <Button
        leftIcon={<Icon as={FaPlusCircle} />}
        onClick={onOpen}
        variant="primary"
      >
        Add User
      </Button>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        scrollBehavior="inside"
        size="xl"
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Add User</ModalHeader>
          <ModalBody>
            <form onSubmit={handleSubmit}>
              <VStack spacing={4}>
                <FormControl isRequired>
                  <FormLabel>Username</FormLabel>
                  <Input
                    name="username"
                    type="text"
                    placeholder="Enter username of team member you'd like to add"
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Permissions</FormLabel>
                  <CheckboxGroup>
                    <HStack spacing={4}>
                      <Checkbox value="credential-admin">
                        Credential Admin
                      </Checkbox>
                      <Checkbox value="viewer">Viewer</Checkbox>
                      <Checkbox value="api-owner">Api Owner</Checkbox>
                      <Checkbox value="client-manager">Client Manager</Checkbox>
                    </HStack>
                  </CheckboxGroup>
                </FormControl>
              </VStack>
            </form>
          </ModalBody>
          <ModalFooter>
            <ButtonGroup>
              <Button onClick={onClose}>Cancel</Button>
              <Button variant="primary">Share</Button>
            </ButtonGroup>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default ShareResourceDialog;
