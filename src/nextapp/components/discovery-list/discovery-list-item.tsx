import * as React from 'react';
import {
  Badge,
  Box,
  Button,
  Divider,
  Heading,
  Icon,
  Link,
  Text,
  Wrap,
  WrapItem,
} from '@chakra-ui/react';
import NextLink from 'next/link';
import { Product } from '@/shared/types/query.types';
import { FaBook } from 'react-icons/fa';

interface DiscoveryListItemProps {
  data: Product;
}

const DiscoveryListItem: React.FC<DiscoveryListItemProps> = ({ data }) => {
  return (
    <Box
      bg="white"
      borderRadius={4}
      border="2px solid"
      borderColor="gray.400"
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
        <Box
          as="hgroup"
          display="flex"
          alignItems="center"
          justifyContent="center"
          overflow="hidden"
          mr={2}
          maxW="75%"
        >
          <Heading isTruncated size="md" lineHeight="1.5">
            <Icon as={FaBook} mr={2} color="bc-blue-alt" />
            {data.name}
          </Heading>
        </Box>
        <NextLink href={`/devportal/requests/new/${data.id}`}>
          <Button size="sm" variant="primary">
            Request Access
          </Button>
        </NextLink>
      </Box>
      <Divider />
      <Box p={4}>
        <Box
          as="dl"
          sx={{
            '& dd': {
              mb: 2,
            },
          }}
        >
          <Heading as="dt" size="sm">
            Organization
          </Heading>
          <Text as="dd">{data.organization.title}</Text>
          <Heading as="dt" size="sm">
            Description
          </Heading>
          <Text as="dd">
            {data.description ?? <Text as="em">No description added</Text>}
          </Text>
        </Box>
      </Box>
      <Divider />
      <Wrap p={4} spacing={2}>
        <WrapItem>
          <Text fontWeight="bold" textTransform="uppercase" color="gray.600">
            Environments
          </Text>
        </WrapItem>
        {data.environments.map((e) => (
          <WrapItem key={e.id}>
            <Badge colorScheme="green" fontSize="md">
              {e.name}
            </Badge>
          </WrapItem>
        ))}
      </Wrap>
    </Box>
  );
};

export default DiscoveryListItem;
