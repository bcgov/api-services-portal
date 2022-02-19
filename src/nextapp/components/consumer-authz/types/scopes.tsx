import * as React from 'react';
import { useApi } from '@/shared/services/api';
import { gql } from 'graphql-request';
import { CredentialIssuer } from '@/shared/types/query.types';
import {
  Button,
  Checkbox,
  CheckboxGroup,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalOverlay,
  ModalHeader,
  Input,
  ButtonGroup,
  FormControl,
  FormLabel,
  Icon,
  useDisclosure,
  VStack,
  Progress,
  useToast,
  Box,
  Text,
  WrapItem,
  Wrap,
  useBoolean,
} from '@chakra-ui/react';
import { QueryKey, useQueryClient } from 'react-query';
import { useApiMutation } from '@/shared/services/api';

interface ScopesProps {
  prodEnvId: string;
  consumerId: string;
  consumerUsername: string;
  credentialIssuer: CredentialIssuer;
}

const ScopesComponent: React.FC<ScopesProps> = ({
  consumerId,
  consumerUsername,
  prodEnvId,
  credentialIssuer,
}) => {
  const queryKey = ['consumer-scopes', prodEnvId, consumerId];
  const variables = { prodEnvId, consumerId };
  const { data, isFetching, isLoading, isSuccess } = useApi(
    queryKey,
    {
      query,
      variables,
    },
    {
      retry: false,
      suspense: false,
    }
  );

  const [busy, setBusy] = useBoolean(false);

  const client = useQueryClient();
  const grantMutation = useApiMutation(mutation);
  const toast = useToast();
  const handleGrantToggle = React.useCallback(
    (scopeName: string) => async (
      event: React.ChangeEvent<HTMLInputElement>
    ) => {
      event.preventDefault();
      event.stopPropagation();

      const grant = event.target.checked;

      try {
        setBusy.on();
        await grantMutation.mutateAsync({
          prodEnvId,
          scopeName,
          consumerId,
          grant,
        });
        toast({
          title: `Scope ${scopeName} ${grant ? 'assigned' : 'removed'}`,
          status: 'success',
        });
        setBusy.off();
        client.invalidateQueries(queryKey);
      } catch (err) {
        toast({
          title: 'Scope update failed',
          description: err?.message,
          status: 'error',
        });
        setBusy.off();
      }
    },
    [client, queryKey, grantMutation, toast, busy]
  );

  if (isLoading || isFetching || busy) {
    return <Progress size="xs" isIndeterminate />;
  }
  if (data == null) {
    return <Text>Error</Text>;
  }
  if (data.consumerScopesAndRoles.id == '') {
    return <></>;
  }
  const clientScopes = credentialIssuer.availableScopes
    ? JSON.parse(credentialIssuer.availableScopes)
    : [];

  return (
    <CheckboxGroup value={data.consumerScopesAndRoles.defaultScopes}>
      <Wrap spacing={4}>
        {clientScopes.map((scope) => (
          <WrapItem key={scope}>
            <Checkbox
              value={scope}
              name="scopes"
              onChange={handleGrantToggle(scope)}
            >
              {scope}
            </Checkbox>
          </WrapItem>
        ))}
      </Wrap>
    </CheckboxGroup>
  );
};

export default ScopesComponent;

const mutation = gql`
  mutation ToggleConsumerScopes(
    $prodEnvId: ID!
    $consumerId: String!
    $scopeName: String!
    $grant: Boolean!
  ) {
    updateConsumerScopeAssignment(
      prodEnvId: $prodEnvId
      consumerId: $consumerId
      scopeName: $scopeName
      grant: $grant
    )
  }
`;

const query = gql`
  query GetConsumerScopesAndRoles($prodEnvId: ID!, $consumerId: ID!) {
    consumerScopesAndRoles(prodEnvId: $prodEnvId, consumerId: $consumerId) {
      id
      consumerType
      defaultScopes
      optionalScopes
      clientRoles
    }
  }
`;
