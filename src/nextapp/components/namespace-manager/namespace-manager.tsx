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
  useToast,
  Box,
  Text,
  Flex,
  IconButton,
  Divider,
} from '@chakra-ui/react';
import type { NamespaceData } from '@/shared/types/app.types';
import { FaTrash } from 'react-icons/fa';
import { useMutation, useQueryClient } from 'react-query';
import { restApi } from '@/shared/services/api';

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
  const client = useQueryClient();
  const toast = useToast();
  const mutation = useMutation((name: string) =>
    restApi(`/gw/api/namespaces/${name}`, {
      method: 'DELETE',
      body: JSON.stringify({ name: name }),
    })
  );

  const handleDelete = React.useCallback(
    (name: string) => async () => {
      try {
        await mutation.mutateAsync(name);
        client.invalidateQueries('allNamespaces');
        toast({
          title: ' Namespace Deleted',
          status: 'success',
        });
      } catch (err) {
        toast({
          title: 'Delete Namespace Failed',
          status: 'error',
        });
      }
    },
    [client, mutation, toast]
  );

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
              <IconButton
                aria-label="Delete namespace button"
                isDisabled={mutation.isLoading}
                size="xs"
                colorScheme="red"
<<<<<<< HEAD
                variant="outline"
=======
>>>>>>> 110fd95acee9f6f43ddf3107ad623e01b548b48a
                onClick={handleDelete(n.name)}
              >
                <Icon as={FaTrash} />
              </IconButton>
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
