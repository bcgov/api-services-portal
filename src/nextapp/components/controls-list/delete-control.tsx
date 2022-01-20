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
import { QueryKey, useQueryClient } from 'react-query';
import { useApiMutation } from '@/shared/services/api';

interface DeleteControlProps {
  consumerId: string;
  pluginExtForeignKey: string;
  queryKey: QueryKey;
}

const DeleteControl: React.FC<DeleteControlProps> = ({
  consumerId,
  pluginExtForeignKey,
  queryKey,
}) => {
  const toast = useToast();
  const queryClient = useQueryClient();
  const { isOpen, onClose, onOpen } = useDisclosure();
  const deleteMutation = useApiMutation<{
    consumerId: string;
    pluginExtForeignKey: string;
  }>(mutation);
  const cancelRef = React.useRef();

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync({ consumerId, pluginExtForeignKey });
      queryClient.invalidateQueries(queryKey);
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
        data-testid="remove-control-btn"
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
    deleteGatewayConsumerPlugin(
      id: $consumerId
      pluginExtForeignKey: $pluginExtForeignKey
    ) {
      id
    }
  }
`;
