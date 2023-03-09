import * as React from 'react';
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  useDisclosure,
  Button,
  FormControl,
  Input,
  FormLabel,
  useToast,
} from '@chakra-ui/react';
import { useApi, useApiMutation } from '@/shared/services/api';
import ConfirmationRequest from './confirmation-request';

interface DeleteConfirmationProps {
  confirmationText: React.ReactNode;
  data: { id: string };
  failedText: React.ReactNode;
  mutation: string;
  query?: string;
  recordType: string;
  requireValidation: boolean;
}

const DeleteConfirmation: React.FC<DeleteConfirmationProps> = ({
  confirmationText,
  data,
  failedText,
  mutation,
  recordType,
  requireValidation,
  query,
}) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const cancelRef = React.useRef();
  const isValidationRequired = Boolean(query);
  const deleteMutation = useApiMutation(mutation);
  // delete with validation (query)
  // |- validation fails
  // | |- condition required
  // | | |- fails, cannot delete
  // | |_|- succeeds, with warning
  // |- validation succeeds
  // | |- Delete
  // | |- Enter passphrase then delete
  async function handleDelete() {
    try {
      await deleteMutation.mutateAsync({ id: data.id });
    } catch (err) {
      toast({
        status: 'error',
        description: err,
        isClosable: true,
      });
    }
  }

  return (
    <AlertDialog
      isOpen={isOpen}
      leastDestructiveRef={cancelRef}
      onClose={onClose}
    >
      <AlertDialogOverlay>
        <React.Suspense fallback={<div>checking...</div>}>
          <ConfirmationRequest
            cancelRef={cancelRef}
            onCancel={onClose}
            onDelete={handleDelete}
            recordType={recordType}
          />
        </React.Suspense>
      </AlertDialogOverlay>
    </AlertDialog>
  );
};

export default DeleteConfirmation;
