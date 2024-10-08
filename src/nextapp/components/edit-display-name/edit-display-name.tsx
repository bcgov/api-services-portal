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
  const { isOpen, onOpen, onClose: originalOnClose } = useDisclosure();
  const queryClient = useQueryClient();
  const mutate = useApiMutation(mutation);
  const [inputValue, setInputValue] = React.useState(data.displayName || '');
  const [charCount, setCharCount] = React.useState(
    data.displayName?.length || 0
  );
  const minCharLimit = 3;
  const maxCharLimit = 30;
  const [isValidFormat, setIsValidFormat] = React.useState(true);
  const validNameRegex = /^[a-zA-Z0-9][\w\s().'/-]*$/;

  const handleInputChange = (event) => {
    const { value } = event.target;
    setInputValue(value);
    setCharCount(value.length);
    setIsValidFormat(validNameRegex.test(value));
  };

  const form = React.useRef<HTMLFormElement>();
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (charCount >= minCharLimit && charCount <= maxCharLimit && isValidFormat) {
      updateNamespaceDisplayName();
    }
  };

  const updateNamespaceDisplayName = async () => {
    if (form.current) {
      try {
        if (form.current.checkValidity()) {
          const formData = new FormData(form.current);
          const entries = Object.fromEntries(formData);
          await mutate.mutateAsync(entries);
          queryClient.invalidateQueries(queryKey);
          originalOnClose();
          toast({
            title: 'Display name successfully edited',
            status: 'success',
            isClosable: true,
          });
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

  const isInputValid = charCount >= minCharLimit && charCount <= maxCharLimit && isValidFormat;

  // Add this new function to handle closing and resetting
  const handleClose = () => {
    setInputValue(data.displayName || '');
    setCharCount(data.displayName?.length || 0);
    setIsValidFormat(true);
    originalOnClose();
  };

  return (
    <>
      <Button
        p="0"
        leftIcon={<Icon as={FaPen} />}
        variant="ghost"
        size="sm"
        onClick={onOpen}
        data-testid="display-name-edit-btn"
      >
        Edit
      </Button>
      <Modal isOpen={isOpen} onClose={handleClose}>
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
                  color={charCount > maxCharLimit || charCount < minCharLimit ? 'bc-error' : 'gray.500'}
                  mt={2}
                  textAlign="right"
                >
                  {charCount}/{maxCharLimit}
                </Text>
                <Input
                  value={inputValue}
                  onChange={handleInputChange}
                  name="displayName"
                  variant="bc-input"
                  isInvalid={!isInputValid}
                  data-testid="edit-display-name-input"
                />
                {charCount > maxCharLimit && (
                  <Text color="bc-error" mt={2} mb={-8}>
                    Display name must be less than 30 characters
                  </Text>
                )}
                {charCount < minCharLimit && (
                  <Text color="bc-error" mt={2} mb={-8}>
                    Display name must be at least 3 characters
                  </Text>
                )}
                {!isValidFormat && (charCount >= minCharLimit) && (charCount <= maxCharLimit) && (
                  <Text color="bc-error" mt={2}>
                    Display name must start with an alphanumeric character and can only use special characters "-()_ .'/"
                  </Text>
                )}
              </FormControl>
            </form>
          </ModalBody>
          <ModalFooter pt={7} pb={7}>
            <ButtonGroup>
              <Button
                px={7}
                onClick={handleClose}
                variant="secondary"
                data-testid="edit-display-name-cancel-btn"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                onClick={handleSaveClick}
                data-testid="edit-display-name-submit-btn"
                isDisabled={!isInputValid}
                variant="primary"
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
  mutation UpdateNamespaceDisplayName($displayName: String!) {
    updateCurrentNamespaceDisplayName(displayName: $displayName)
  }
`;
