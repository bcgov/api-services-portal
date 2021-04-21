import * as React from 'react';
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
  HStack,
  Input,
  ButtonGroup,
  FormControl,
  FormLabel,
  Icon,
  useDisclosure,
  VStack,
  useToast,
  Box,
  Text,
  WrapItem,
  Wrap,
} from '@chakra-ui/react';
import { FaPlusCircle } from 'react-icons/fa';
import { gql } from 'graphql-request';
import { UmaResourceSet } from '@/shared/types/query.types';
import { useApiMutation } from '@/shared/services/api';

interface ShareResourceDialogProps {
  credIssuerId: string;
  data: UmaResourceSet[];
  resourceId: string;
}

const ShareResourceDialog: React.FC<ShareResourceDialogProps> = ({
  credIssuerId,
  data,
  resourceId,
}) => {
  const [errors, setErrors] = React.useState<string | null>(null);
  const grant = useApiMutation(mutation);
  const toast = useToast();
  const { isOpen, onClose, onOpen } = useDisclosure();
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      const formData = new FormData(event.currentTarget);
      const scopeValues = formData.getAll('scopes') as string[];
      const scopes = scopeValues.map((s) => ({ name: s }));

      await grant.mutateAsync({
        credIssuerId,
        data: {
          username: formData.get('username') as string,
          resourceId,
          scopes,
        },
      });
      toast({
        title: 'Access Granted',
        status: 'success',
      });
      onClose();
    } catch (err) {
      setErrors(err?.message);
    }
  };

  return (
    <>
      <Button
        leftIcon={<Icon as={FaPlusCircle} />}
        onClick={onOpen}
        variant="primary"
      >
        Add User
      </Button>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        scrollBehavior="inside"
        size="xl"
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Grant User Access</ModalHeader>
          <ModalBody>
            {errors && (
              <Box bgColor="red.500" px={4} py={2} color="white">
                <Text>{errors}</Text>
              </Box>
            )}
            <form onSubmit={handleSubmit}>
              <VStack spacing={4} overflow="hidden">
                <FormControl isRequired>
                  <FormLabel>Username</FormLabel>
                  <Input
                    name="username"
                    type="text"
                    placeholder="Enter username of team member you'd like to add"
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Permissions</FormLabel>
                  <CheckboxGroup>
                    <Wrap spacing={4}>
                      {data.map((r) => (
                        <WrapItem key={r.id}>
                          <Checkbox value={r.name} name="scopes">
                            {r.name}
                          </Checkbox>
                        </WrapItem>
                      ))}
                    </Wrap>
                  </CheckboxGroup>
                </FormControl>
              </VStack>
            </form>
          </ModalBody>
          <ModalFooter>
            <ButtonGroup>
              <Button onClick={onClose}>Cancel</Button>
              <Button variant="primary">Share</Button>
            </ButtonGroup>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default ShareResourceDialog;

const mutation = gql`
  mutation GrantUserAccess(
    $credIssuerId: ID!
    $data: UMAPermissionTicketInput!
  ) {
    grantPermissions(credIssuerId: $credIssuerId, data: $data) {
      id
    }
  }
`;
