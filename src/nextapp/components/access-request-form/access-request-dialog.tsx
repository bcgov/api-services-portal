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
import LoginDialog from '../login-dialog/login-dialog';

interface AccessRequestDialogProps {
  defaultTab?: number;
  disabled: boolean;
  id: string;
  name: string;
  preview: boolean;
  open?: boolean;
  variant?: 'inline' | 'button';
}

const AccessRequestDialog: React.FC<AccessRequestDialogProps> = ({
  defaultTab = 0,
  disabled,
  id,
  name,
  preview,
  open,
  variant = 'button',
}) => {
  const client = useQueryClient();
  const auth = useAuth();
  // Keep track of a credenials collection so we can display the toast if needed
  const hasCollectedCredentials = React.useRef<boolean>(false);
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
  const [accessRequestId, setAccessRequestId] = React.useState<string>('');
  const isInline = variant === 'inline';
  const buttonProps = !isInline
    ? {}
    : {
        fontWeight: 'normal',
        fontSize: 'inherit',
        color: 'bc-link',
        textDecor: 'underline',
      };

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
              clientGenCertificate:
                formData.get('clientAuthenticator') === 'client-jwt',
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
            title: 'Request failed',
            description: err,
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
    if (!isAutoApproved && hasCollectedCredentials.current) {
      toast({
        isClosable: true,
        status: 'warning',
        title: 'Pending approval',
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
  const handleCredentialGenerated = React.useCallback(() => {
    hasCollectedCredentials.current = true;
  }, []);

  return (
    <>
      {auth.user && (
        <Button
          disabled={disabled}
          onClick={onOpen}
          data-testid="request-access-button"
          variant={isInline ? 'link' : 'primary'}
          fontWeight="600"
          color="white"
          {...buttonProps}
        >
          Request Access
        </Button>
      )}
      {!auth.user && <LoginDialog buttonText="Request Access" />}
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
                <Tab px={0}>1. Request Access</Tab>
                <Tab px={0} ml={4}>
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
                      preview={preview}
                      onEnvironmentSelect={handleEnvironmentSelect}
                    />
                  </React.Suspense>
                </ErrorBoundary>
              </form>
            )}
            {tab === 1 && (
              <AccessRequestCredentials
                id={accessRequestId}
                onCredentialGenerated={handleCredentialGenerated}
              />
            )}
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
            {tab === 1 && (
              <Button onClick={handleDone} data-testid="doneAcceptRequest">
                Done
              </Button>
            )}
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
