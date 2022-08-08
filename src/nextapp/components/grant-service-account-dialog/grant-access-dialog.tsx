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

interface ShareResourceDialogProps {
  prodEnvId: string;
  resource: UmaResourceSet;
  resourceId: string;
  queryKey: string;
}

const ShareResourceDialog: React.FC<ShareResourceDialogProps> = ({
  prodEnvId,
  resource,
  resourceId,
  queryKey,
}) => {
  const client = useQueryClient();
  const grant = useApiMutation(mutation);
  const toast = useToast();
  const title = 'Grant Service Account Access';
  const formRef = React.useRef<HTMLFormElement>();
  const { isOpen, onClose, onOpen } = useDisclosure();
  const handleGrantAccess = async () => {
    const formData = new FormData(formRef?.current);
    const scopes = formData.getAll('scopes') as string[];

    const serviceAccountId = formData.get('serviceAccountId') as string;

    await grant.mutateAsync({
      prodEnvId,
      resourceId,
      data: {
        name: serviceAccountId,
        description: `Service Acct ${serviceAccountId}`,
        clients: [serviceAccountId],
        scopes: scopes,
      },
    });
    toast({
      title: 'Access granted',
      status: 'success',
      isClosable: true,
    });
    client.invalidateQueries(queryKey);
    onClose();
  };
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    handleGrantAccess();
  };
  const handleSubmitClick = () => {
    if (formRef?.current.checkValidity()) {
      handleGrantAccess();
    }
  };

  return (
    <>
      <Button
        leftIcon={<Icon as={FaPlusCircle} />}
        onClick={onOpen}
        variant="primary"
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
            {grant.isError && (
              <Box bgColor="red.500" px={4} py={2} color="white" my={3}>
                <Text>Access cannot be granted</Text>
              </Box>
            )}
            <form ref={formRef} onSubmit={handleSubmit}>
              <VStack spacing={4} overflow="hidden">
                <FormControl isRequired>
                  <FormLabel>Service Account</FormLabel>
                  <Input
                    name="serviceAccountId"
                    type="text"
                    placeholder="Enter service account you'd like to add"
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Permissions</FormLabel>
                  <CheckboxGroup>
                    <Wrap spacing={4}>
                      {resource?.resource_scopes.map((r) => (
                        <WrapItem key={r.name}>
                          <Checkbox value={r.name} name="scopes">
                            {r.name}
                          </Checkbox>
                        </WrapItem>
                      ))}
                    </Wrap>
                  </CheckboxGroup>
                </FormControl>
              </VStack>
            </form>
          </ModalBody>
          <ModalFooter>
            <ButtonGroup>
              <Button variant="secondary" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={handleSubmitClick}>Share</Button>
            </ButtonGroup>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default ShareResourceDialog;

const mutation = gql`
  mutation GrantSAAccess(
    $prodEnvId: ID!
    $resourceId: String!
    $data: UMAPolicyInput!
  ) {
    createUmaPolicy(
      prodEnvId: $prodEnvId
      resourceId: $resourceId
      data: $data
    ) {
      id
    }
  }
`;
