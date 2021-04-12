import * as React from 'react';
import { Button, ButtonGroup, Icon, useToast } from '@chakra-ui/react';
import { FaCheck, FaTimes } from 'react-icons/fa';
import NextLink from 'next/link';
import { gql } from 'graphql-request';
import { QueryKey, useMutation, useQueryClient } from 'react-query';
import api from '@/shared/services/api';

interface RequestActionsProps {
  id: string;
  queryKey: QueryKey;
}

const RequestActions: React.FC<RequestActionsProps> = ({ id, queryKey }) => {
  const client = useQueryClient();
  const toast = useToast();
  const reject = useMutation((id: string) => api(mutation, { id }));

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

  return (
    <ButtonGroup isAttached>
      <NextLink href={`/manager/poc/requests/issue/${id}`}>
        <Button
          colorScheme="green"
          disabled={reject.isLoading}
          leftIcon={<Icon as={FaCheck} />}
        >
          Approve
        </Button>
      </NextLink>
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

const mutation = gql`
  mutation Approve($id: ID!) {
    updateAccessRequest(
      id: $id
      data: { isApproved: false, isComplete: true }
    ) {
      id
    }
  }
`;
