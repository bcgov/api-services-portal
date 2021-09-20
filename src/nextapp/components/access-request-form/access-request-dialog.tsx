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

interface AccessRequestDialogProps {
  disabled: boolean;
  open?: boolean;
}

const AccessRequestDialog: React.FC<AccessRequestDialogProps> = ({
  disabled,
  open,
}) => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <>
      <Button
        colorScheme="bc-success"
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
          <ModalHeader>Access Request to Dataset</ModalHeader>
          <ModalBody p={0}>
            <Tabs>
              <TabList mx={4}>
                <Tab>1. Request Access</Tab>
                <Tab isDisabled>2. Generate Secrets</Tab>
              </TabList>
              <TabPanels>
                <TabPanel>
                  <AccessRequestForm />
                </TabPanel>
                <TabPanel>Generate</TabPanel>
              </TabPanels>
            </Tabs>
          </ModalBody>
          <ModalFooter>
            <ButtonGroup>
              <Button variant="secondary">Cancel</Button>
              <Button>Request Access & Continue</Button>
            </ButtonGroup>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default AccessRequestDialog;
