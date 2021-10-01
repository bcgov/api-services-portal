import * as React from 'react';
import {
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
  Text,
  useDisclosure,
} from '@chakra-ui/react';

import AccessRequestForm from './access-request-form';
import AccessRequestCredentials from './access-request-credentials';
import { gql } from 'graphql-request';

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
  const [tab, setTab] = React.useState<number>(defaultTab);
  const { isOpen, onOpen, onClose } = useDisclosure({
    onClose: () => setTab(defaultTab),
  });
  const handleAccessSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;

    console.log('hi!!!!!!');
    if (form && form.checkValidity()) {
      const formData = new FormData(form);
      console.log('hi!');
    }
  };
  const handleSubmit = () => {
    formRef.current?.requestSubmit();
    console.log('weooo');
  };

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
            <Tabs defaultIndex={tab} index={tab} onChange={setTab}>
              <TabList mt={4}>
                <Tab>1. Request Access</Tab>
                <Tab>2. Generate Secrets</Tab>
              </TabList>
            </Tabs>
          </ModalHeader>
          <ModalBody>
            {tab === 0 && (
              <form ref={formRef} onSubmit={handleAccessSubmit}>
                <React.Suspense fallback={<Text>Loading...</Text>}>
                  <AccessRequestForm id={id} />
                </React.Suspense>
              </form>
            )}
            {tab === 1 && <AccessRequestCredentials id={id} />}
          </ModalBody>
          <ModalFooter>
            <ButtonGroup>
              <Button variant="secondary">Cancel</Button>
              {tab === 0 && (
                <Button onClick={handleSubmit}>
                  Request Access & Continue
                </Button>
              )}
              {tab === 1 && <Button onClick={onClose}>Done</Button>}
            </ButtonGroup>
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
