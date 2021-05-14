import * as React from 'react';
import {
  Badge,
  Box,
  Button,
  Divider,
  Flex,
  Grid,
  GridItem,
  Heading,
  Icon,
  Link,
  SimpleGrid,
  Stack,
  Tag,
  TagLabel,
  Text,
  Wrap,
  WrapItem,
} from '@chakra-ui/react';
import NextLink from 'next/link';
import { Product } from '@/shared/types/query.types';
import { FaBook, FaChevronRight } from 'react-icons/fa';
import kebabCase from 'lodash/kebabCase';
import TagsList from '../tags-list';

interface DiscoveryListItemProps {
  data: Product;
}

const DiscoveryListItem: React.FC<DiscoveryListItemProps> = ({ data }) => {
  return (
    <Flex
      bg="white"
      borderRadius={4}
      border="2px solid"
      borderColor="gray.400"
      flexDirection="column"
      position="relative"
      overflow="hidden"
    >
      <Box
        as="header"
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        mb={2}
        p={4}
        pb={2}
      >
        <Box as="hgroup" display="flex" overflow="hidden" mr={2}>
          <Heading isTruncated size="md" lineHeight="1.5">
            <Icon as={FaBook} mr={2} color="bc-blue-alt" />
            {data.dataset ? (
              <>
                <NextLink passHref href={`/devportal/requests/new/${data.id}`}>
                  <Link>{data.dataset.title}</Link>
                </NextLink>
                <Badge color="bc-blue-alt" ml={2}>
                  {data.dataset.sector}
                </Badge>
              </>
            ) : (
              <span>{data.name}</span>
            )}
          </Heading>
        </Box>
        <Wrap spacing={2}>
          {data.environments.map((e) => (
            <WrapItem key={e.id}>
              <Badge colorScheme="green" fontSize="md">
                {e.name}
              </Badge>
            </WrapItem>
          ))}
        </Wrap>
      </Box>
      <Divider />
      {data.dataset && (
        <Box flex={1} p={4}>
          <Heading size="sm" mb={2}>
            {data.dataset?.organization?.title}
            <Icon as={FaChevronRight} boxSize="2" mx={2} />
            <Text as="span" fontWeight="normal" color="gray.600">
              {data.dataset?.organizationUnit?.title}
            </Text>
          </Heading>
          <Text>
            {data.dataset.notes ?? <Text as="em">No description added</Text>}
          </Text>
        </Box>
      )}
      <Divider />
      <Flex p={4} bgColor="gray.50" justify="space-between">
        {data.dataset && (
          <TagsList colorScheme="blue" data={data.dataset.tags} size="0.9rem" />
        )}
      </Flex>
    </Flex>
  );
};

export default DiscoveryListItem;
