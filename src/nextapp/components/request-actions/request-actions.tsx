import * as React from 'react';
import { Button, ButtonGroup, Icon, useToast } from '@chakra-ui/react';
import { FaCheck, FaTimes } from 'react-icons/fa';
import { gql } from 'graphql-request';
import { QueryKey, useQueryClient } from 'react-query';
import { useApiMutation } from '@/shared/services/api';
import { RequestControls } from '@/shared/types/app.types';

interface RequestActionsProps {
  id: string;
  controls: RequestControls;
  queryKey: QueryKey;
}

const RequestActions: React.FC<RequestActionsProps> = ({
  id,
  controls,
  queryKey,
}) => {
  const client = useQueryClient();
  const toast = useToast();
  const approve = useApiMutation<{ id: string; controls: string }>(
    approveMutation
  );
  const reject = useApiMutation<{ id: string }>(rejectMutation);

  const handleReject = async () => {
    try {
      await reject.mutateAsync({ id });
      toast({
        title: 'Request Rejected',
        status: 'success',
      });
      client.invalidateQueries(queryKey);
    } catch (err) {
      toast({
        title: 'Reject failed',
        status: 'error',
        description: Array.isArray(err) ? err[0].message : err?.message,
      });
    }
  };

  const handleApprove = async () => {
    try {
      await approve.mutateAsync({ id, controls: JSON.stringify(controls) });
      toast({
        title: 'Request Approved',
        status: 'success',
      });
      client.invalidateQueries(queryKey);
    } catch (err) {
      toast({
        title: 'Approval failed',
        status: 'error',
        description: Array.isArray(err) ? err[0].message : err?.message,
      });
    }
  };

  return (
    <ButtonGroup isAttached>
      <Button
        colorScheme="green"
        disabled={approve.isLoading}
        isLoading={approve.isLoading}
        leftIcon={<Icon as={FaCheck} />}
        onClick={handleApprove}
      >
        Approve
      </Button>
      <Button
        colorScheme="orange"
        disabled={reject.isLoading}
        isLoading={reject.isLoading}
        rightIcon={<Icon as={FaTimes} />}
        onClick={handleReject}
      >
        Deny
      </Button>
    </ButtonGroup>
  );
};

export default RequestActions;

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
