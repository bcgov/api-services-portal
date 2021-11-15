import * as React from 'react';
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogCloseButton,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Box,
  BoxProps,
  Button,
  useDisclosure,
} from '@chakra-ui/react';

interface ConfirmationDialogProps {
  body: string;
  children: React.ReactNode;
  confirmButtonText?: string;
  containerProps?: BoxProps;
  destructive?: boolean;
  onConfirm: () => void;
  title: string;
}

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  body,
  children,
  confirmButtonText = 'Yes',
  containerProps = {},
  destructive,
  onConfirm,
  title,
}) => {
  const cancelRef = React.useRef();
  const { isOpen, onClose, onOpen } = useDisclosure();

  const handleConfirm = React.useCallback(() => {
    onClose();
    onConfirm();
  }, [onClose, onConfirm]);

  return (
    <>
      <Box {...containerProps} role="button" onClick={onOpen}>
        {children}
      </Box>
      <AlertDialog
        isCentered
        motionPreset="slideInBottom"
        leastDestructiveRef={cancelRef}
        onClose={onClose}
        isOpen={isOpen}
      >
        <AlertDialogOverlay />
        <AlertDialogContent>
          <AlertDialogHeader>{title}</AlertDialogHeader>
          <AlertDialogCloseButton />
          <AlertDialogBody>{body}</AlertDialogBody>
          <AlertDialogFooter>
            <Button ref={cancelRef} onClick={onClose} variant="secondary">
              Cancel
            </Button>
            <Button
              colorScheme="red"
              ml={3}
              onClick={handleConfirm}
              variant={destructive ? 'solid' : 'primary'}
            >
              {confirmButtonText}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default ConfirmationDialog;
