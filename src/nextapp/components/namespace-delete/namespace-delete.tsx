import * as React from 'react';
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
import { useQueryClient } from 'react-query';
import { gql } from 'graphql-request';
import { restApi, useApiMutation } from '@/shared/services/api';
import { useAuth } from '@/shared/services/auth';
import { useRouter } from 'next/router';

interface NamespaceDeleteProps {
  name: string;
  onCancel: () => void;
}

const NamespaceDelete: React.FC<NamespaceDeleteProps> = ({
  name,
  onCancel,
}) => {
  const cancelRef = React.useRef();
  const { isOpen, onClose, onOpen } = useDisclosure();
  const [force, setForce] = React.useState<boolean>(false);
  const { user } = useAuth();
  const client = useQueryClient();
  const router = useRouter();
  const toast = useToast();
  const deleteMutation = useApiMutation(mutation);

  const handleDelete = React.useCallback(async () => {
    try {
      await deleteMutation.mutateAsync({ name, force });

      if (user.namespace === name && router) {
        router.push('/manager');
        await restApi('/admin/switch', { method: 'PUT' });
      }

      toast({
        title: ' Namespace Deleted',
        status: 'success',
      });
      client.invalidateQueries();
      onClose();
    } catch (err) {
      toast({
        title: 'Namespace Delete Failed',
        description: err
          .map((e) =>
            e.data?.messages ? e.data.messages.join(',') : e.message
          )
          .join(', '),
        status: 'error',
      });
    }
  }, [client, deleteMutation, name, onClose, router, toast, user.namespace]);

  const handleCancel = React.useCallback(() => onCancel(), [onCancel]);

  React.useEffect(() => onOpen(), [name]);

  return (
    <>
      <AlertDialog
        isCentered
        motionPreset="slideInBottom"
        leastDestructiveRef={cancelRef}
        onClose={handleCancel}
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
            <Button ref={cancelRef} onClick={handleCancel}>
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

export default NamespaceDelete;

const mutation = gql`
  mutation DeleteNamespace($name: String!, $force: Boolean!) {
    forceDeleteNamespace(namespace: $name, force: $force)
  }
`;
