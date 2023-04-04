import * as React from 'react';
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Box,
  Button,
  Center,
  CircularProgress,
  MenuItem,
  Tag,
  Text,
  useDisclosure,
  useToast,
} from '@chakra-ui/react';
import Link from 'next/link';
import { gql } from 'graphql-request';
import { useApi, useApiMutation } from '@/shared/services/api';
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
  const permissionQuery = useApi(
    ['deletePermissions', data.id],
    {
      query,
      variables: {
        id: data.id,
      },
    },
    {
      enabled: isOpen,
    }
  );
  const client = useQueryClient();
  const deleteEnvironment = useApiMutation(deleteMutation);
  const toast = useToast();
  const cancelRef = React.useRef();
  const canDelete = permissionQuery.data?.deleteEnvironmentPermissions.allowed;
  const reason = permissionQuery.data?.deleteEnvironmentPermissions.reason;

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
        size="lg"
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              {!canDelete
                ? 'You cannot delete an Environment in use'
                : 'Delete Environment'}
            </AlertDialogHeader>

            <AlertDialogBody>
              {permissionQuery.isLoading && (
                <Center>
                  <Box textAlign="center">
                    <CircularProgress isIndeterminate />
                    <Text>Fetching permissions</Text>
                  </Box>
                </Center>
              )}
              {!canDelete && reason}
              {canDelete && (
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
              {!canDelete && (
                <Link href="/manager/consumers">
                  <Button ml={3}>Manage Consumers</Button>
                </Link>
              )}
              {canDelete && (
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

const query = gql`
  query CheckDeleteEnvironment($id: ID!) {
    deleteEnvironmentPermissions(id: $id) {
      allowed
      reason
    }
  }
`;

const deleteMutation = gql`
  mutation DeleteEnvironment($id: ID!, $force: Boolean!) {
    forceDeleteEnvironment(id: $id, force: $force)
  }
`;
