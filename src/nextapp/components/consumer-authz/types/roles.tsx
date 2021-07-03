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

interface RolesProps {
  prodEnvId: string;
  consumerId: string;
  consumerUsername: string;
  credentialIssuer: CredentialIssuer;
}

const RolesComponent: React.FC<RolesProps> = ({
  consumerId,
  consumerUsername,
  prodEnvId,
  credentialIssuer,
}) => {
  const queryKey = ['consumer-roles', prodEnvId, consumerUsername];
  const variables = { prodEnvId, consumerUsername };
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
    (roleName: string) => async (
      event: React.ChangeEvent<HTMLInputElement>
    ) => {
      event.preventDefault();
      event.stopPropagation();

      const grant = event.target.checked;

      try {
        setBusy.on();
        await grantMutation.mutateAsync({
          prodEnvId,
          roleName,
          consumerUsername,
          grant,
        });
        toast({
          title: `Role ${roleName} ${grant ? 'assigned' : 'removed'}`,
          status: 'success',
        });
        setBusy.off();
        client.invalidateQueries(queryKey);
      } catch (err) {
        toast({
          title: 'Role update failed',
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
  const clientRoles = credentialIssuer.clientRoles
    ? JSON.parse(credentialIssuer.clientRoles)
    : [];

  return (
    <CheckboxGroup value={data.consumerScopesAndRoles.clientRoles}>
      <Wrap spacing={4}>
        {clientRoles.map((role) => (
          <WrapItem key={role}>
            <Checkbox
              value={role}
              name="roles"
              onChange={handleGrantToggle(role)}
            >
              {role}
            </Checkbox>
          </WrapItem>
        ))}
      </Wrap>
    </CheckboxGroup>
  );
};

export default RolesComponent;

const mutation = gql`
  mutation ToggleConsumerRoles(
    $prodEnvId: ID!
    $consumerUsername: String!
    $roleName: String!
    $grant: Boolean!
  ) {
    updateConsumerRoleAssignment(
      prodEnvId: $prodEnvId
      consumerUsername: $consumerUsername
      roleName: $roleName
      grant: $grant
    )
  }
`;

const query = gql`
  query GetConsumerScopesAndRoles($prodEnvId: ID!, $consumerUsername: ID!) {
    consumerScopesAndRoles(
      prodEnvId: $prodEnvId
      consumerUsername: $consumerUsername
    ) {
      id
      consumerType
      defaultScopes
      optionalScopes
      clientRoles
    }
  }
`;
