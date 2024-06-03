import * as React from 'react';
import {
  Button,
  ButtonGroup,
  FormControl,
  FormHelperText,
  FormLabel,
  Icon,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
  useDisclosure,
  useToast,
} from '@chakra-ui/react';
import { FaPen } from 'react-icons/fa';
import { QueryKey, useQueryClient } from 'react-query';
import { useApiMutation } from '@/shared/services/api';
import { gql } from 'graphql-request';
import { NamespaceInput } from '@/shared/types/query.types';

interface EditNamespaceDisplayNameProps {
  data: NamespaceInput;
  queryKey: QueryKey;
}

const EditNamespaceDisplayName: React.FC<EditNamespaceDisplayNameProps> = ({
  data,
  queryKey,
}) => {
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const queryClient = useQueryClient();
  const mutate = useApiMutation<NamespaceInput>(mutation);
  // console.log(data)
  const [inputValue, setInputValue] = React.useState(data?.name || '');
  const [charCount, setCharCount] = React.useState(data?.name?.length || 0);
  const charLimit = 30;
  const handleInputChange = (event) => {
    const { value } = event.target;
    setInputValue(value);
    setCharCount(value.length);
  };
  const form = React.useRef<HTMLFormElement>();
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (charCount <= charLimit) {
      updateNamespaceDisplayName();
      submitTheForm();
    }
  };
  const submitTheForm = async () => {
    toast({
      title: 'Submitted it!',
      status: 'success',
      isClosable: true,
    });
  };
  const updateNamespaceDisplayName = async () => {
    if (form.current) {
      try {
        const formData = new FormData(form.current);

        if (form.current.checkValidity()) {
          const name = formData.get('name') as string;
          const displayName = formData.get('displayName') as string;
          await mutate.mutateAsync({
            // id: data?.id,
            displayName,
          });
          toast({
            title: 'Display name successfully edited',
            status: 'success',
            isClosable: true,
          });
          queryClient.invalidateQueries(queryKey);
          onClose();
        }
      } catch (err) {
        toast({
          title: 'Display name update failed',
          description: err,
          status: 'error',
          isClosable: true,
        });
      }
    }
  };
  const handleSaveClick = () => {
    form.current?.requestSubmit();
  };
  return (
    <>
      <Button
        leftIcon={<Icon as={FaPen} />}
        variant="ghost"
        size="sm"
        onClick={onOpen}
        data-testid="display-name-edit-btn"
      >
        Edit
      </Button>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent borderRadius="4px" px={11}>
          <ModalHeader pt={10}>Edit display name</ModalHeader>
          <ModalBody pt={0} pb={10}>
            <form ref={form} onSubmit={handleSubmit}>
              <FormControl isRequired>
                <FormLabel></FormLabel>
                <FormHelperText pb={4} fontSize={'16px'}>
                  A meaningful display name makes it easy for anyone to identify
                  and distinguish this Gateway from others.
                </FormHelperText>
                <Text
                  fontSize={'12px'}
                  color={charCount > charLimit ? 'bc-error' : 'gray.500'}
                  mt={2}
                  textAlign="right"
                >
                  {charCount}/{charLimit}
                </Text>
                <Input
                  value={inputValue}
                  // defaultValue={data?.displayName}
                  // defaultValue={data?.name}
                  onChange={handleInputChange}
                  name="displayName"
                  variant="bc-input"
                  isInvalid={charCount > charLimit}
                  data-testid="edit-display-name-input"
                />
                {charCount > charLimit && (
                  <Text color="bc-error" mt={2} mb={-8}>
                    You have reached the character limit
                  </Text>
                )}
              </FormControl>
            </form>
          </ModalBody>
          <ModalFooter pt={7} pb={7}>
            <ButtonGroup>
              <Button
                px={7}
                onClick={onClose}
                variant="secondary"
                data-testid="edit-display-name-cancel-btn"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                onClick={handleSaveClick}
                data-testid="edit-display-name-submit-btn"
                isDisabled={charCount > charLimit}
              >
                Save
              </Button>
            </ButtonGroup>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default EditNamespaceDisplayName;

const mutation = gql`
  mutation UpdateNamespaceDisplayName($displayName: String) {
    updateCurrentNamespaceDisplayName(displayName: $displayName)
  }
`;
