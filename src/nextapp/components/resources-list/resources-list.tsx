import * as React from 'react';
import {
  Avatar,
  Flex,
  HStack,
  Table,
  Tag,
  TagCloseButton,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
} from '@chakra-ui/react';
import type { UmaPermissionTicket } from '@/types/query.types';

import AccessButton from '../access-button';

interface ResourcesListProps {
  data: UmaPermissionTicket[];
  resourceId: string;
}

const ResourcesList: React.FC<ResourcesListProps> = ({ data, resourceId }) => {
  return (
    <Table variant="simple">
      <Thead>
        <Tr>
          <Th>User</Th>
          <Th>Permission</Th>
          <Th isNumeric>Actions</Th>
        </Tr>
      </Thead>
      <Tbody>
        {data.map((d) => (
          <Tr key={d.id}>
            <Td>
              <Flex align="center">
                <Avatar name="Joshua Jones" size="xs" mr={2} />
                <Text
                  fontSize="sm"
                  whiteSpace="nowrap"
                  textOverflow="ellipsis"
                  overflow="hidden"
                >
                  JOSHJONE
                </Text>
              </Flex>
            </Td>
            <Td width="50%">
              <HStack shouldWrapChildren spacing={2}>
                {['api-owner', 'credential-admin'].map((d) => (
                  <Tag
                    key={d}
                    variant="solid"
                    colorScheme="cyan"
                    whiteSpace="nowrap"
                  >
                    {d}
                    <TagCloseButton />
                  </Tag>
                ))}
              </HStack>
            </Td>
            <Td isNumeric>
              <AccessButton
                id="123"
                requesterId="123"
                resourceId={resourceId}
                scope="granted"
                tickets={['123']}
              />
            </Td>
          </Tr>
        ))}
      </Tbody>
    </Table>
  );
};

export default ResourcesList;
