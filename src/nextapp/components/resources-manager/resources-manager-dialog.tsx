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
  HStack,
  Tag,
  Flex,
  Text,
  Input,
  Box,
  ButtonGroup,
} from '@chakra-ui/react';
import { FaMinusCircle, FaPlusCircle } from 'react-icons/fa';
import ShareResourceDialog from './add-user';

interface ResourcesManagerDialogProps {
  open: boolean;
  onClose: () => void;
}

const ResourcesManagerDialog: React.FC<ResourcesManagerDialogProps> = ({
  open,
  onClose,
}) => {
  return (
    <Modal isOpen={open} onClose={onClose} scrollBehavior="inside" size="4xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Resource Sharing Controls</ModalHeader>
        <ModalBody p={0}>
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>User</Th>
                <Th colSpan={2}>Permission</Th>
              </Tr>
            </Thead>
            <Tbody>
              <Tr>
                <Td>
                  <Flex align="center">
                    <Avatar name="Joshua Jones" size="xs" mr={2} />
                    <Text
                      fontSize="sm"
                      whiteSpace="nowrap"
                      textOverflow="ellipsis"
                      overflow="hidden"
                    >
                      joshua@general-metrics.com
                    </Text>
                  </Flex>
                </Td>
                <Td width="50%">
                  <HStack shouldWrapChildren spacing={2}>
                    {['api-owner', 'credential-admin'].map((d) => (
                      <Tag
                        key={d}
                        variant="solid"
                        colorScheme="green"
                        whiteSpace="nowrap"
                      >
                        {d}
                      </Tag>
                    ))}
                  </HStack>
                </Td>
                <Td textAlign="right">
                  <Button
                    variant="secondary"
                    size="xs"
                    leftIcon={<Icon as={FaMinusCircle} />}
                  >
                    Revoke Access
                  </Button>
                </Td>
              </Tr>
            </Tbody>
          </Table>
        </ModalBody>
        <ModalFooter justifyContent="space-between">
          <ShareResourceDialog />
          <Button onClick={onClose}>Done</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ResourcesManagerDialog;
