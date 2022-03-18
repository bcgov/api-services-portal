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
import { AccessRequest, Query } from '@/shared/types/query.types';

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
  queryKey: string;
  title: string;
}

const AccessRequestDialog: React.FC<AccessRequestDialogProps> = ({
  data,
  isOpen,
  onClose,
  queryKey,
  title,
}) => {
  const client = useQueryClient();
  const [tabIndex, setTabIndex] = React.useState(0);
  const [restrictions, setRestrictions] = React.useState([]);
  const [rateLimits, setRateLimits] = React.useState([]);
  const approveMutate = useApiMutation(approveMutation, {
    onSuccess() {
      client.invalidateQueries(queryKey);
    },
  });
  const rejectMutate = useApiMutation(rejectMutation, {
    onMutate: async () => {
      await client.cancelQueries('todos');
      const prevAccessRequests = client.getQueryData(queryKey);
      client.setQueryData(queryKey, (cached: Query) => ({
        ...cached,
        allAccessRequestsByNamespace: cached.allAccessRequestsByNamespace.filter(
          (d) => d.id !== data.id
        ),
      }));
      return { prevAccessRequests };
    },
    onError: (err: Error, context) => {
      client.setQueryData(queryKey, context.prevAccessRequests);
    },
    onSettled: () => {
      client.invalidateQueries(queryKey);
    },
  });
  const toast = useToast();

  const handleUpdateRateLimits = React.useCallback((payload) => {
    setRateLimits((state) => [...state, payload]);
  }, []);
  const handleUpdateRestrictions = (payload) => {
    setRestrictions((state) => [...state, payload]);
  };
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
      const formEl = document.forms['authorizationForm'];
      const formData = new FormData(formEl);
      const defaultClientScopes = formData.getAll('defaultClientScopes');
      const roles = formData.getAll('roles');
      await approveMutate.mutateAsync({
        id: data.id,
        controls: JSON.stringify({
          plugins: [...restrictions, ...rateLimits],
          defaultClientScopes,
          roles,
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
            <TabList mb={5} data-testid="ar-tabs">
              <Tab px={0}>Request Details</Tab>
              <Tab px={0} ml={4}>
                Controls
              </Tab>
              <Tab px={0} ml={4}>
                Authorization
              </Tab>
            </TabList>
          </Tabs>
        </ModalHeader>
        <ModalCloseButton data-testid="access-request-close-btn" />
        <ModalBody>
          <Box
            hidden={tabIndex !== 0}
            display={tabIndex === 0 ? 'block' : 'none'}
            data-testid="ar-request-details-tab"
          >
            <RequestDetails data={data} />
          </Box>
          <Box
            hidden={tabIndex !== 1}
            display={tabIndex === 1 ? 'block' : 'none'}
            data-testid="ar-controls-tab"
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
            data-testid="ar-authorization-tab"
          >
            <RequestAuthorization id={data.id} />
          </Box>
        </ModalBody>
        <ModalFooter>
          <ButtonGroup>
            <Button
              variant="solid"
              colorScheme="green"
              onClick={handleAccept}
              data-testid="ar-approve-btn"
            >
              Accept
            </Button>
            <Button
              variant="solid"
              colorScheme="red"
              onClick={handleReject}
              data-testid="ar-reject-btn"
            >
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
  mutation RejectAccessRequest($id: ID!) {
    updateAccessRequest(
      id: $id
      data: { isApproved: false, isComplete: true }
    ) {
      id
    }
  }
`;
