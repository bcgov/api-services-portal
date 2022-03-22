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
import { CredentialIssuer } from '@/shared/types/query.types';

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
  // Cache the authorization page data so we don't loose it between steps while not having to
  // manage the state of the form
  const newAuthorizationData = React.useRef<CredentialIssuer>();
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
  const isKongFlow = React.useMemo(() => flow === kongFlow, [flow, kongFlow]);

  // Events
  const handleClose = React.useCallback(() => {
    if (!id) {
      setName('');
    }
    setTabIndex(0);
    setFlow('client-credentials.client-secret');
    onClose();
  }, [id, onClose]);
  const handleProfileNameCreate = React.useCallback((value: string) => {
    setName(value);
  }, []);
  const handleTabChange = React.useCallback(
    (index) => {
      if (id) {
        setTabIndex(index);
      }
    },
    [id]
  );
  const handleCreateProfile = React.useCallback(
    async (payload: CredentialIssuer) => {
      try {
        await createMutate.mutateAsync({
          data: {
            ...payload,
            ...newAuthorizationData.current,
            flow: flowValue,
            clientAuthenticator,
            name,
          },
        });
        toast({
          title: 'Profile created',
          status: 'success',
        });
        client.invalidateQueries('authorizationProfiles');
        handleClose();
      } catch (err) {
        toast({
          title: 'Profile create failed',
          status: 'error',
        });
      }
    },
    [
      client,
      clientAuthenticator,
      createMutate,
      flowValue,
      handleClose,
      name,
      toast,
    ]
  );
  const handleSaveProfile = React.useCallback(
    async (payload: CredentialIssuer) => {
      try {
        await editMutate.mutateAsync({
          id,
          data: {
            ...payload,
            flow: flowValue,
            clientAuthenticator,
            name,
            id: undefined,
            owner: undefined,
          },
        });
        toast({
          title: 'Profile updated',
          status: 'success',
        });
        client.invalidateQueries();
        handleClose();
      } catch (err) {
        toast({
          title: 'Profile save failed',
          status: 'error',
        });
      }
    },
    [
      client,
      clientAuthenticator,
      editMutate,
      flowValue,
      handleClose,
      id,
      name,
      toast,
    ]
  );
  const handleAuthenticationComplete = React.useCallback(
    (form: FormData) => {
      const formData = Object.fromEntries(form) as { flow: string };
      const [flow, clientAuthenticator] = formData.flow.split('.');

      const payload = {
        ...data,
        ...formData,
        flow,
        clientAuthenticator,
      };

      if (id) {
        handleSaveProfile(payload);
      } else {
        if (isKongFlow) {
          handleCreateProfile(payload);
        } else {
          setTabIndex(1);
        }
      }
    },
    [data, handleCreateProfile, handleSaveProfile, id, isKongFlow]
  );
  const handleAuthorizationComplete = React.useCallback(
    (payload: FormData) => {
      const formData = Object.fromEntries(payload);
      if (id) {
        handleSaveProfile({ ...data, ...formData });
      } else {
        newAuthorizationData.current = {
          ...newAuthorizationData.current,
          ...formData,
        };
        setTabIndex(2);
      }
    },
    [data, handleSaveProfile, id]
  );
  const handleClientManagementComplete = React.useCallback(
    (environments: EnvironmentItem[]) => {
      const payload = {
        ...data,
        environmentDetails: JSON.stringify(environments),
      };

      if (id) {
        handleSaveProfile(payload);
      } else {
        handleCreateProfile(payload);
      }
    },
    [data, handleCreateProfile, handleSaveProfile, id]
  );

  React.useEffect(() => {
    setName(data?.name);
  }, [data?.name]);

  return (
    <Modal
      closeOnEsc={!showTabs}
      isOpen={open}
      onClose={handleClose}
      size="5xl"
      scrollBehavior="inside"
    >
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
              <Tabs index={tabIndex} pos="relative" onChange={handleTabChange}>
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
                  <Box p="relative" mt={-10} mb={2}>
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
