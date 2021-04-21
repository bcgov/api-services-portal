import * as React from 'react';
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalOverlay,
  ModalHeader,
  Table,
  Thead,
  Tr,
  Th,
  Tbody,
  Td,
  Avatar,
  Icon,
  Flex,
  Text,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuOptionGroup,
  MenuItemOption,
} from '@chakra-ui/react';
import { FaCheck, FaPlusCircle } from 'react-icons/fa';
import groupBy from 'lodash/groupBy';
import { UmaPermissionTicket } from '@/shared/types/query.types';

interface PermissionItem {
  id: string;
  scope: string;
  scopeName: string;
}

interface UserItem {
  username: string;
  permissions: PermissionItem[];
}

interface ResourcesManagerDialogProps {
  data: UmaPermissionTicket[];
  open: boolean;
  onClose: () => void;
}

const ResourcesManagerDialog: React.FC<ResourcesManagerDialogProps> = ({
  data,
  open,
  onClose,
}) => {
  const groupedByRequester = groupBy(data, 'requester');
  const users = React.useMemo<UserItem[]>(() => {
    const result = [];
    const usernames = Object.keys(groupedByRequester);

    usernames.forEach((u) => {
      const permissions = groupedByRequester[u];

      result.push({
        username: u,
        permissions: permissions.map((p) => ({
          id: p.id,
          scope: p.scope,
          scopeName: p.scopeName,
        })),
      });
    });

    return result;
  }, [groupedByRequester]);

  return (
    <Modal isOpen={open} onClose={onClose} scrollBehavior="inside" size="4xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Resource Sharing Controls</ModalHeader>
        <ModalBody p={0}>
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Requestor</Th>
                <Th isNumeric>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {users.map((u) => (
                <Tr key={u.username}>
                  <Td>
                    <Flex align="center">
                      <Avatar name={u.username} size="xs" mr={2} />
                      <Text
                        fontSize="sm"
                        whiteSpace="nowrap"
                        textOverflow="ellipsis"
                        overflow="hidden"
                      >
                        {u.username}
                      </Text>
                    </Flex>
                  </Td>
                  <Td isNumeric>
                    <Menu closeOnSelect={false}>
                      <MenuButton
                        as={Button}
                        rightIcon={<Icon as={FaPlusCircle} />}
                        variant="primary"
                      >
                        Grant Access
                      </MenuButton>
                      <MenuList>
                        <MenuOptionGroup type="checkbox">
                          {u.permissions.map((p) => (
                            <MenuItemOption
                              key={p.scopeName}
                              value={p.scopeName}
                            >
                              {p.scopeName}
                            </MenuItemOption>
                          ))}
                        </MenuOptionGroup>
                      </MenuList>
                    </Menu>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </ModalBody>
        <ModalFooter>
          <Button onClick={onClose} variant="primary">
            Done
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ResourcesManagerDialog;
