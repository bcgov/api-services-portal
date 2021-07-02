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

interface ClientDeleteProps {
  // id: string;
}

const ClientDelete: React.FC<ClientDeleteProps> = () => {
  const toast = useToast();
  const queryClient = useQueryClient();
  const { isOpen, onClose, onOpen } = useDisclosure();
  const deleteMutation = useApiMutation<{ id: string }>(mutation);
  const cancelRef = React.useRef();

  const handleDelete = async () => {
    try {
      // await deleteMutation.mutateAsync({ id });
      // queryClient.invalidateQueries('allApplications');
      // toast({
      //   title: 'Issuer Environment deleted',
      //   status: 'success',
      // });
      onClose();
    } catch {
      toast({
        title: 'Issuer Environment delete failed',
        status: 'error',
      });
    }
  };

  return (
    <>
      <IconButton
        aria-label="delete issuer environment button"
        colorScheme="red"
        icon={<Icon as={FaTrash} />}
        onClick={onOpen}
        variant="outline"
        size="sm"
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
          <AlertDialogHeader>Delete Issuer Environment</AlertDialogHeader>
          <AlertDialogCloseButton />
          <AlertDialogBody>
            Are you sure you want to delete this issuer environment? It cannot
            be undone.
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

export default ClientDelete;

const mutation = gql`
  mutation Remove($id: ID!) {
    deleteApplication(id: $id) {
      name
      id
    }
  }
`;
