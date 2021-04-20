import * as React from 'react';
import { Button, Icon, useToast } from '@chakra-ui/react';
import { FaCheck, FaMinusCircle } from 'react-icons/fa';
import { gql } from 'graphql-request';
import { useApiMutation } from '@/shared/services/api';

interface AccessButtonProps {
  id: string;
  requesterId: string;
  resourceId: string;
  scope: string;
  tickets: string[];
}

const AccessButton: React.FC<AccessButtonProps> = ({
  id,
  requesterId,
  resourceId,
  scope,
  tickets,
}) => {
  const toast = useToast();
  const grant = useApiMutation<{
    credIssuerId: string;
    resourceId: string;
    requesterId: string;
    scopes: string[];
  }>(grantMutation);
  const revoke = useApiMutation<{ credIssuerId: string; tickets: string[] }>(
    revokeMutation
  );

  const handleGrant = async () => {
    try {
      const payload = {
        credIssuerId: id,
        resourceId,
        requesterId,
        scopes: tickets,
      };
      await grant.mutateAsync(payload);
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
      const payload = { credIssuerId: id, tickets };
      await revoke.mutateAsync(payload);
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
