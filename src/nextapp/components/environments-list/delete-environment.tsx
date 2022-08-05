import * as React from 'react';
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
import { useQueryClient } from 'react-query';
import { REMOVE_ENVIRONMENT } from '@/shared/queries/products-queries';
import { useApiMutation } from '@/shared/services/api';

interface DeleteEnvironmentProps {
  id: string;
}

const DeleteEnvironment: React.FC<DeleteEnvironmentProps> = ({ id }) => {
  const client = useQueryClient();
  const toast = useToast();
  const mutation = useApiMutation<{ id: string }>(REMOVE_ENVIRONMENT);
  const [force, setForce] = React.useState<boolean>(false);
  const [open, setOpen] = React.useState<boolean>(false);
  const cancelRef = React.useRef<HTMLButtonElement>(null);
  const onClose = () => setOpen(false);
  const onConfirm = () => setOpen(true);
  const onDelete = async () => {
    try {
      await mutation.mutateAsync({ id, force });
      setOpen(false);
      client.invalidateQueries('products');
      toast({
        title: 'Environment deleted',
        status: 'success',
        isClosable: true,
      });
    } catch (err) {
      toast({
        title: 'Environment delete failed',
        description: err,
        status: 'error',
        isClosable: true,
      });
    }
  };

  return (
    <>
      <IconButton
        aria-label="Delete Environment"
        colorScheme="red"
        size="xs"
        variant="outline"
        onClick={onConfirm}
        data-testid="prd-env-delete-btn"
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
              Are you sure? You can not undo this action afterwards.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose}>
                Cancel
              </Button>
              <Button
                data-testid="delete-env-confirmation-btn"
                colorScheme="red"
                onClick={onDelete}
                ml={3}
              >
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
