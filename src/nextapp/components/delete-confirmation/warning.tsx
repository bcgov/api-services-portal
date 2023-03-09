import * as React from 'react';
import {
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  Button,
} from '@chakra-ui/react';

interface DeleteWarningProps {
  cancelRef: React.Ref<any>;
  failedText: React.ReactNode;
  onClose: () => void;
  recordType: string;
}

const DeleteWarning: React.FC<DeleteWarningProps> = ({
  cancelRef,
  failedText,
  onClose,
  recordType,
}) => {
  return (
    <AlertDialogContent>
      <AlertDialogHeader fontSize="lg" fontWeight="bold">
        {`You cannot delete ${recordType}?`}
      </AlertDialogHeader>

      <AlertDialogBody>{failedText}</AlertDialogBody>

      <AlertDialogFooter>
        <Button ref={cancelRef} onClick={onClose}>
          OK
        </Button>
      </AlertDialogFooter>
    </AlertDialogContent>
  );
};

export default DeleteWarning;
