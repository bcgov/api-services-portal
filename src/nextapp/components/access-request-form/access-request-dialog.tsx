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
  TabPanel,
  TabPanels,
  Tabs,
  useDisclosure,
} from '@chakra-ui/react';

import AccessRequestForm from './access-request-form';
import AccessRequestCredentials from './access-request-credentials';

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
  const [tab, setTab] = React.useState<number>(defaultTab);
  const { isOpen, onOpen, onClose } = useDisclosure({
    onClose: () => setTab(defaultTab),
  });

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
            {tab === 0 && <AccessRequestForm />}
            {tab === 1 && <AccessRequestCredentials id={id} />}
          </ModalBody>
          <ModalFooter>
            <ButtonGroup>
              <Button variant="secondary">Cancel</Button>
              {tab === 0 && (
                <Button onClick={() => setTab(1)}>
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
