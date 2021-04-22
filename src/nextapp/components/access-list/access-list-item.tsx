import * as React from 'react';
import {
  Box,
  Button,
  ButtonGroup,
  Divider,
  Flex,
  Grid,
  GridItem,
  Heading,
  HStack,
  Icon,
  Link,
  Tag,
  Text,
  useToast,
} from '@chakra-ui/react';
import { ServiceAccess } from '@/shared/types/query.types';
import {
  FaCheck,
  FaChevronRight,
  FaFolder,
  FaHourglass,
  FaMinusCircle,
} from 'react-icons/fa';
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
    (id) => async (event: React.MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
      event.stopPropagation();

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
    [client, queryKey, revoke, toast]
  );

  console.log(data);
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
        <Flex
          key={d.id}
          px={4}
          py={2}
          borderColor="blue.100"
          borderBottomWidth={index === arr.length - 1 ? 0 : 1}
          bgColor="blue.50"
        >
          <NextLink
            href={`/devportal/access/${d.productEnvironment.id}?issuer=${d.productEnvironment.credentialIssuer?.id}`}
          >
            <Link flex={1} display="flex" _hover={{ textDecoration: 'none' }}>
              <Box mr={2}>
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
              </Box>
              <Box display="flex" alignItems="center">
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
                  {!d.productEnvironment.services?.length && (
                    <Tag
                      borderRadius="full"
                      variant="subtle"
                      colorScheme="orange"
                    >
                      No services
                    </Tag>
                  )}
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
              </Box>
            </Link>
          </NextLink>
          <Box display="flex" alignItems="center" justifyContent="flex-end">
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<Icon as={FaMinusCircle} />}
              onClick={handleRevoke(d.id)}
            >
              {d.active ? 'Revoke Access' : 'Cancel Request'}
            </Button>
          </Box>
        </Flex>
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
