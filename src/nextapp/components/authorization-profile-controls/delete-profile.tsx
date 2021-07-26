import * as React from 'react';
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
  useDisclosure,
  useToast,
} from '@chakra-ui/react';
import { gql } from 'graphql-request';
import { useQueryClient } from 'react-query';
import { useRouter } from 'next/router';

interface DeleteAuthorizationProfileProps {
  id: string;
}

const DeleteAuthorizationProfile: React.FC<DeleteAuthorizationProfileProps> = ({
  id,
}) => {
  const router = useRouter();
  const toast = useToast();
  const queryClient = useQueryClient();
  const { isOpen, onClose, onOpen } = useDisclosure();
  const deleteMutation = useApiMutation<{ id: string }>(mutation);
  const cancelRef = React.useRef();

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync({ id });
      queryClient.invalidateQueries('allApplications');
      toast({
        title: 'Profile deleted',
        status: 'success',
      });
      onClose();
      router.push('/manager/authorization-profiles');
    } catch {
      toast({
        title: 'Profile delete failed',
        status: 'error',
      });
    }
  };

  return (
    <>
      <Button colorScheme="red" onClick={onOpen} size="sm">
        Delete Profile
      </Button>
      <AlertDialog
        isCentered
        motionPreset="slideInBottom"
        leastDestructiveRef={cancelRef}
        onClose={onClose}
        isOpen={isOpen}
      >
        <AlertDialogOverlay />
        <AlertDialogContent>
          <AlertDialogHeader>Delete Authorization Profile</AlertDialogHeader>
          <AlertDialogCloseButton />
          <AlertDialogBody>
            Are you sure you want to delete this authorization profile? It
            cannot be undone.
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

export default DeleteAuthorizationProfile;

const mutation = gql`
  mutation DeleteAuthzProfile($id: ID!) {
    deleteCredentialIssuer(id: $id) {
      id
    }
  }
`;
