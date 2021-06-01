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
  products: Product[];
}

const ConsumerACL: React.FC<ConsumerACLProps> = ({
  queryKey,
  consumerId,
  aclGroups,
  products,
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
          title: 'ACL Updated',
          status: 'success',
        });
      } catch (err) {
        toast({
          title: 'ACL update failed',
          description: err?.message,
          status: 'error',
        });
      }
    },
    [client, queryKey, grantMutation, toast]
  );

  const productGroups = [].concat
    .apply(
      [],
      products.map((product) => product.environments)
    )
    .map((env: Environment) => env.appId);
  return (
    <Box bgColor="white" p={4} mb={4}>
      {products.map((product: Product) => {
        return product.environments.map((env: Environment) => (
          <Box p={2}>
            <Switch
              name="acls"
              value={env.id}
              defaultIsChecked={aclGroups.includes(env.appId)}
              onChange={handleGrantToggle(env.id, env.appId)}
            />{' '}
            {product.name}{' '}
            <Text
              display="inline-block"
              fontSize="sm"
              bgColor="blue.300"
              color="white"
              textTransform="uppercase"
              px={2}
              borderRadius={2}
            >
              {env.name}
            </Text>
          </Box>
        ));
      })}
      <Divider />
      {aclGroups
        .filter((group: string) => !productGroups.includes(group))
        .map((group: string) => (
          <Box p={2}>
            <Switch name="acls" isDisabled={true} isChecked={true} /> {group}
          </Box>
        ))}
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
