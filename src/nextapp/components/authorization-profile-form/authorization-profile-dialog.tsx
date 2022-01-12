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
import { gql } from 'graphql-request';
import { useQueryClient } from 'react-query';
import { useApiMutation } from '@/shared/services/api';
import { useAuth } from '@/shared/services/auth';
import {
  CredentialIssuer,
  CredentialIssuerCreateInput,
} from '@/shared/types/query.types';

import NewProfile from './new-profile';
import ProfileNameControl from './profile-name-control';
import UserProfile from '../user-profile';
import AuthenticationForm from './authentication-form';
import AuthorizationForm from './authorization-form';
import ClientManagement from './client-management';
import { EnvironmentItem } from './types';

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
  const kongFlow = 'kong-api-key-acl';
  const [flow, setFlow] = React.useState<string>(() => {
    // The radios are a combo of flow + clientAuthenticator, joined by a '.'
    if (data) {
      // ... expect Kong ACL
      if (data.flow === kongFlow) {
        return data.flow;
      }

      return `${data.flow}.${data.clientAuthenticator}`;
    }
    return 'client-credentials.client-secret';
  });
  const [flowValue, clientAuthenticator]: string[] = React.useMemo(() => {
    if (flow === kongFlow) {
      return [kongFlow];
    }
    return flow.split('.');
  }, [flow, kongFlow]);
  const [tabIndex, setTabIndex] = React.useState<number>(0);
  const [name, setName] = React.useState<string>(() => data?.name ?? '');
  const client = useQueryClient();
  const toast = useToast();
  const createMutate = useApiMutation(createMutation);
  const editMutate = useApiMutation(editMutation);

  const showTabs = React.useMemo(() => name ?? Boolean(id), [name, id]);
  const isKongFlow = flow === kongFlow;

  // Events
  const handleProfileNameCreate = React.useCallback((value: string) => {
    setName(value);
  }, []);
  const handleKongProfile = React.useCallback(async () => {
    try {
      const data = {
        ...payload,
        name,
        flow: flowValue,
        clientAuthenticator,
        id: undefined,
        owner: undefined,
      };

      if (id) {
        await editMutate.mutateAsync({
          id,
          data,
        });
      } else {
        await createMutate.mutateAsync({
          data,
        });
      }
    } catch (e) {
      const requestType = id ? 'update' : 'create';
      toast({
        title: `Profile ${requestType} failed`,
        status: 'error',
        description: Array.isArray(e) ? e[0].message : '',
      });
    }
  }, [
    clientAuthenticator,
    createMutate,
    editMutate,
    flowValue,
    id,
    name,
    payload,
    toast,
  ]);
  const handleAuthenticationComplete = React.useCallback(
    (payload: FormData) => {
      const formData = Object.fromEntries(payload) as { flow: string };
      const [flow, clientAuthenticator] = formData.flow.split('.');

      setPayload((state) => ({
        ...state,
        ...formData,
        flow,
        clientAuthenticator,
      }));

      if (isKongFlow) {
        handleKongProfile();
        onClose();
      } else {
        setTabIndex(1);
      }
    },
    [handleKongProfile, isKongFlow, onClose]
  );
  const handleAuthorizationComplete = React.useCallback((payload: FormData) => {
    setPayload((state) => ({ ...state, ...Object.fromEntries(payload) }));
    setTabIndex(2);
  }, []);
  const handleClose = React.useCallback(() => {
    if (!id) {
      setName('');
    }
    setTabIndex(0);
    onClose();
  }, [id, onClose]);
  const handleClientManagementComplete = React.useCallback(
    async (environments: EnvironmentItem[]) => {
      try {
        if (id) {
          await editMutate.mutateAsync({
            id,
            data: {
              ...payload,
              flow: flowValue,
              clientAuthenticator,
              environmentDetails: JSON.stringify(environments),
              name,
              id: undefined,
              owner: undefined,
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
              flow: flowValue,
              clientAuthenticator,
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
        handleClose();
      } catch (e) {
        const requestType = id ? 'update' : 'create';
        toast({
          title: `Profile ${requestType} failed`,
          status: 'error',
          description: Array.isArray(e) ? e[0].message : '',
        });
      }
    },
    [
      client,
      clientAuthenticator,
      flowValue,
      createMutate,
      editMutate,
      handleClose,
      id,
      name,
      payload,
      toast,
    ]
  );

  React.useEffect(() => {
    setName(data?.name);
  }, [data?.name]);

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
                <ProfileNameControl id={id} name={name} onChange={setName} />
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
