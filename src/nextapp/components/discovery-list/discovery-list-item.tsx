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
    <Box
      bg="white"
      borderRadius={4}
      border="2px solid"
      borderColor="gray.400"
      position="relative"
      overflow="hidden"
      width="100%"
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
            <Link
              href={`https://catalogue.data.gov.bc.ca/dataset/${kebabCase(
                data.dataset.name
              )}`}
              target="_blank"
              rel="noreferrer"
            >
              {data.dataset.name}
            </Link>
            <Badge color="bc-blue-alt" ml={2}>
              BCDC
            </Badge>
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
        <Heading size="sm" mb={2}>
          {data.dataset.organization.title}
          <Icon as={FaChevronRight} boxSize="2" mx={2} />
          <Text as="span" fontWeight="normal" color="gray.600">
            {data.dataset?.organizationUnit?.title}
          </Text>
        </Heading>
        <Text>
          {data.dataset.notes ?? <Text as="em">No description added</Text>}
        </Text>
        <Grid gap={4} templateColumns="repeat(5, 1fr)" my={4} color="gray.500">
          <GridItem>
            <Heading size="xs">Sector</Heading>
            <Text fontSize="sm">{data.dataset.sector}</Text>
          </GridItem>
          <GridItem>
            <Heading size="xs">License</Heading>
            <Text fontSize="sm">{data.dataset.license_title}</Text>
          </GridItem>
          <GridItem>
            <Heading size="xs">Who Can Access?</Heading>
            <Text fontSize="sm">{data.dataset.view_audience}</Text>
          </GridItem>
          <GridItem>
            <Heading size="xs">Security Class</Heading>
            <Text fontSize="sm">{data.dataset.securityClass}</Text>
          </GridItem>
          <GridItem>
            <Heading size="xs">First Published</Heading>
            <Text fontSize="sm">-</Text>
          </GridItem>
        </Grid>
      </Box>
      <Divider />
      <Flex p={4} bgColor="gray.50" justify="space-between">
        <TagsList colorScheme="blue" data={data.dataset.tags} size="0.9rem" />
        <Wrap spacing={2}>
          {data.environments.map((e) => (
            <WrapItem key={e.id}>
              <Badge colorScheme="green" fontSize="md">
                {e.name}
              </Badge>
            </WrapItem>
          ))}
        </Wrap>
      </Flex>
    </Box>
  );
};

export default DiscoveryListItem;
