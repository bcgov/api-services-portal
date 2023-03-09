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
} from '@chakra-ui/react';
import { useApi, useApiMutation } from '@/shared/services/api';

interface ConfirmationRequestProps {
  cancelRef: React.Ref<any>;
  onCancel: () => void;
  onDelete: () => Promise<void>;
  query?: string;
  recordType: string;
}

const ConfirmationRequest: React.FC<ConfirmationRequestProps> = ({
  cancelRef,
  onCancel,
  onDelete,
  query,
  recordType,
}) => {
  const { data } = useApi(
    ['deleteQuery'],
    { query },
    {
      suspense: true,
    }
  );

  return (
    <AlertDialogContent>
      <AlertDialogHeader fontSize="lg" fontWeight="bold">
        {`Delete ${recordType}?`}
      </AlertDialogHeader>

      <AlertDialogBody>
        {data}
        <FormControl width="100%">
          <FormLabel>Type the DELETE to confirm.</FormLabel>
          <Input />
        </FormControl>
      </AlertDialogBody>

      <AlertDialogFooter>
        <Button ref={cancelRef} onClick={onCancel}>
          Cancel
        </Button>
        <Button colorScheme="red" onClick={onDelete} ml={3}>
          {`Yes, Delete ${recordType}`}
        </Button>
      </AlertDialogFooter>
    </AlertDialogContent>
  );
};

export default ConfirmationRequest;
