import * as React from 'react';
import api from '@/shared/services/api';
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Button,
  Icon,
  IconButton,
  useToast,
} from '@chakra-ui/react';
import { FaTrash } from 'react-icons/fa';
import { useMutation, useQueryClient } from 'react-query';
import { REMOVE_ENVIRONMENT } from '@/shared/queries/packages-queries';

interface DeleteEnvironmentProps {
  id: string;
}

const DeleteEnvironment: React.FC<DeleteEnvironmentProps> = ({ id }) => {
  const client = useQueryClient();
  const toast = useToast();
  const mutation = useMutation(
    async (id: string) => await api(REMOVE_ENVIRONMENT, { id }),
    {
      onSuccess: () => {
        toast({
          title: 'Environment Deleted',
          status: 'success',
        });
      },
    }
  );
  const [open, setOpen] = React.useState<boolean>(false);
  const cancelRef = React.useRef<HTMLButtonElement>(null);
  const onClose = () => setOpen(false);
  const onConfirm = () => setOpen(true);
  const onDelete = async () => {
    await mutation.mutateAsync(id);
    setOpen(false);
    client.invalidateQueries('packages');
  };

  return (
    <>
      <IconButton
        aria-label="Delete Environment"
        colorScheme="red"
        size="sm"
        onClick={onConfirm}
      >
        <Icon as={FaTrash} />
      </IconButton>

      <AlertDialog
        isOpen={open}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete Environment
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure? You can't undo this action afterwards.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose}>
                Cancel
              </Button>
              <Button colorScheme="red" onClick={onDelete} ml={3}>
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  );
};

export default DeleteEnvironment;
