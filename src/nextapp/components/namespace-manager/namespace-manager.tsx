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
  Link,
  IconButton,
  Divider,
  Spacer,
  Center,
  Heading,
} from '@chakra-ui/react';
import type { NamespaceData } from '@/shared/types/app.types';
import { FaTrash, FaDownload } from 'react-icons/fa';

import NamespaceDelete from '../namespace-delete';

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
  const [namespaceToDelete, setNamespaceToDelete] = React.useState<
    string | null
  >(null);
  const handleDeleteNamespace = React.useCallback(
    (name: string) => () => {
      setNamespaceToDelete(name);
    },
    [setNamespaceToDelete]
  );
  const handleCancel = React.useCallback(() => {
    setNamespaceToDelete(null);
  }, [setNamespaceToDelete]);

  return (
    <>
      {namespaceToDelete && (
        <NamespaceDelete name={namespaceToDelete} onCancel={handleCancel} />
      )}
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        scrollBehavior="inside"
        size="xl"
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Manage Namespaces</ModalHeader>
          <ModalBody px={0} maxH={300}>
            <Box px={6} pb={4}>
              <Text>
                All namespaces listed below may be removed, but this is
                permament. Proceed with caution.
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
                sx={{
                  _hover: {
                    bgColor: 'blue.50',
                    '& .namespace-manager-delete': {
                      opacity: 1,
                    },
                  },
                }}
              >
                <Text>{n.name}</Text>
                <IconButton
                  aria-label="Delete namespace button"
                  size="xs"
                  colorScheme="red"
                  opacity={0}
                  variant="outline"
                  className="namespace-manager-delete"
                  onClick={handleDeleteNamespace(n.name)}
                >
                  <Icon as={FaTrash} />
                </IconButton>
              </Flex>
            ))}
          </ModalBody>
          <Divider />
          <ModalFooter>
            <ButtonGroup justifyItems="space-between" alignItems="center">
              <Button leftIcon={<Icon as={FaDownload} />} variant="secondary">
                <Link href="/int/api/namespaces/report" download>
                  Export Report
                </Link>
              </Button>
              <Button onClick={onClose} variant="primary">
                Done
              </Button>
            </ButtonGroup>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default NamespaceManager;
