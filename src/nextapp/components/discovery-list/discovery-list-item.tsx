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
      height="100%"
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
          <Heading size="sm" lineHeight="1.5">
            <Icon as={FaBook} mr={2} color="bc-blue-alt" />
            {data.dataset ? (
              <>
                <NextLink passHref href={`/devportal/api-discovery/${data.id}`}>
                  <Link>{data.dataset.title}</Link>
                </NextLink>
              </>
            ) : (
              <span>{data.name}</span>
            )}
          </Heading>
        </Box>
      </Box>
      <Divider />
      {data.dataset && (
        <Box flex={1} p={4}>
          <Heading size="xs" mb={2}>
            {data.dataset?.organization?.title}
            <Icon as={FaChevronRight} boxSize="2" mx={2} />
            <Text as="span" fontWeight="normal" color="gray.600">
              {data.dataset?.organizationUnit?.title}
            </Text>
          </Heading>
          <Text fontSize="sm" noOfLines={2}>
            {data.dataset.notes ?? <Text as="em">No description added</Text>}
          </Text>
        </Box>
      )}
      <Divider />
      <Flex p={4} bgColor="gray.50" justify="space-between">
        {data.dataset && (
          <>
            <Badge color="bc-blue-alt">{data.dataset.sector}</Badge>
            <Wrap spacing={2}>
              {data.environments.map((e) => (
                <WrapItem key={e.id}>
                  <Badge colorScheme="green">{e.name}</Badge>
                </WrapItem>
              ))}
            </Wrap>
          </>
        )}
      </Flex>
    </Flex>
  );
};

export default DiscoveryListItem;
