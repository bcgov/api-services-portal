import * as React from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Icon,
  Button,
  useDisclosure,
  Textarea,
} from '@chakra-ui/react';
import { FaPen } from 'react-icons/fa';

interface PluginEditorProps {
  config: string;
}

const PluginEditor: React.FC<PluginEditorProps> = ({ config }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  return (
    <>
      <Button
        leftIcon={<Icon as={FaPen} />}
        size="sm"
        onClick={onOpen}
        variant="tertiary"
      >
        Edit Config
      </Button>

      <Modal isOpen={isOpen} onClose={onClose} size="2xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Modal Title</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Textarea resize="vertical" defaultValue={config} />
          </ModalBody>

          <ModalFooter>
            <Button mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary">Save</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default PluginEditor;
