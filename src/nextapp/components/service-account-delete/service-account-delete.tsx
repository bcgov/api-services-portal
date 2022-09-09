import { useApiMutation } from '@/shared/services/api';
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
import { useQueryClient } from 'react-query';

interface ServiceAccountDeleteProps {
  id: string;
  onDelete: () => void;
}

const ServiceAccountDelete: React.FC<ServiceAccountDeleteProps> = ({
  id,
  onDelete,
}) => {
  const toast = useToast();
  const queryClient = useQueryClient();
  const { isOpen, onClose, onOpen } = useDisclosure();
  const deleteMutation = useApiMutation<{ id: string }>(mutation);
  const cancelRef = React.useRef();

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync({ id });
      queryClient.invalidateQueries('getServiceAccounts');
      toast({
        title: 'Service Account deleted',
        status: 'success',
        isClosable: true,
      });
      onClose();
      onDelete();
    } catch {
      toast({
        title: 'Service Account delete failed',
        status: 'error',
        isClosable: true,
      });
    }
  };

  return (
    <>
      <IconButton
        aria-label="delete application button"
        colorScheme="red"
        icon={<Icon as={FaTrash} />}
        onClick={onOpen}
        variant="outline"
        size="sm"
        data-testid="service-account-delete-btn"
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
          <AlertDialogHeader>Delete Service Account</AlertDialogHeader>
          <AlertDialogCloseButton />
          <AlertDialogBody>
            Are you sure you want to delete this service account? It cannot be
            undone.
          </AlertDialogBody>
          <AlertDialogFooter>
            <Button ref={cancelRef} onClick={onClose}>
              Cancel
            </Button>
            <Button
              data-testid="confirm-delete-service-acct-btn"
              colorScheme="red"
              ml={3}
              onClick={handleDelete}
            >
              Yes, Delete
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default ServiceAccountDelete;

const mutation = gql`
  mutation DeleteServiceAccount($id: ID!) {
    deleteServiceAccess(id: $id) {
      id
    }
  }
`;
