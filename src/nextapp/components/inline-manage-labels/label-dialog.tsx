import * as React from 'react';
import {
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormLabel,
  FormControl,
} from '@chakra-ui/react';
import TagInput from '../tag-input';
import { useApi } from '@/shared/services/api';
import { gql } from 'graphql-request';

interface LabelDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const LabelDialog: React.FC<LabelDialogProps> = ({ isOpen, onClose }) => {
  const { data } = useApi(
    'GetAllConsumerGroupLabels',
    { query },
    {
      enabled: isOpen,
    }
  );
  const formRef = React.useRef<HTMLFormElement>();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (event.currentTarget?.checkValidity()) {
      const formData = new FormData(event.currentTarget);
      const payload = { labels: JSON.parse(formData.get('labels') as string) };
      console.log(payload);
      // TODO: Mutation code here
      onClose();
    }
  };
  const handleSubmitClick = () => {
    formRef?.current.requestSubmit();
  };

  return (
    <Modal closeOnOverlayClick={false} isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Manage Group Labels</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <form ref={formRef} onSubmit={handleSubmit}>
            <FormControl isRequired>
              <FormLabel>Group labels</FormLabel>
              <TagInput
                name="labels"
                value={data?.allConsumerGroupLabels}
                data-testid="label-dialog-input"
              />
            </FormControl>
          </form>
        </ModalBody>
        <ModalFooter>
          <Button
            variant="secondary"
            mr={3}
            onClick={onClose}
            data-testid="label-dialog-cancel-btn"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmitClick}
            data-testid="label-dialog-save-btn"
          >
            Save Changes
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default LabelDialog;

const query = gql`
  query GetAllConsumerGroupLabels {
    allConsumerGroupLabels
  }
`;
