import * as React from 'react';
import { Button, Icon, useToast } from '@chakra-ui/react';
import { FaCheck, FaMinusCircle } from 'react-icons/fa';
import { gql } from 'graphql-request';
import { useApiMutation } from '@/shared/services/api';

interface AccessButtonProps {
  scope: string;
}

const AccessButton: React.FC<AccessButtonProps> = ({ scope }) => {
  const toast = useToast();
  const grant = useApiMutation(grantMutation);
  const revoke = useApiMutation(revokeMutation);

  const handleGrant = async () => {
    try {
      await grant.mutateAsync();
      toast({
        title: 'Access Granted',
        status: 'success',
      });
    } catch (err) {
      toast({
        title: 'Access Granted Failed',
        status: 'error',
      });
    }
  };
  const handleRevoke = async () => {
    try {
      await revoke.mutateAsync();
      toast({
        title: 'Access Revoked',
        status: 'success',
      });
    } catch (err) {
      toast({
        title: 'Access Revoke Failed',
        status: 'error',
      });
    }
  };

  if (scope === 'granted') {
    return (
      <Button
        colorScheme="red"
        isLoading={revoke.isLoading}
        loadingText="Revoking..."
        size="sm"
        leftIcon={<Icon as={FaMinusCircle} />}
        onClick={handleRevoke}
      >
        Revoke Access
      </Button>
    );
  }

  return (
    <Button
      colorScheme="green"
      isLoading={grant.isLoading}
      loadingText="Granting..."
      size="sm"
      leftIcon={<Icon as={FaCheck} />}
      onClick={handleGrant}
    >
      Grant Access
    </Button>
  );
};

export default AccessButton;

const grantUserMutation = gql`
  mutation GrantUserAccess(
    $credIssuerId: ID!
    $data: UMAPermissionTicketInput!
  ) {
    grantPermissions(credIssuerId: $credIssuerId, data: $data) {
      id
    }
  }
`;

const revokeMutation = gql`
  mutation RevokeAccess($credIssuerId: ID!, $tickets: [String]!) {
    revokePermissions(credIssuerId: $credIssuerId, ids: $tickets)
  }
`;

const grantMutation = gql`
  mutation GrantAccess(
    $credIssuerId: ID!
    $resourceId: String!
    $requesterId: String!
    $scopes: [String]!
  ) {
    approvePermissions(
      credIssuerId: $credIssuerId
      resourceId: $resourceId
      requesterId: $requesterId
      scopes: $scopes
    )
  }
`;
