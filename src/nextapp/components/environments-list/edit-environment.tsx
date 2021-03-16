import * as React from 'react';
import {
  Button,
  Checkbox,
  FormControl,
  FormLabel,
  FormErrorMessage,
  FormHelperText,
  Icon,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  useDisclosure,
  Input,
  IconButton,
  Select,
  VStack,
  TabPanel,
  TabPanels,
  Tab,
  Tabs,
  TabList,
} from '@chakra-ui/react';
import { FaPenSquare } from 'react-icons/fa';
import type { Environment } from '@/shared/types/query.types';

interface EditEnvironmentProps {
  data: Environment;
}

const EditEnvironment: React.FC<EditEnvironmentProps> = ({ data }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const flowTypes = [
    { value: 'public', label: 'Public'},
    { value: 'authorization-code', label: 'Oauth2 Authorization Code Flow'},
    { value: 'client-credentials', label: 'Oauth2 Client Credentials Flow'},
    { value: 'kong-api-key-acl', label: 'Kong API Key with ACL Flow'},
  ]

  return (
    <>
      <IconButton
        aria-label="Edit Environment"
        variant="tertiary"
        size="sm"
        onClick={onOpen}
      >
        <Icon as={FaPenSquare} />
      </IconButton>
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{`Edit ${data.name.toUpperCase()} Environment`}</ModalHeader>
          <ModalBody>
            <Tabs>
              <TabList>
                <Tab>Details</Tab>
                <Tab>Required Controls</Tab>
                <Tab>Services</Tab>
                <Tab>Requests</Tab>
              </TabList>
              <TabPanels>
                <TabPanel>
                  <VStack spacing={4}>
                    <FormControl isRequired>
                      <FormLabel>Environment</FormLabel>
                      <Select defaultValue={data.name}>
                        <option value="dev">Development</option>
                        <option value="test">Test</option>
                        <option value="sandbox">Sandbox</option>
                        <option value="prod">Production</option>
                        <option value="other">Other</option>
                      </Select>
                    </FormControl>
                    <FormControl isRequired>
                      <FormLabel>Auth Method</FormLabel>
                      <Select defaultValue={data.flow}>
                          {flowTypes.map(f => (<option value={f.value}>{f.label}</option>))}
                      </Select>
                    </FormControl>
                  </VStack>
                </TabPanel>
                <TabPanel>List of Controls</TabPanel>
                <TabPanel>list of services</TabPanel>
                <TabPanel>Application Requests</TabPanel>
              </TabPanels>
            </Tabs>
          </ModalBody>

          <ModalFooter>
            <Button mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary">Update</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default EditEnvironment;
