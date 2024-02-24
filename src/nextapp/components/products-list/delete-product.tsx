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
import { QueryKey, useQueryClient } from 'react-query';
import { useApiMutation } from '@/shared/services/api';
import { gql } from 'graphql-request';

interface DeleteProductProps {
  id: string;
  isOpen: boolean;
  onClose: () => void;
  onDeleted: () => void;
  queryKey: QueryKey;
}

const DeleteProduct: React.FC<DeleteProductProps> = ({
  id,
  isOpen,
  onClose,
  onDeleted,
  queryKey,
}) => {
  const toast = useToast();
  const client = useQueryClient();
  const cancelRef = React.useRef();
  const mutate = useApiMutation<{ id: string }>(mutation);
  const onDelete = async () => {
    try {
      await mutate.mutateAsync({ id });
      toast({
        title: 'Product deleted',
        status: 'success',
        isClosable: true,
      });
      onDeleted();
      client.invalidateQueries(queryKey);
    } catch(e) {
      toast({
        title: 'Product delete failed',
        description: e,
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

const mutation = gql`
  mutation RemoveProduct($id: ID!) {
    deleteProduct(id: $id) {
      id
    }
  }
`;
