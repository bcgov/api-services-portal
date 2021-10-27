import * as React from 'react';
import {
  Box,
  Button,
  ButtonGroup,
  Flex,
  Heading,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Tab,
  TabList,
  Tabs,
  Text,
} from '@chakra-ui/react';

import NewProfile from './new-profile';
import ProfileNameControl from './profile-name-control';
import ProfileCard from '../profile-card';
import AuthenticationForm from './authentication-form';
import { useAuth } from '@/shared/services/auth';
import { CredentialIssuer } from '@/shared/types/query.types';

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
  const [tabIndex, setTabIndex] = React.useState<number>(0);
  const [name, setName] = React.useState<string>(() => data?.name ?? '');
  const showTabs = name ?? Boolean(id);

  // Events
  const handleProfileNameCreate = React.useCallback((value: string) => {
    setName(value);
  }, []);
  const handleAuthenticationComplete = React.useCallback(() => {
    setTabIndex(1);
  }, []);

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
                  <Tab px={0} ml={4} cursor="default">
                    Authorization
                  </Tab>
                  <Tab px={0} ml={4} cursor="default">
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
                onCancel={onClose}
                onComplete={handleAuthenticationComplete}
              />
            )}
            {tabIndex === 1 && <Text>Authorization</Text>}
            {tabIndex === 2 && <Text>Client Management</Text>}
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default AuthorizationProfileDialog;
