import * as React from 'react';
import {
  Button,
  Checkbox,
  CheckboxGroup,
  CircularProgress,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalOverlay,
  ModalHeader,
  ButtonGroup,
  FormControl,
  FormLabel,
  Icon,
  useDisclosure,
  VStack,
  useToast,
  Text,
  WrapItem,
  Wrap,
  Center,
} from '@chakra-ui/react';
import { FaPlusCircle } from 'react-icons/fa';
import { gql } from 'graphql-request';
import { useApi, useApiMutation } from '@/shared/services/api';
import { Mutation } from '@/shared/types/query.types';

interface ServiceAccountCreateProps {
  onCreate: (credentials: Record<string, string>) => void;
}

const ServiceAccountCreate: React.FC<ServiceAccountCreateProps> = ({
  onCreate,
}) => {
  const { isOpen, onClose, onOpen } = useDisclosure();
  const { data, isLoading, isSuccess } = useApi(
    'currentNamespace',
    { query },
    {
      enabled: isOpen,
    }
  );
  const credentialGenerator = useApiMutation(mutation);
  const toast = useToast();
  const formRef = React.useRef<HTMLFormElement>();
  const handleCreate = React.useCallback(async () => {
    try {
      const form = new FormData(formRef?.current);
      const res: Mutation = await credentialGenerator.mutateAsync({
        resourceId: data?.currentNamespace.id,
        scopes: form.getAll('scopes'),
      });

      if (res.createServiceAccount.credentials) {
        onCreate(JSON.parse(res.createServiceAccount.credentials));
      }

      toast({
        title: 'Service account created',
        status: 'success',
        isClosable: true,
      });
      onClose();
    } catch (err) {
      toast({
        title: 'Could not create Service Account',
        description: err,
        status: 'error',
        isClosable: true,
      });
    }
  }, [
    credentialGenerator,
    data?.currentNamespace.id,
    onClose,
    onCreate,
    toast,
  ]);
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    handleCreate();
  };

  return (
    <>
      <Button
        onClick={onOpen}
        data-testid="sa-create-second-btn"
      >
        Create New Service Account
      </Button>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        scrollBehavior="inside"
        size="xl"
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            Create New Service Account
          </ModalHeader>
          <ModalBody>
            {isLoading && (
              <Center minH="200px">
                <CircularProgress isIndeterminate />
              </Center>
            )}
            {isSuccess && (
              <form ref={formRef} onSubmit={handleSubmit}>
                <VStack spacing={4}>
                  <FormControl>
                    <FormLabel mb={8}>Assign scopes</FormLabel>
                    <CheckboxGroup>
                      <VStack align="flex-start" spacing={4}>
                        {data.currentNamespace?.scopes?.map((s) => (
                          <WrapItem key={s.name}>
                            <Checkbox value={s.name} name="scopes">
                              {s.name}
                            </Checkbox>
                          </WrapItem>
                        ))}
                      </VStack>
                    </CheckboxGroup>
                  </FormControl>
                </VStack>
              </form>
            )}
          </ModalBody>
          <ModalFooter>
            <ButtonGroup>
              <Button
                isDisabled={credentialGenerator.isLoading}
                onClick={onClose}
                variant="secondary"
                data-testid="sa-scopes-cancel-btn"
              >
                Cancel
              </Button>
              <Button
                isLoading={credentialGenerator.isLoading}
                variant="primary"
                onClick={handleCreate}
                data-testid="sa-scopes-share-btn"
              >
                Share
              </Button>
            </ButtonGroup>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default ServiceAccountCreate;

const query = gql`
  query GetCurrentNamespace {
    currentNamespace {
      id
      name
      scopes {
        name
      }
      prodEnvId
    }
  }
`;

const mutation = gql`
  mutation CreateServiceAccount($resourceId: String!, $scopes: [String]!) {
    createServiceAccount(resourceId: $resourceId, scopes: $scopes) {
      id
      name
      credentials
    }
  }
`;
