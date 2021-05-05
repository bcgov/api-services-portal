import * as React from 'react';
import { Button, ButtonGroup, Icon, useToast } from '@chakra-ui/react';
import { FaCheck, FaTimes } from 'react-icons/fa';
import NextLink from 'next/link';
import { gql } from 'graphql-request';
import { QueryKey, useMutation, useQueryClient } from 'react-query';
import api from '@/shared/services/api';
import { RequestControls } from '@/shared/types/app.types';

interface RequestActionsProps {
  id: string;
  controls: RequestControls;
  queryKey: QueryKey;
}

const RequestActions: React.FC<RequestActionsProps> = ({ id, controls, queryKey }) => {
  const client = useQueryClient();
  const toast = useToast();
  const approve = useMutation((id: string) => api(approveMutation, { id, controls: JSON.stringify(controls) }, { ssr: false }));
  const reject = useMutation((id: string) => api(rejectMutation, { id }, { ssr: false }));

  const handleReject = async () => {
    try {
      await reject.mutateAsync(id);
      toast({
        title: 'Request Rejected',
        status: 'success',
      });
      client.invalidateQueries(queryKey);
    } catch (err) {
      toast({
        title: 'Reject failed',
        status: 'error',
      });
    }
  };

  const handleApprove = async () => {
    try {
      await approve.mutateAsync(id);
      toast({
        title: 'Request Approved',
        status: 'success',
      });
      client.invalidateQueries(queryKey);
    } catch (err) {
      toast({
        title: 'Approval failed',
        status: 'error',
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
        id: $id, 
        data: { isApproved: true, isIssued: true, isComplete: true, controls: $controls }
    ) {
        id
    }
  }
`

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
