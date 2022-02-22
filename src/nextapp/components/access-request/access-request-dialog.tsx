import * as React from 'react';
import {
  Box,
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
import { AccessRequest } from '@/shared/types/query.types';

import RequestDetails from './request-details';
import RequestControls from './controls';
import RequestAuthorization from './authorization';

interface AccessRequestDialogProps {
  data: AccessRequest;
  isOpen: boolean;
  onClose: () => void;
  title: string;
}

const AccessRequestDialog: React.FC<AccessRequestDialogProps> = ({
  data,
  isOpen,
  onClose,
  title,
}) => {
  const [tabIndex, setTabIndex] = React.useState(0);

  const handleTabChange = React.useCallback((index) => {
    setTabIndex(index);
  }, []);
  const handleReject = () => {
    onClose();
    setTabIndex(0);
  };
  const handleAccept = () => {
    // @ts-ignore
    const { ipRestrictionForm, rateLimitingForm } = document.forms;
    const ipRestriction = new FormData(ipRestrictionForm);
    const rateLimiting = new FormData(rateLimitingForm);
    const result = {
      ...Object.fromEntries(ipRestriction),
      ...Object.fromEntries(rateLimiting),
    };
    onClose();
    setTabIndex(0);
    console.log(result);
  };

  return (
    <Modal
      closeOnEsc={false}
      isOpen={isOpen}
      onClose={onClose}
      scrollBehavior="inside"
      size="4xl"
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          {title}
          <Tabs
            index={tabIndex}
            mt={4}
            pos="relative"
            onChange={handleTabChange}
          >
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
          </Tabs>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Box
            hidden={tabIndex !== 0}
            display={tabIndex === 0 ? 'block' : 'none'}
          >
            <RequestDetails data={data} />
          </Box>
          <Box
            hidden={tabIndex !== 1}
            display={tabIndex === 1 ? 'block' : 'none'}
          >
            <RequestControls />
          </Box>
          <Box
            hidden={tabIndex !== 2}
            display={tabIndex === 2 ? 'block' : 'none'}
          >
            <RequestAuthorization />
          </Box>
        </ModalBody>
        <ModalFooter>
          <ButtonGroup>
            <Button variant="solid" colorScheme="green" onClick={handleAccept}>
              Accept
            </Button>
            <Button variant="solid" colorScheme="red" onClick={handleReject}>
              Reject
            </Button>
          </ButtonGroup>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default AccessRequestDialog;
