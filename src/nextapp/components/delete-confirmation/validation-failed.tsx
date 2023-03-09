import * as React from 'react';
import {
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  Button,
} from '@chakra-ui/react';

interface DeleteConfirmationProps {
  cancelRef: React.Ref<any>;
  failedText: React.ReactNode;
  onClose: () => void;
  recordType: string;
}

const DeleteConfirmation: React.FC<DeleteConfirmationProps> = ({
  cancelRef,
  failedText,
  onClose,
  recordType,
}) => {
  return (
    <AlertDialogContent>
      <AlertDialogHeader fontSize="lg" fontWeight="bold">
        {`Request for ${recordType}? deletion`}
      </AlertDialogHeader>

      <AlertDialogBody>{failedText}</AlertDialogBody>

      <AlertDialogFooter>
        <Button ref={cancelRef} onClick={onClose}>
          Close
        </Button>
      </AlertDialogFooter>
    </AlertDialogContent>
  );
};

export default DeleteConfirmation;
