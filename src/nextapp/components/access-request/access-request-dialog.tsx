import * as React from 'react';
import {
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  ButtonGroup,
  Tabs,
  TabList,
  Tab,
  TabPanel,
  TabPanels,
} from '@chakra-ui/react';

import RequestDetails from './request-details';
import RequestControls from './controls';
import RequestAuthorization from './authorization';

interface AccessRequestDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
}

const AccessRequestDialog: React.FC<AccessRequestDialogProps> = ({
  isOpen,
  onClose,
  title,
}) => {
  const [tabIndex, setTabIndex] = React.useState(0);

  const handleTabChange = React.useCallback((index) => {
    setTabIndex(index);
  }, []);
  const handleAccept = () => {
    // @ts-ignore
    const { ipRestrictionForm, rateLimitingForm } = document.forms;
    const ipRestriction = new FormData(ipRestrictionForm);
    const rateLimiting = new FormData(rateLimitingForm);
    const result = {
      ...Object.fromEntries(ipRestriction),
      ...Object.fromEntries(rateLimiting),
    };
    console.log(result);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} scrollBehavior="inside" size="4xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{title}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Tabs index={tabIndex} pos="relative" onChange={handleTabChange}>
            <TabList mb={5}>
              <Tab px={0} cursor="default">
                Request Details
              </Tab>
              <Tab px={0} ml={4} cursor="default">
                Controls
              </Tab>
              <Tab px={0} ml={4} cursor="default">
                Authorization
              </Tab>
            </TabList>
            <TabPanels>
              <TabPanel p={0}>
                <RequestDetails />
              </TabPanel>
              <TabPanel p={0}>
                <RequestControls />
              </TabPanel>
              <TabPanel p={0}>
                <RequestAuthorization />
              </TabPanel>
            </TabPanels>
          </Tabs>
        </ModalBody>
        <ModalFooter>
          <ButtonGroup>
            <Button variant="solid" colorScheme="green" onClick={handleAccept}>
              Accept
            </Button>
            <Button variant="solid" colorScheme="red">
              Reject
            </Button>
          </ButtonGroup>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default AccessRequestDialog;
