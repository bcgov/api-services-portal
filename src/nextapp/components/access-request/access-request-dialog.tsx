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
import { QueryKey, useQueryClient } from 'react-query';
import UserProfile from '../user-profile';

interface AccessRequestDialogProps {
  accessRequestsQueryKey: QueryKey;
  allConsumersQueryKey: QueryKey;
  data: AccessRequest;
  labels: string[];
  isOpen: boolean;
  onClose: () => void;
  title: string;
}

const AccessRequestDialog: React.FC<AccessRequestDialogProps> = ({
  accessRequestsQueryKey,
  allConsumersQueryKey,
  data,
  labels,
  isOpen,
  onClose,
  title,
}) => {
  const client = useQueryClient();
  const [tabIndex, setTabIndex] = React.useState(0);
  const restrictions = React.useState([]);
  const rateLimits = React.useState([]);
  const approveMutate = useApiMutation(approveMutation, {
    onSuccess() {
      client.invalidateQueries(accessRequestsQueryKey);
      client.invalidateQueries(allConsumersQueryKey);
    },
  });
  const rejectMutate = useApiMutation(rejectMutation, {
    onMutate: async () => {
      await client.cancelQueries('todos');
      const prevAccessRequests = client.getQueryData(accessRequestsQueryKey);
      client.setQueryData(accessRequestsQueryKey, (cached: Query = {}) => ({
        ...cached,
        allAccessRequestsByNamespace:
          cached.allAccessRequestsByNamespace?.filter(
            (d) => d.id !== data.id
          ) ?? [],
      }));
      return { prevAccessRequests };
    },
    onError: (_: Error, context: { prevAccessRequests: unknown }) => {
      client.setQueryData(accessRequestsQueryKey, context.prevAccessRequests);
    },
    onSettled: () => {
      client.invalidateQueries(accessRequestsQueryKey);
    },
  });
  const toast = useToast();

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
        description: Array.isArray(err) ? err[0].message : err?.message,
      });
    }
  };
  const handleAccept = async () => {
    onClose();
    setTabIndex(0);
    try {
      const formEl = document.forms['authorizationForm'];
      const labelsForm = document.forms['labelsForm'];
      const formData = new FormData(formEl);
      const labelsFormData = new FormData(labelsForm);
      const defaultClientScopes = formData.getAll('defaultClientScopes');
      const roles = formData.getAll('roles');
      // labels
      const labelGroups = labelsFormData.getAll('labelGroup') as string[];
      const labelValues = labelsFormData.getAll('values') as string[];
      const labels = labelGroups.map((labelGroup, index) => {
        return {
          labelGroup,
          values: JSON.parse(labelValues[index]),
        };
      });

      await approveMutate.mutateAsync({
        id: data.id,
        controls: JSON.stringify({
          plugins: [...restrictions[0], ...rateLimits[0]],
          defaultClientScopes,
          roles,
        }),
        labels: JSON.stringify(labels),
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
        title: 'Access Approval Failed',
        description: Array.isArray(err) ? err[0].message : err?.message,
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
        <ModalHeader data-testid="ar-modal-header" pos="relative">
          {title}
          <Box pos="absolute" top="20px" right={12}>
            <UserProfile data={data.requestor} heading="Requestor" />
          </Box>
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
            <RequestDetails data={data} labels={labels} />
          </Box>
          <Box
            hidden={tabIndex !== 1}
            display={tabIndex === 1 ? 'block' : 'none'}
            data-testid="ar-controls-tab"
          >
            <RequestControls
              prodEnvId={data.productEnvironment.id}
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
              variant="success"
              onClick={handleAccept}
              data-testid="ar-approve-btn"
            >
              Approve
            </Button>
            <Button
              variant="danger"
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
  mutation FulfillRequest($id: ID!, $controls: String!, $labels: String!) {
    updateAccessRequest(
      id: $id
      data: {
        isApproved: true
        isIssued: true
        isComplete: true
        controls: $controls
        labels: $labels
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
