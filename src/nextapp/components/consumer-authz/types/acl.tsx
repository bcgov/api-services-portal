import * as React from 'react';
import { Product, Environment } from '@/shared/types/query.types';
import { Box, Divider, Text, Switch, useToast } from '@chakra-ui/react';
import { gql } from 'graphql-request';
import { QueryKey, useQueryClient } from 'react-query';
import { useApiMutation } from '@/shared/services/api';

interface ConsumerACLProps {
  queryKey: any[];
  consumerId: string;
  aclGroups: string[];
  env: Environment;
}

const ConsumerACL: React.FC<ConsumerACLProps> = ({
  queryKey,
  consumerId,
  aclGroups,
  env,
}) => {
  const client = useQueryClient();
  const grantMutation = useApiMutation(mutation);
  const toast = useToast();
  const handleGrantToggle = React.useCallback(
    (prodEnvId: string, group: string) => async (
      event: React.ChangeEvent<HTMLInputElement>
    ) => {
      event.preventDefault();
      event.stopPropagation();

      const grant = event.target.checked;

      try {
        await grantMutation.mutateAsync({
          prodEnvId,
          group,
          consumerId,
          grant,
        });
        client.invalidateQueries(queryKey);
        toast({
          title: 'ACL updated',
          status: 'success',
          isClosable: true,
        });
      } catch (err) {
        toast({
          title: 'ACL update failed',
          description: err,
          status: 'error',
          isClosable: true,
        });
      }
    },
    [client, queryKey, grantMutation, toast]
  );

  return (
    <Box p={2}>
      <Switch
        name="acls"
        data-testid="acls-switch"
        value={env.id}
        defaultIsChecked={aclGroups.includes(env.appId)}
        onChange={handleGrantToggle(env.id, env.appId)}
      />
    </Box>
  );
};

export default ConsumerACL;

const mutation = gql`
  mutation ToggleConsumerACLMembership(
    $prodEnvId: ID!
    $consumerId: ID!
    $group: String!
    $grant: Boolean!
  ) {
    updateConsumerGroupMembership(
      prodEnvId: $prodEnvId
      consumerId: $consumerId
      group: $group
      grant: $grant
    )
  }
`;
