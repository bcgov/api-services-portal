import * as React from 'react';
import {
  Box,
  Flex,
  Modal,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Tab,
  TabList,
  Tabs,
  useToast,
} from '@chakra-ui/react';

import NewProfile from './new-profile';
import ProfileNameControl from './profile-name-control';
import UserProfile from '../user-profile';
import AuthenticationForm from './authentication-form';
import { useAuth } from '@/shared/services/auth';
import {
  CredentialIssuer,
  CredentialIssuerCreateInput,
} from '@/shared/types/query.types';
import AuthorizationForm from './authorization-form';
import ClientManagement from './client-management';
import { EnvironmentItem } from './types';
import { gql } from 'graphql-request';
import { useQueryClient } from 'react-query';
import { useApiMutation } from '@/shared/services/api';

/* TODO
 * - Validation of required Tag-inputs
 * - Parsing the flow radios
 * - Pass environments
 */

interface AuthorizationProfileDialogProps {
  data?: CredentialIssuer;
  id?: string;
  open: boolean;
  onClose: () => void;
}

const AuthorizationProfileDialog: React.FC<AuthorizationProfileDialogProps> = ({
  data,
  id,
  open,
  onClose,
}) => {
  const { user } = useAuth();
  const [payload, setPayload] = React.useState<CredentialIssuerCreateInput>(
    () => data ?? {}
  );
  const [flow, setFlow] = React.useState<string>(
    'client-credentials.client-secret'
  );
  const [tabIndex, setTabIndex] = React.useState<number>(0);
  const [name, setName] = React.useState<string>(() => data?.name ?? '');
  const client = useQueryClient();
  const toast = useToast();
  const createMutate = useApiMutation(createMutation);
  const editMutate = useApiMutation(editMutation);

  const showTabs = React.useMemo(() => name ?? Boolean(id), [name, id]);
  const isKongFlow = flow === 'kong-api-key-acl';

  // Events
  const handleProfileNameCreate = React.useCallback((value: string) => {
    setName(value);
  }, []);
  const handleAuthenticationComplete = React.useCallback(
    (payload: FormData) => {
      setPayload((state) => ({ ...state, ...Object.fromEntries(payload) }));
      if (isKongFlow) {
        onClose();
      } else {
        setTabIndex(1);
      }
    },
    [isKongFlow, onClose]
  );
  const handleAuthorizationComplete = React.useCallback((payload: FormData) => {
    setPayload((state) => ({ ...state, ...Object.fromEntries(payload) }));
    setTabIndex(2);
  }, []);
  const handleClientManagementComplete = React.useCallback(
    async (environments: EnvironmentItem[]) => {
      try {
        if (id) {
          await editMutate.mutateAsync({
            data: {
              ...payload,
              flow,
              environmentDetails: JSON.stringify(environments),
              name,
            },
          });
          toast({
            title: 'Profile updated',
            status: 'success',
          });
        } else {
          await createMutate.mutateAsync({
            data: {
              ...payload,
              flow,
              environmentDetails: JSON.stringify(environments),
              name,
            },
          });
          toast({
            title: 'Profile created',
            status: 'success',
          });
        }
        client.invalidateQueries('authorizationProfiles');
        onClose();
      } catch (e) {
        toast({
          title: 'Profile creation failed',
          status: 'error',
          description: Array.isArray(e) ? e[0].message : '',
        });
      }
    },
    [client, flow, createMutate, editMutate, id, name, onClose, payload, toast]
  );
  const handleClose = React.useCallback(() => {
    if (!id) {
      setName('');
    }
    setTabIndex(0);
    onClose();
  }, [id, onClose]);

  return (
    <Modal isOpen={open} onClose={handleClose} size="5xl">
      <ModalOverlay />
      <ModalContent>
        {!showTabs && (
          <NewProfile onCancel={onClose} onComplete={handleProfileNameCreate} />
        )}
        {showTabs && (
          <>
            <ModalHeader>
              <Flex align="center" justify="space-between">
                <ProfileNameControl id={id} name={name} />
              </Flex>
              <Tabs index={tabIndex} pos="relative">
                <TabList mt={4} mb={2}>
                  <Tab px={0} cursor="default">
                    Authentication
                  </Tab>
                  <Tab px={0} ml={4} cursor="default" isDisabled={isKongFlow}>
                    Authorization
                  </Tab>
                  <Tab px={0} ml={4} cursor="default" isDisabled={isKongFlow}>
                    Client Management
                  </Tab>
                  <Box flex={1} />
                  <Box p="relative" mt={-6} mb={2}>
                    <UserProfile data={user} />
                  </Box>
                </TabList>
              </Tabs>
            </ModalHeader>
            {tabIndex === 0 && (
              <AuthenticationForm
                id={id}
                onChange={setFlow}
                onCancel={handleClose}
                onComplete={handleAuthenticationComplete}
                value={flow}
              />
            )}
            {tabIndex === 1 && (
              <AuthorizationForm
                data={data}
                id={id}
                onCancel={handleClose}
                onComplete={handleAuthorizationComplete}
                ownerName={user?.name}
              />
            )}
            {tabIndex === 2 && (
              <ClientManagement
                data={data?.environmentDetails}
                id={id}
                onCancel={handleClose}
                onComplete={handleClientManagementComplete}
              />
            )}
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default AuthorizationProfileDialog;

const createMutation = gql`
  mutation CreateAuthzProfile($data: CredentialIssuerCreateInput!) {
    createCredentialIssuer(data: $data) {
      id
    }
  }
`;

const editMutation = gql`
  mutation UpdateAuthzProfile($id: ID!, $data: CredentialIssuerUpdateInput!) {
    updateCredentialIssuer(id: $id, data: $data) {
      id
    }
  }
`;
