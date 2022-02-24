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
  useToast,
} from '@chakra-ui/react';
import { AccessRequest } from '@/shared/types/query.types';

import RequestDetails from './request-details';
import RequestControls from './controls';
import RequestAuthorization from './authorization';
import { gql } from 'graphql-request';
import { useApiMutation } from '@/shared/services/api';
import { useQueryClient } from 'react-query';

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
  const client = useQueryClient();
  const [tabIndex, setTabIndex] = React.useState(0);
  const [restrictions, setRestrictions] = React.useState([]);
  const [rateLimits, setRateLimits] = React.useState([]);
  const approveMutate = useApiMutation(approveMutation);
  const rejectMutate = useApiMutation(rejectMutation);
  const toast = useToast();

  const handleUpdateRateLimits = React.useCallback((payload) => {
    setRateLimits((state) => [...state, payload]);
  }, []);
  const handleUpdateRestrictions = React.useCallback((payload) => {
    setRestrictions((state) => [...state, payload]);
  }, []);
  const handleTabChange = React.useCallback((index) => {
    setTabIndex(index);
  }, []);
  const handleReject = async () => {
    onClose();
    setTabIndex(0);
    try {
      await rejectMutate.mutateAsync({
        id: data.id,
      });
      toast({
        status: 'warning',
        title: 'Access Request Rejected',
        description: 'The consumer will not be able to access your API',
        duration: null,
        isClosable: true,
      });
    } catch (err) {
      toast({
        status: 'error',
        title: 'Access Rejection Failed',
        description: err.message,
      });
    }
  };
  const handleAccept = async () => {
    onClose();
    setTabIndex(0);
    try {
      await approveMutate.mutateAsync({
        id: data.id,
        controls: JSON.stringify({
          plugins: [...restrictions, ...rateLimits],
        }),
      });
      client.invalidateQueries(['allConsumers']);
      toast({
        status: 'success',
        title: 'Access Request Approved',
        description: 'The consumer can now access your API',
        duration: null,
        isClosable: true,
      });
    } catch (err) {
      toast({
        status: 'error',
        title: 'Access Rejection Failed',
        description: err.message,
      });
    }
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
              <Tab px={0} cursor="pointer">
                Request Details
              </Tab>
              <Tab px={0} ml={4} cursor="pointer">
                Controls
              </Tab>
              <Tab px={0} ml={4} cursor="pointer">
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
            <RequestControls
              onUpdateRateLimits={handleUpdateRateLimits}
              onUpdateRestrictions={handleUpdateRestrictions}
              rateLimits={rateLimits}
              restrictions={restrictions}
            />
          </Box>
          <Box
            hidden={tabIndex !== 2}
            display={tabIndex === 2 ? 'block' : 'none'}
          >
            <RequestAuthorization id={data.id} />
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

const approveMutation = gql`
  mutation FulfillRequest($id: ID!, $controls: String!) {
    updateAccessRequest(
      id: $id
      data: {
        isApproved: true
        isIssued: true
        isComplete: true
        controls: $controls
      }
    ) {
      id
    }
  }
`;

const rejectMutation = gql`
  mutation Approve($id: ID!) {
    updateAccessRequest(
      id: $id
      data: { isApproved: false, isComplete: true }
    ) {
      id
    }
  }
`;
