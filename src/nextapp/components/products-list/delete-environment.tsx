import * as React from 'react';
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Button,
  MenuItem,
  useDisclosure,
  useToast,
} from '@chakra-ui/react';
import { gql } from 'graphql-request';
import { useApiMutation } from '@/shared/services/api';
import { Environment } from '@/shared/types/query.types';

import ActionsMenu from '../actions-menu';
import { QueryKey, useQueryClient } from 'react-query';

interface DeleteEnvironmentProps {
  data: Environment;
  queryKey: QueryKey;
}

const DeleteEnvironment: React.FC<DeleteEnvironmentProps> = ({
  data,
  queryKey,
}) => {
  const { isOpen, onClose, onOpen } = useDisclosure();
  const client = useQueryClient();
  const deleteEnvironment = useApiMutation(deleteMutation);
  const toast = useToast();
  const cancelRef = React.useRef();

  const handleDeleteEnvironment = async () => {
    try {
      await deleteEnvironment.mutateAsync({ id: data.id, force: false });
      client.invalidateQueries(queryKey);
      toast({
        status: 'success',
        title: `${data.name} environment deleted`,
        isClosable: true,
      });
    } catch (err) {
      toast({
        status: 'error',
        title: 'Environment deletion failed',
        description: err,
        isClosable: true,
      });
    }
  };

  return (
    <>
      <ActionsMenu
        data-testid={`delete-auto-test-product-${data.name}-more-options-btn`}
      >
        <MenuItem
          color="bc-error"
          onClick={onOpen}
          data-testid={`delete-auto-test-product-${data.name}-delete-btn`}
        >
          Delete Environment...
        </MenuItem>
      </ActionsMenu>
      <AlertDialog
        isOpen={isOpen}
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
              <Button ref={cancelRef} onClick={onClose} variant="secondary">
                Cancel
              </Button>
              <Button variant="danger" onClick={handleDeleteEnvironment} ml={3} data-testid="delete-env-confirmation-btn">
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

const deleteMutation = gql`
  mutation DeleteEnvironment($id: ID!, $force: Boolean!) {
    forceDeleteEnvironment(id: $id, force: $force)
  }
`;
