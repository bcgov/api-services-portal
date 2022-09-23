import * as React from 'react';
import {
  Button,
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter,
  useToast,
} from '@chakra-ui/react';
import { DELETE_PRODUCT } from '@/shared/queries/products-queries';
import { useQueryClient } from 'react-query';
import { useApiMutation } from '@/shared/services/api';

interface DeleteProductProps {
  id: string;
  isOpen: boolean;
  onClose: () => void;
  onDeleted: () => void;
}

const DeleteProduct: React.FC<DeleteProductProps> = ({
  id,
  isOpen,
  onClose,
  onDeleted,
}) => {
  const toast = useToast();
  const client = useQueryClient();
  const cancelRef = React.useRef();
  const mutation = useApiMutation<{ id: string }>(DELETE_PRODUCT);
  const onDelete = async () => {
    try {
      await mutation.mutateAsync({ id });
      toast({
        title: 'Product deleted',
        status: 'success',
        isClosable: true,
      });
      onDeleted();
      client.invalidateQueries('products');
    } catch {
      toast({
        title: 'Product delete failed',
        status: 'error',
        isClosable: true,
      });
    }
  };

  return (
    <AlertDialog
      isOpen={isOpen}
      leastDestructiveRef={cancelRef}
      onClose={onClose}
    >
      <AlertDialogOverlay>
        <AlertDialogContent>
          <AlertDialogHeader fontSize="lg" fontWeight="bold">
            Delete Product
          </AlertDialogHeader>

          <AlertDialogBody>
            Are you sure? You can not undo this action afterwards.
          </AlertDialogBody>

          <AlertDialogFooter>
            <Button ref={cancelRef} onClick={onClose} variant="secondary">
              Cancel
            </Button>
            <Button
              data-testid="confirm-delete-product-btn"
              onClick={onDelete}
              ml={3}
              variant="danger"
            >
              Delete
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogOverlay>
    </AlertDialog>
  );
};

export default DeleteProduct;
