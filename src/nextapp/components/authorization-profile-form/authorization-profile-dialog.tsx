import * as React from 'react';
import {
  Box,
  Flex,
  Heading,
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
import ProfileCard from '../profile-card';
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
  const [payload, setPayload] = React.useState<CredentialIssuerCreateInput>({});
  const [flow, setFlow] = React.useState<string>(
    'client-credentials.client-secret'
  );
  const [tabIndex, setTabIndex] = React.useState<number>(0);
  const [name, setName] = React.useState<string>(() => data?.name ?? '');
  const client = useQueryClient();
  const toast = useToast();
  const { mutateAsync } = useApiMutation(mutation);

  const showTabs = name ?? Boolean(id);
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
        await mutateAsync({
          data: {
            ...payload,
            flow,
            environmentDetails: JSON.stringify(environments),
            name,
          },
        });
        client.invalidateQueries('authorizationProfiles');
        toast({
          title: 'Profile created',
          status: 'success',
        });
        onClose();
      } catch (e) {
        toast({
          title: 'Profile creation failed',
          status: 'error',
          description: Array.isArray(e) ? e[0].message : '',
        });
      }
    },
    [client, flow, mutateAsync, onClose, payload, toast]
  );

  return (
    <Modal isOpen={open} onClose={onClose} size="3xl">
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
              <Tabs index={tabIndex}>
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
                  <Box p="relative" mt={-4} mb={2}>
                    <Heading size="xs" mb={2}>
                      Administrator:
                    </Heading>
                    <ProfileCard data={user} />
                  </Box>
                </TabList>
              </Tabs>
            </ModalHeader>
            {tabIndex === 0 && (
              <AuthenticationForm
                onChange={setFlow}
                onCancel={onClose}
                onComplete={handleAuthenticationComplete}
                value={flow}
              />
            )}
            {tabIndex === 1 && (
              <AuthorizationForm
                onCancel={onClose}
                onComplete={handleAuthorizationComplete}
              />
            )}
            {tabIndex === 2 && (
              <ClientManagement
                onCancel={onClose}
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

const mutation = gql`
  mutation CreateAuthzProfile($data: CredentialIssuerCreateInput!) {
    createCredentialIssuer(data: $data) {
      id
    }
  }
`;
