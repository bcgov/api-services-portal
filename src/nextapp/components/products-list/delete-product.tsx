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
import api from '@/shared/services/api';
import { useMutation, useQueryClient } from 'react-query';

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
  const mutation = useMutation(
    async (id: string) => await api(DELETE_PRODUCT, { id }),
    {
      onSuccess: () => {
        toast({
          title: 'Product Deleted',
          status: 'success',
        });
        onDeleted();
      },
    }
  );
  const onDelete = async () => {
    await mutation.mutateAsync(id);
    setIsOpen(false);
    client.invalidateQueries('products');
  };

  return (
    <>
      <Button onClick={onOpen} colorScheme="red">
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

export default DeleteProduct;
