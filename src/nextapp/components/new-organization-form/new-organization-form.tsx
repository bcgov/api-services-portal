import * as React from 'react';
import {
  Button,
  FormControl,
  FormLabel,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Text,
  useDisclosure,
  Select,
  Link,
  useToast,
} from '@chakra-ui/react';
import { useAuth } from '@/shared/services/auth';
import { useApiMutation } from '@/shared/services/api';
import { useQueryClient } from 'react-query';
import { queryKey } from '@/shared/hooks/use-current-namespace';
import { gql } from 'graphql-request';

const NewOrganizationForm: React.FC = () => {
  const ref = React.useRef<HTMLFormElement>(null);
  const { user } = useAuth();
  const { isOpen, onClose, onOpen } = useDisclosure();
  const mutate = useApiMutation(mutation);
  const client = useQueryClient();
  const toast = useToast();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (ref.current?.checkValidity()) {
      try {
        const formData = new FormData(ref.current);
        const entries = Object.fromEntries(formData);
        await mutate.mutateAsync(entries);
        client.invalidateQueries(queryKey);
        onClose();
        toast({
          status: 'success',
          title: 'Namespace updated',
        });
      } catch (err) {
        toast({
          status: 'error',
          title: 'Namespace update failed',
          description: err,
        });
      }
    }
  };
  const handleSubmitClick = () => {
    ref.current?.requestSubmit();
  };

  return (
    <>
      <Button onClick={onOpen}>Add Organization</Button>
      <Modal isOpen={isOpen} onClose={onClose} size="2xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Add Organization to {user?.namespace}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text fontSize="sm" mb={4}>
              Adding your Organization and Business Unit to your namespace will
              notify the Organization Administrator to enable API publishing to
              the Directory for your namespace so consumers can find and request
              access to your APIs.
            </Text>
            <Text fontSize="sm" mb={8}>
              The Organization you choose is the organization that your APIs
              will be promoted under.
            </Text>
            <form ref={ref} onSubmit={handleSubmit}>
              <FormControl isRequired mb={4}>
                <FormLabel>Organization</FormLabel>
                <Select name="org">
                  <option value="">Select an Organization</option>
                  <option value="1">Citizen's Service</option>
                </Select>
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Business Unit</FormLabel>
                <Select name="orgUnit">
                  <option value="">Select a Business Unit</option>
                  <option value="1">DataBC Program</option>
                </Select>
              </FormControl>
            </form>
            <Text fontSize="sm" mt={8}>
              If you don’t know your Organization or Business Unit or it is not
              listed, please submit a request through the{' '}
              <Link color="bc-link" textDecor="underline">
                Data Systems and Services request system
              </Link>
            </Text>
          </ModalBody>

          <ModalFooter>
            <Button mr={2} onClick={onClose} variant="secondary">
              Cancel
            </Button>
            <Button onClick={handleSubmitClick}>Add</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default NewOrganizationForm;

// TODO make this mutation on backend
const mutation = gql`
  mutation UpdateCurrentNamespace {
    updateCurrentNamespace
  }
`;
