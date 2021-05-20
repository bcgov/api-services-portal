import * as React from 'react';
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalOverlay,
  ModalHeader,
  ButtonGroup,
  Icon,
  Box,
  Text,
  Flex,
  IconButton,
  Divider,
  Center,
  Heading,
} from '@chakra-ui/react';
import type { NamespaceData } from '@/shared/types/app.types';
import { FaTrash } from 'react-icons/fa';

import DeleteNamespace from './delete-namespace';

interface NamespaceManagerProps {
  data: NamespaceData[];
  isOpen: boolean;
  onClose: () => void;
}

const NamespaceManager: React.FC<NamespaceManagerProps> = ({
  data,
  isOpen,
  onClose,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} scrollBehavior="inside" size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Manage Namespaces</ModalHeader>
        <ModalBody px={0}>
          <Box px={6} pb={4}>
            <Text>
              All namespaces listed below may be removed, but this is permament.
              Proceed with caution.
            </Text>
          </Box>
          <Divider />
          {data.length <= 0 && (
            <Center>
              <Box my={8}>
                <Heading mb={2} size="sm">
                  You have no namespaces
                </Heading>
                <Text fontSize="sm">Create a namespace to manage.</Text>
              </Box>
            </Center>
          )}
          {data.map((n) => (
            <Flex
              key={n.id}
              align="center"
              justify="space-between"
              py={2}
              px={6}
              sx={{ _hover: { bgColor: 'blue.50' } }}
            >
              <Text>{n.name}</Text>
              <DeleteNamespace name={n.name} />
            </Flex>
          ))}
        </ModalBody>
        <ModalFooter>
          <ButtonGroup>
            <Button onClick={onClose} variant="primary">
              Done
            </Button>
          </ButtonGroup>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default NamespaceManager;
