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
import { useMutation, useQueryClient } from 'react-query';
import { restApi } from '@/shared/services/api';
import { useAuth } from '@/shared/services/auth';
import { useRouter } from 'next/router';

interface DeleteApplicationProps {
  name: string;
}

const DeleteNamespace: React.FC<DeleteApplicationProps> = ({ name }) => {
  const cancelRef = React.useRef();
  const { isOpen, onClose, onOpen } = useDisclosure();
  const { user } = useAuth();
  const client = useQueryClient();
  const router = useRouter();
  const toast = useToast();
  const mutation = useMutation((name: string) =>
    restApi(`/gw/api/namespaces/${name}`, {
      method: 'DELETE',
      body: JSON.stringify({ name }),
    })
  );

  const handleDelete = React.useCallback(async () => {
    try {
      await mutation.mutateAsync(name);

      if (user.namespace === name && router) {
        router.push('/manager');
      }

      toast({
        title: ' Namespace Deleted',
        status: 'success',
      });
      client.invalidateQueries();
    } catch (err) {
      toast({
        title: 'Delete Namespace Failed',
        status: 'error',
      });
    }
  }, [client, mutation, name, router, toast, user.namespace]);

  return (
    <>
      <IconButton
        aria-label="Delete namespace button"
        isDisabled={mutation.isLoading}
        size="xs"
        colorScheme="red"
        variant="outline"
        onClick={onOpen}
      >
        <Icon as={FaTrash} />
      </IconButton>
      <AlertDialog
        isCentered
        motionPreset="slideInBottom"
        leastDestructiveRef={cancelRef}
        onClose={onClose}
        isOpen={isOpen}
      >
        <AlertDialogOverlay />
        <AlertDialogContent>
          <AlertDialogHeader>{`Delete ${name} Namespace`}</AlertDialogHeader>
          <AlertDialogCloseButton />
          <AlertDialogBody>
            {`Are you sure you want to delete the ${name} namespace? It cannot be undone.`}
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

export default DeleteNamespace;
