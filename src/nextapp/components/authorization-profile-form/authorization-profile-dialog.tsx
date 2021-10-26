import * as React from 'react';
import {
  Box,
  Flex,
  Heading,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Tab,
  TabList,
  Tabs,
} from '@chakra-ui/react';

import ProfileNameControl from './profile-name-control';
import ProfileCard from '../profile-card';

interface AuthorizationProfileDialogProps {
  id?: string;
  open: boolean;
  onClose: () => void;
}

const AuthorizationProfileDialog: React.FC<AuthorizationProfileDialogProps> = ({
  id,
  open,
  onClose,
}) => {
  return (
    <Modal isOpen={open} onClose={onClose} size="3xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          <Flex align="center" justify="space-between">
            <ProfileNameControl id={id} name="test" />
          </Flex>
          <Tabs>
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
                <ProfileCard
                  data={{
                    username: 'admin',
                    name: 'Sarah Jane',
                    email: 'sarahjane@gmail.com',
                  }}
                />
              </Box>
            </TabList>
          </Tabs>
        </ModalHeader>
        <ModalBody>Content</ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default AuthorizationProfileDialog;
