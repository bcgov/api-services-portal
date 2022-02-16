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
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="4xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          {title}
          <Tabs index={tabIndex} pos="relative" onChange={handleTabChange}>
            <TabList mt={4} mb={2}>
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
          </Tabs>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          {tabIndex === 0 && <RequestDetails />}
          {tabIndex === 1 && <RequestControls />}
          {tabIndex === 2 && <RequestAuthorization />}{' '}
        </ModalBody>
        <ModalFooter>
          <ButtonGroup>
            <Button variant="solid" colorScheme="green">
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
