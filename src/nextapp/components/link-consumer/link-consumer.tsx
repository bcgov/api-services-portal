import * as React from 'react';
import {
  Button,
  Checkbox,
  CheckboxGroup,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalOverlay,
  ModalHeader,
  Input,
  ButtonGroup,
  FormControl,
  FormLabel,
  Icon,
  useDisclosure,
  VStack,
  useToast,
  Box,
  Text,
  WrapItem,
  Wrap,
} from '@chakra-ui/react';
import { FaPlusCircle } from 'react-icons/fa';
import { gql } from 'graphql-request';
import { UmaResourceSet } from '@/shared/types/query.types';
import { useApiMutation } from '@/shared/services/api';
import { useQueryClient } from 'react-query';

interface LinkConsumerDialogProps {
  queryKey: any[];
}

const LinkConsumerDialog: React.FC<LinkConsumerDialogProps> = ({
  queryKey,
}) => {
  const client = useQueryClient();
  const link = useApiMutation(mutation);
  const toast = useToast();
  const title = 'Link Consumer to Namespace';
  const formRef = React.useRef<HTMLFormElement>();
  const { isOpen, onClose, onOpen } = useDisclosure();
  const handleLink = async () => {
    const formData = new FormData(formRef?.current);

    await link.mutateAsync({
      username: formData.get('username') as string,
    });
    toast({
      title: 'Consumer linked',
      status: 'success',
      isClosable: true,
    });
    client.invalidateQueries(queryKey);
    onClose();
  };
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    handleLink();
  };
  const handleSubmitClick = () => {
    if (formRef?.current.checkValidity()) {
      handleLink();
    }
  };

  return (
    <>
      <Button
        leftIcon={<Icon as={FaPlusCircle} />}
        onClick={onOpen}
        variant="primary"
        data-testid="link-consumer-namespace"
      >
        {title}
      </Button>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        scrollBehavior="inside"
        size="xl"
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{title}</ModalHeader>
          <ModalBody>
            {link.isError && (
              <Box bgColor="red.500" px={4} py={2} color="white" my={3}>
                <Text>Linking failed</Text>
              </Box>
            )}
            <form ref={formRef} onSubmit={handleSubmit}>
              <VStack spacing={4} overflow="hidden">
                <FormControl isRequired>
                  <FormLabel>Username</FormLabel>
                  <Input
                    name="username"
                    type="text"
                    placeholder="Enter username of the Consumer you would like to link"
                    data-testid="link-consumer-username"
                  />
                </FormControl>
              </VStack>
            </form>
          </ModalBody>
          <ModalFooter>
            <ButtonGroup>
              <Button variant="secondary" onClick={onClose}>
                Cancel
              </Button>
              <Button data-testid="link-consumer-link-btn" onClick={handleSubmitClick}>Link</Button>
            </ButtonGroup>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default LinkConsumerDialog;

const mutation = gql`
  mutation LinkConsumerToNamespace($username: String!) {
    linkConsumerToNamespace(username: $username)
  }
`;
