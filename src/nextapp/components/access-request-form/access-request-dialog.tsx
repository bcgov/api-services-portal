import * as React from 'react';
import {
  Alert,
  AlertDescription,
  AlertIcon,
  Button,
  ButtonGroup,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Tab,
  TabList,
  Tabs,
  useDisclosure,
  useToast,
} from '@chakra-ui/react';
import { ErrorBoundary } from 'react-error-boundary';
import { gql } from 'graphql-request';
import { useApiMutation } from '@/shared/services/api';
import { useQueryClient } from 'react-query';
import { useRouter } from 'next/router';
import { Environment } from '@/shared/types/query.types';

import AccessRequestForm from './access-request-form';
import AccessRequestCredentials from './access-request-credentials';
import AccessRequestFormLoading from './access-request-form-loading';

interface AccessRequestDialogProps {
  defaultTab?: number;
  disabled: boolean;
  id: string;
  open?: boolean;
}

const AccessRequestDialog: React.FC<AccessRequestDialogProps> = ({
  defaultTab = 0,
  disabled,
  id,
  open,
}) => {
  const client = useQueryClient();
  const formRef = React.useRef<HTMLFormElement>(null);
  const isAutoApproved = React.useRef<boolean>(false);
  const mutate = useApiMutation(mutation);
  const router = useRouter();
  const toast = useToast();
  const [hasError, setError] = React.useState<boolean>(false);
  const [tab, setTab] = React.useState<number>(defaultTab);
  const { isOpen, onOpen, onClose } = useDisclosure({
    onClose: () => setTab(defaultTab),
  });

  // Events
  const handleAccessSubmit = React.useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const form = event.currentTarget;

      if (form && form.checkValidity()) {
        try {
          const formData = new FormData(form);
          const payload = {
            name: formData.get('name'),
            controls: JSON.stringify({
              clientGenCertificate: formData.get('clientAuthenticator'),
              jwksUrl:
                formData.get('clientAuthenticator') === 'client-jwt-jwks-url'
                  ? formData.get('jwksUrl')
                  : '',
            }),
            requestor: formData.get('requestor'),
            applicationId: formData.get('applicationId'),
            productEnvironmentId: formData.get('productEnvironmentId'),
            additionalDetails: formData.get('additionalDetails'),
            acceptLegal: formData.has('acceptLegal') ? true : false,
          };
          await mutate.mutateAsync(payload);
          client.invalidateQueries('allAccessRequests');
          setTab(1);
          toast({
            isClosable: true,
            title: 'Request submitted',
            status: 'success',
          });
        } catch (err) {
          toast({
            isClosable: true,
            title: 'Request Failed',
            description:
              err?.map((e: Error) => e.message).join('\n') ??
              'Unable to create request',
            status: 'error',
          });
        }
      }
    },
    [client, mutate, toast]
  );
  const handleSubmit = React.useCallback(() => {
    formRef.current?.requestSubmit();
  }, []);
  const handleDone = React.useCallback(() => {
    onClose();
    router?.push('/devportal/access');

    if (tab === 1 && isAutoApproved.current) {
      toast({
        isClosable: true,
        status: 'warning',
        title: 'Pending Approval',
        description:
          'Your request for access has been submitted. If approved, your credentials will be authorized to access the API',
      });
    }
  }, [onClose, router, tab, toast]);
  const handleFormError = () => {
    setError(true);
  };
  const handleEnviornmentSelect = React.useCallback(
    (environment: Environment) => {
      isAutoApproved.current = environment.approval === false;
    },
    []
  );

  return (
    <>
      <Button
        colorScheme="green"
        disabled={disabled}
        variant="solid"
        onClick={onOpen}
      >
        Request Access
      </Button>
      <Modal
        isOpen={open || isOpen}
        onClose={onClose}
        scrollBehavior="inside"
        size="xl"
      >
        <ModalOverlay />
        <ModalContent minW="75%">
          <ModalHeader>
            Access Request to Test NK API
            <Tabs defaultIndex={tab} index={tab}>
              <TabList mt={4} mb={2}>
                <Tab px={0} cursor="default">
                  1. Request Access
                </Tab>
                <Tab px={0} ml={4} cursor="default">
                  2. Generate Secrets
                </Tab>
              </TabList>
            </Tabs>
          </ModalHeader>
          <ModalBody>
            {tab === 0 && (
              <form ref={formRef} onSubmit={handleAccessSubmit}>
                <ErrorBoundary
                  onError={handleFormError}
                  fallback={
                    <Alert status="error">
                      <AlertIcon />
                      <AlertDescription>
                        Unable to load Access Request Form
                      </AlertDescription>
                    </Alert>
                  }
                >
                  <React.Suspense fallback={<AccessRequestFormLoading />}>
                    <AccessRequestForm
                      id={id}
                      onEnvironmentSelect={handleEnviornmentSelect}
                    />
                  </React.Suspense>
                </ErrorBoundary>
              </form>
            )}
            {tab === 1 && <AccessRequestCredentials id={id} />}
          </ModalBody>
          <ModalFooter>
            {tab === 0 && (
              <ButtonGroup>
                <Button variant="secondary" onClick={onClose}>
                  Cancel
                </Button>
                <Button
                  isDisabled={hasError}
                  isLoading={mutate.isLoading}
                  onClick={handleSubmit}
                >
                  Request Access & Continue
                </Button>
              </ButtonGroup>
            )}
            {tab === 1 && <Button onClick={handleDone}>Done</Button>}
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default AccessRequestDialog;

const mutation = gql`
  mutation AddAccessRequest(
    $name: String!
    $controls: String
    $requestor: ID!
    $applicationId: ID!
    $productEnvironmentId: ID!
    $additionalDetails: String
    $acceptLegal: Boolean!
  ) {
    acceptLegal(
      productEnvironmentId: $productEnvironmentId
      acceptLegal: $acceptLegal
    ) {
      legalsAgreed
    }

    createAccessRequest(
      data: {
        name: $name
        controls: $controls
        additionalDetails: $additionalDetails
        requestor: { connect: { id: $requestor } }
        application: { connect: { id: $applicationId } }
        productEnvironment: { connect: { id: $productEnvironmentId } }
      }
    ) {
      id
    }
  }
`;
