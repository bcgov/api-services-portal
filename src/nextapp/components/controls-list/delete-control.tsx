import api from '@/shared/services/api';
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogCloseButton,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Button,
  Icon,
  IconButton,
  useDisclosure,
  useToast,
} from '@chakra-ui/react';
import { gql } from 'graphql-request';
import * as React from 'react';
import { FaTrash } from 'react-icons/fa';
import { useMutation, useQueryClient } from 'react-query';

interface DeleteControlProps {
  consumerId: string;
  pluginExtForeignKey: string;
}

const DeleteControl: React.FC<DeleteControlProps> = ({ consumerId, pluginExtForeignKey }) => {
  const toast = useToast();
  const queryClient = useQueryClient();
  const { isOpen, onClose, onOpen } = useDisclosure();
  const deleteMutation = useMutation((keys: { consumerId: string, pluginExtForeignKey: string}) => api(mutation, keys));
  const cancelRef = React.useRef();

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync({consumerId, pluginExtForeignKey});
      queryClient.invalidateQueries(['consumer', consumerId]);
      toast({
        title: 'Control removed',
        status: 'success',
      });
      onClose();
    } catch {
      toast({
        title: 'Control could not be removed',
        status: 'error',
      });
    }
  };

  return (
    <>
      <IconButton
        aria-label="remove control button"
        icon={<Icon as={FaTrash} />}
        variant="outline"
        size="xs"
        onClick={onOpen}
        colorScheme="red"
      />
      <AlertDialog
        isCentered
        motionPreset="slideInBottom"
        leastDestructiveRef={cancelRef}
        onClose={onClose}
        isOpen={isOpen}
      >
        <AlertDialogOverlay />
        <AlertDialogContent>
          <AlertDialogHeader>Delete Control</AlertDialogHeader>
          <AlertDialogCloseButton />
          <AlertDialogBody>
            Are you sure you want to remove this control? It cannot be undone.
          </AlertDialogBody>
          <AlertDialogFooter>
            <Button ref={cancelRef} onClick={onClose}>
              Cancel
            </Button>
            <Button colorScheme="red" ml={3} onClick={handleDelete}>
              Yes, Delete
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default DeleteControl;

const mutation = gql`
  mutation Remove($consumerId: ID!, $pluginExtForeignKey: String!) {
    deleteGatewayConsumerPlugin(id: $consumerId, pluginExtForeignKey: $pluginExtForeignKey) {
      id
    }
  }
`;
