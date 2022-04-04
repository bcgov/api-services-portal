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
  onDeleted: () => void;
}

const DeleteProduct: React.FC<DeleteProductProps> = ({ id, onDeleted }) => {
  const toast = useToast();
  const client = useQueryClient();
  const [isOpen, setIsOpen] = React.useState(false);
  const onClose = () => setIsOpen(false);
  const cancelRef = React.useRef();
  const onOpen = () => {
    setIsOpen(true);
  };
  const mutation = useApiMutation<{ id: string }>(DELETE_PRODUCT);
  const onDelete = async () => {
    try {
      await mutation.mutateAsync({ id });
      toast({
        title: 'Product Deleted',
        status: 'success',
      });
      onDeleted();
      setIsOpen(false);
      client.invalidateQueries('products');
    } catch {
      toast({
        title: 'Product Delete Failed',
        status: 'error',
      });
    }
  };

  return (
    <>
      <Button
        onClick={onOpen}
        colorScheme="red"
        data-testid="prd-edit-delete-btn"
      >
        Delete Product
      </Button>
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
              <Button ref={cancelRef} onClick={onClose}>
                Cancel
              </Button>
              <Button data-testid="confirm-delete-product-btn" colorScheme="red" onClick={onDelete} ml={3}>
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  );
};

export default DeleteProduct;
