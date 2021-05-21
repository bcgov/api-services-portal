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
import { useMutation, useQueryClient } from 'react-query';
import { restApi } from '@/shared/services/api';
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
  const handleCancel = React.useCallback(() => onCancel(), [onCancel]);

  React.useEffect(() => onOpen(), [onOpen]);

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
