import * as React from 'react';
import {
  Button,
  ButtonGroup,
  FormControl,
  FormLabel,
  Input,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from '@chakra-ui/react';

interface NewProfileProps {
  onCancel: () => void;
  onComplete: (value: string) => void;
}

const NewProfile: React.FC<NewProfileProps> = ({ onCancel, onComplete }) => {
  const form = React.useRef<HTMLFormElement>(null);

  const handleCreate = () => {
    form.current?.requestSubmit();
  };
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const name = data.get('name') as string;
    onComplete(name);
  };

  return (
    <>
      <ModalHeader>Create Authorization Profile</ModalHeader>
      <ModalBody>
        <form ref={form} onSubmit={handleSubmit}>
          <FormControl isRequired mb={8}>
            <FormLabel>Profile Name</FormLabel>
            <Input
              id="name"
              name="name"
              variant="bc-input"
              data-testid="ap-profile-name"
            />
          </FormControl>
        </form>
      </ModalBody>
      <ModalFooter>
        <ButtonGroup>
          <Button
            onClick={onCancel}
            variant="secondary"
            data-testid="ap-profile-name-cancel-btn"
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreate}
            data-testid="ap-profile-name-submit-btn"
          >
            Continue
          </Button>
        </ButtonGroup>
      </ModalFooter>
    </>
  );
};

export default NewProfile;
