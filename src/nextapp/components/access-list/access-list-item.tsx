import * as React from 'react';
import {
  Box,
  Button,
  Divider,
  Flex,
  Grid,
  GridItem,
  Heading,
  HStack,
  Icon,
  Tag,
  Text,
  useToast,
} from '@chakra-ui/react';
import { ServiceAccess } from '@/shared/types/query.types';
import { FaCheck, FaFolder, FaHourglass, FaMinusCircle } from 'react-icons/fa';
import CircleIcon from '../circle-icon';
import { gql } from 'graphql-request';
import NextLink from 'next/link';
import { QueryKey, useMutation, useQueryClient } from 'react-query';
import api from '@/shared/services/api';

interface AccessListItemProps {
  data: ServiceAccess[];
  product: string;
  queryKey: QueryKey;
}

const AccessListItem: React.FC<AccessListItemProps> = ({
  data,
  product,
  queryKey,
}) => {
  const client = useQueryClient();
  const revoke = useMutation((id) => api(mutation, { id }));
  const toast = useToast();
  const handleRevoke = React.useCallback(
    (id) => async () => {
      try {
        await revoke.mutateAsync(id);
        client.invalidateQueries(queryKey);
        toast({
          title: 'Access Revoked',
          status: 'success',
        });
      } catch (err) {
        toast({
          title: 'Revoke failed',
          description: err?.message,
          status: 'error',
        });
      }
    },
    [revoke, toast]
  );

  return (
    <Box bgColor="white" mb={4}>
      <Flex as="header" align="center" justify="space-between" p={4}>
        <Flex as="hgroup" align="center">
          <Icon as={FaFolder} color="bc-blue-alt" mr={2} boxSize="6" />
          <Heading size="md">{product}</Heading>
        </Flex>
      </Flex>
      <Divider />
      {data.map((d, index, arr) => (
        <NextLink key={d.id} href={`/devportal/access/${d.id}`}>
          <Grid
            px={4}
            py={2}
            gap={4}
            templateColumns="30px 1fr 200px"
            borderColor="blue.100"
            borderBottomWidth={index === arr.length - 1 ? 0 : 1}
            bgColor="blue.50"
            cursor="pointer"
            _hover={{
              bgColor: 'blue.100',
            }}
          >
            <GridItem>
              {d.active && (
                <CircleIcon label="Approved" color="green">
                  <Icon as={FaCheck} />
                </CircleIcon>
              )}
              {!d.active && (
                <CircleIcon label="Pending" color="orange">
                  <Icon as={FaHourglass} />
                </CircleIcon>
              )}
            </GridItem>
            <GridItem display="flex" alignItems="center">
              <Text
                display="inline-block"
                fontSize="sm"
                bgColor="blue.300"
                color="white"
                textTransform="uppercase"
                px={2}
                borderRadius={2}
              >
                {d.productEnvironment.name}
              </Text>
              <HStack ml={3}>
                {d.productEnvironment.services?.map((s) => (
                  <Tag
                    key={s.id}
                    borderRadius="full"
                    variant="subtle"
                    colorScheme="cyan"
                  >
                    {s.name}
                  </Tag>
                ))}
              </HStack>
            </GridItem>
            <GridItem
              display="flex"
              alignItems="center"
              justifyContent="flex-end"
            >
              <Button
                variant="secondary"
                size="sm"
                leftIcon={<Icon as={FaMinusCircle} />}
                onClick={handleRevoke(d.id)}
              >
                {d.active ? 'Revoke Access' : 'Cancel Request'}
              </Button>
            </GridItem>
          </Grid>
        </NextLink>
      ))}
    </Box>
  );
};

export default AccessListItem;

const mutation = gql`
  mutation CancelAccess($id: ID!) {
    deleteServiceAccess(id: $id) {
      id
    }
  }
`;
