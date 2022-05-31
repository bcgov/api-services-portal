import * as React from 'react';
import {
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  useDisclosure,
  Icon,
} from '@chakra-ui/react';
import AddControlButton from './add-control-button';
import { FaPen } from 'react-icons/fa';

interface ControlDialogProps {
  buttonText?: string;
  children: React.ReactNode;
  icon?: React.ElementType<any>;
  onSubmit: (formData: FormData) => void;
  mode: 'edit' | 'create';
  title: string;
}

const ControlsDialog: React.FC<ControlDialogProps> = ({
  buttonText,
  children,
  icon,
  mode,
  onSubmit,
  title,
}) => {
  const formRef = React.useRef<HTMLFormElement>();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const handleSubmit = React.useCallback((event: React.FormEvent) => {
    event.preventDefault();
  }, []);
  const onTriggerSubmit = () => {
    if (formRef?.current) {
      if (formRef.current.checkValidity()) {
        const formData = new FormData(formRef.current);
        onSubmit(formData);
        onClose();
      }
    }
  };

  return (
    <>
      {mode === 'edit' && (
        <Button
          variant="outline"
          size="xs"
          color="bc-blue-alt"
          leftIcon={<Icon as={FaPen} />}
          onClick={onOpen}
        >
          Edit
        </Button>
      )}
      {mode === 'create' && (
        <AddControlButton icon={icon} onClick={onOpen}>
          {buttonText}
        </AddControlButton>
      )}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{title}</ModalHeader>
          <ModalBody>
            <form ref={formRef} onSubmit={handleSubmit}>
              {children}
            </form>
          </ModalBody>
          <ModalFooter>
            <Button
              mr={3}
              data-testid="control-dialog-cancel-btn"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              data-testid="control-dialog-apply-btn"
              onClick={onTriggerSubmit}
            >
              Apply
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default ControlsDialog;
