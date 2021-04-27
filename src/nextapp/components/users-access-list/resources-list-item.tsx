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
      <Td isNumeric></Td>
    </Tr>
  );
};

export default ResourcesListItem;
