import * as React from 'react';
import {
  Button,
  ButtonGroup,
  Flex,
  Icon,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Slide,
  Tab,
  TabList,
  Tabs,
  Text,
  useDisclosure,
  useToast,
} from '@chakra-ui/react';
import { gql } from 'graphql-request';
import { useApiMutation } from '@/shared/services/api';

import AccessRequestForm from './access-request-form';
import AccessRequestCredentials from './access-request-credentials';
import { useQueryClient } from 'react-query';
import AccessRequestFormLoading from './access-request-form-loading';
import { FaArrowDown } from 'react-icons/fa';

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
  const formRef = React.useRef<HTMLFormElement>(null);
  const mutate = useApiMutation(mutation);
  const client = useQueryClient();
  const toast = useToast();
  const [tab, setTab] = React.useState<number>(defaultTab);
  const { isOpen, onOpen, onClose } = useDisclosure({
    onClose: () => setTab(defaultTab),
  });
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
              // TODO clarify this
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
            title: 'Request submitted',
            status: 'success',
          });
        } catch (err) {
          toast({
            title: 'Request Failed',
            description: err.map((e) => e.message).join('\n'),
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
                <React.Suspense fallback={AccessRequestFormLoading}>
                  <AccessRequestForm id={id} />
                </React.Suspense>
              </form>
            )}
            {tab === 1 && <AccessRequestCredentials id={id} />}
          </ModalBody>
          <ModalFooter>
            <Slide direction="bottom">
              <Flex
                align="center"
                p={4}
                color="white"
                bg="bc-success"
                rounded="md"
              >
                <Icon as={FaArrowDown} mr={2} />
                <Text>Scroll down for more</Text>
              </Flex>
            </Slide>
            {tab === 0 && (
              <ButtonGroup>
                <Button variant="secondary">Cancel</Button>
                <Button isLoading={mutate.isLoading} onClick={handleSubmit}>
                  Request Access & Continue
                </Button>
              </ButtonGroup>
            )}
            {tab === 1 && <Button onClick={onClose}>Done</Button>}
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
