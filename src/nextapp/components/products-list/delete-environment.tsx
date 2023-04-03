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
  Tag,
  Text,
  useDisclosure,
  useToast,
} from '@chakra-ui/react';
import Link from 'next/link';
import { gql } from 'graphql-request';
import { useApiMutation } from '@/shared/services/api';
import { Environment } from '@/shared/types/query.types';

import ActionsMenu from '../actions-menu';
import { QueryKey, useQueryClient } from 'react-query';

interface DeleteEnvironmentProps {
  data: Environment;
  queryKey: QueryKey;
  productName: string;
}

const DeleteEnvironment: React.FC<DeleteEnvironmentProps> = ({
  data,
  productName,
  queryKey,
}) => {
  const { isOpen, onClose, onOpen } = useDisclosure();
  const [isFailed, setFailed] = React.useState(false);
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
      setFailed(true);
      // toast({
      //   status: 'error',
      //   title: 'Environment deletion failed',
      //   description: err,
      //   isClosable: true,
      // });
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
        size="lg"
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              {isFailed
                ? 'You cannot delete an Environment in use'
                : 'Delete Environment'}
            </AlertDialogHeader>

            <AlertDialogBody>
              {isFailed && (
                <>
                  The <Text as="strong">{productName}</Text>{' '}
                  <Tag variant="outline">{data.name}</Tag> environment cannot be
                  deleted as there are consumer credentials associated with it.
                  Please remove all consumers linked to this environment before
                  proceeding with the deletion.
                </>
              )}
              {!isFailed && (
                <>
                  You are about to delete <Text as="strong">{productName}</Text>{' '}
                  <Tag variant="outline">{data.name}</Tag> This action cannot be
                  undone.
                </>
              )}
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose} variant="secondary">
                Cancel
              </Button>
              {isFailed && (
                <Link href="/manager/consumers">
                  <Button ml={3}>Manage Consumers</Button>
                </Link>
              )}
              {!isFailed && (
                <Button
                  variant="danger"
                  onClick={handleDeleteEnvironment}
                  ml={3}
                  data-testid="delete-env-confirmation-btn"
                >
                  Yes, Delete Environment
                </Button>
              )}
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
