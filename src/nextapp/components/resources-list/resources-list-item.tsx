import * as React from 'react';
import {
  Avatar,
  Flex,
  HStack,
  Tag,
  TagCloseButton,
  Td,
  Text,
  Tr,
} from '@chakra-ui/react';

import AccessButton from '../grant-access-button';

interface ResourcesListItemProps {
  resourceId: string;
}

const ResourcesListItem: React.FC<ResourcesListItemProps> = ({
  resourceId,
}) => {
  return (
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
            JOSHJONE
          </Text>
        </Flex>
      </Td>
      <Td width="50%">
        <HStack shouldWrapChildren spacing={2}>
          {['api-owner', 'credential-admin'].map((d) => (
            <Tag key={d} variant="solid" colorScheme="cyan" whiteSpace="nowrap">
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
  );
};

export default ResourcesListItem;
