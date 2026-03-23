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
  WrapItem,
  Wrap,
  Center,
} from '@chakra-ui/react';
import { gql } from 'graphql-request';
import { useApiMutation } from '@/shared/services/api';
import { Mutation } from '@/shared/types/query.types';
import useCurrentNamespace from '@/shared/hooks/use-current-namespace';

interface ServiceAccountCreateProps {
  onCreate: (credentials: Record<string, string>) => void;
}

const ServiceAccountCreate: React.FC<ServiceAccountCreateProps> = ({
  onCreate,
}) => {
  const { isOpen, onClose, onOpen } = useDisclosure();
  const currentNamespace = useCurrentNamespace({ enabled: isOpen });
  const credentialGenerator = useApiMutation(mutation);
  const toast = useToast();
  const formRef = React.useRef<HTMLFormElement>();
  const availableScopes = React.useMemo(() => {
    return (
      currentNamespace.data?.currentNamespace?.scopes
        ?.map((s) => s?.name)
        .filter((n): n is string => Boolean(n)) ?? []
    );
  }, [currentNamespace.data?.currentNamespace?.scopes]);
  const hasNamespace = Boolean(currentNamespace.data?.currentNamespace?.id);
  const isShareDisabled = !hasNamespace || credentialGenerator.isLoading;

  const handleCreate = React.useCallback(async () => {
    try {
      const resourceId = currentNamespace.data?.currentNamespace?.id;
      if (!resourceId) {
        throw new Error('No active gateway/namespace found');
      }
      const form = new FormData(formRef?.current);
      const res: Mutation = await credentialGenerator.mutateAsync({
        resourceId,
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
    currentNamespace.data?.currentNamespace.id,
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
            {currentNamespace.isLoading && (
              <Center minH="200px">
                <CircularProgress isIndeterminate />
              </Center>
            )}
            {currentNamespace.isSuccess && (
              <form ref={formRef} onSubmit={handleSubmit}>
                <VStack spacing={4}>
                  <FormControl>
                    <FormLabel mb={8}>Assign scopes</FormLabel>
                    <CheckboxGroup>
                      <VStack align="flex-start" spacing={4}>
                        {availableScopes.map((scopeName) => (
                          <WrapItem key={scopeName}>
                            <Checkbox value={scopeName} name="scopes">
                              {scopeName.replace(/Namespace/g, 'Gateway')}
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
                isDisabled={isShareDisabled}
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

const mutation = gql`
  mutation CreateServiceAccount($resourceId: String!, $scopes: [String]!) {
    createServiceAccount(resourceId: $resourceId, scopes: $scopes) {
      id
      name
      credentials
    }
  }
`;
