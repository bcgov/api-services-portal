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
import { Environment, Mutation } from '@/shared/types/query.types';

import AccessRequestForm from './access-request-form';
import AccessRequestCredentials from './access-request-credentials';
import AccessRequestFormLoading from './access-request-form-loading';
import { useAuth } from '@/shared/services/auth';

interface AccessRequestDialogProps {
  defaultTab?: number;
  disabled: boolean;
  id: string;
  name: string;
  open?: boolean;
}

const AccessRequestDialog: React.FC<AccessRequestDialogProps> = ({
  defaultTab = 0,
  disabled,
  id,
  name,
  open,
}) => {
  const client = useQueryClient();
  const auth = useAuth();
  const formRef = React.useRef<HTMLFormElement>(null);
  const [isAutoApproved, setIsAutoApproved] = React.useState<boolean>(false);
  const mutate = useApiMutation(mutation);
  const router = useRouter();
  const toast = useToast();
  const [hasError, setError] = React.useState<boolean>(false);
  const [tab, setTab] = React.useState<number>(defaultTab);
  const { isOpen, onOpen, onClose } = useDisclosure({
    onClose: () => setTab(defaultTab),
  });
  const submitButtonText = isAutoApproved
    ? 'Request Access & Continue'
    : 'Request Access';
  const requestAccessButtonText = auth.user
    ? 'Request Access'
    : 'Sign in to request access';
  const [accessRequestId, setAccessRequestId] = React.useState<string>('');

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
          const res: Mutation = await mutate.mutateAsync(payload);
          client.invalidateQueries('allAccessRequests');

          toast({
            isClosable: true,
            title: 'Request submitted',
            status: 'success',
          });

          // If auto approved go to the next tab, otherwise close modal and redirect
          setAccessRequestId(res.createAccessRequest.id);
          setTab(1);
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
    if (!isAutoApproved) {
      toast({
        isClosable: true,
        status: 'warning',
        title: 'Pending Approval',
        description:
          'Your request for access has been submitted. If approved, your credentials will be authorized to access the API',
      });
    }
    router?.push('/devportal/access');
  }, [isAutoApproved, onClose, router, toast]);
  const handleFormError = () => {
    setError(true);
  };
  const handleEnvironmentSelect = React.useCallback(
    (environment: Environment) => {
      setIsAutoApproved(!environment.approval);
    },
    []
  );

  return (
    <>
      <Button
        colorScheme="green"
        disabled={!auth.user ?? disabled}
        variant="solid"
        onClick={onOpen}
        data-testid="request-access-button"
      >
        {requestAccessButtonText}
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
            {`Access Request to ${name}`}
            <Tabs defaultIndex={tab} index={tab}>
              <TabList mt={4}>
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
                      onEnvironmentSelect={handleEnvironmentSelect}
                    />
                  </React.Suspense>
                </ErrorBoundary>
              </form>
            )}
            {tab === 1 && <AccessRequestCredentials id={accessRequestId} />}
          </ModalBody>
          <ModalFooter>
            {tab === 0 && (
              <ButtonGroup>
                <Button
                  variant="secondary"
                  onClick={onClose}
                  data-testid="access-request-cancel-button"
                >
                  Cancel
                </Button>
                <Button
                  isDisabled={hasError}
                  isLoading={mutate.isLoading}
                  onClick={handleSubmit}
                  data-testid="access-request-submit-button"
                >
                  {submitButtonText}
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
