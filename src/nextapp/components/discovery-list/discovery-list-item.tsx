import * as React from 'react';
import {
  Badge,
  Box,
  Divider,
  Flex,
  Heading,
  Icon,
  Link,
  Text,
  Wrap,
  WrapItem,
} from '@chakra-ui/react';
import NextLink from 'next/link';
import { Dataset, Product } from '@/shared/types/query.types';
import { FaBook } from 'react-icons/fa';

interface DiscoveryListItemProps {
  data: Dataset;
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
            {data ? (
              <>
                <NextLink passHref href={`/devportal/api-directory/${data.id}`}>
                  <Link>{data.title}</Link>
                </NextLink>
              </>
            ) : (
              <NextLink passHref href={`/devportal/api-directory/${data.id}`}>
                <Link>{data.name}</Link>
              </NextLink>
            )}
          </Heading>
        </Box>
      </Box>
      <Divider />
      <Box flex={1} p={4}>
        <Heading size="xs" mb={2}>
          {data.organization && (
            <>
              {data.organization.title}
              {data.organizationUnit && (
                <>
                  <Text
                    as="span"
                    d="block"
                    fontWeight="normal"
                    color="gray.400"
                    mt={1}
                    fontSize="xs"
                  >
                    {data.organizationUnit.title}
                  </Text>
                </>
              )}
            </>
          )}
          {!data.organization && 'Open Dataset'}
        </Heading>
        {data && (
          <Text fontSize="sm" noOfLines={2}>
            {data.notes}
          </Text>
        )}
        {!data && (
          <Text as="em" fontSize="sm" color="gray.400">
            No description added
          </Text>
        )}
      </Box>
      <Divider />
      <Flex p={4} bgColor="gray.50" justify="space-between">
        <Box>{data && <Badge color="bc-blue-alt">{data.sector}</Badge>}</Box>
        <Wrap spacing={2}>
          {(data as any).products.map((prod: Product) =>
            prod.environments.map((e) => (
              <WrapItem key={e.id}>
                <Badge colorScheme="green">{e.name}</Badge>
              </WrapItem>
            ))
          )}
        </Wrap>
      </Flex>
    </Flex>
  );
};

export default DiscoveryListItem;
