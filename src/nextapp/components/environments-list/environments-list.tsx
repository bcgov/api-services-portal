import * as React from 'react';
import api from '@/shared/services/api';
import {
  Box,
  Button,
  ButtonGroup,
  HStack,
  Icon,
  IconButton,
  Switch,
  Tag,
  TagLeftIcon,
  Text,
  useToast,
} from '@chakra-ui/react';
import Link from 'next/link';
import { useMutation, useQueryClient } from 'react-query';
import type {
  Mutation,
  Environment,
} from '@/types/query.types';
import {
  FaCube,
  FaKey,
  FaLock,
  FaLockOpen,
  FaPenSquare,
  FaTrash,
  FaUserSecret,
} from 'react-icons/fa';
import { UPDATE_ENVIRONMENT_ACTIVE } from '@/shared/queries/products-queries';
import DeleteEnvironment from './delete-environment';
import EditEnvironment from './edit-environment';

const getAuthToken = (method: string) => {
  switch (method) {
    case 'kong-api-key-acl':
      return FaKey;
    case 'authorization-code':
      return FaLock;
    case 'client-credentials':
      return FaLock;
      // case 'private':
    //   return FaUserSecret;
    case 'public':
    default:
      return FaLockOpen;
  }
};

interface EnvironmentsListProps {
  data: Environment[];
}

const EnvironmentsList: React.FC<EnvironmentsListProps> = ({ data }) => {
  const toast = useToast();
  const client = useQueryClient();
  const mutation = useMutation(
    async (payload: { id: string; active: boolean }) =>
      await api(UPDATE_ENVIRONMENT_ACTIVE, payload),
    {
      onSuccess: (_, vars) => {
        client.invalidateQueries('products');
        toast({
          title: vars.active ? 'Environment Enabled' : 'Environment Disabled',
          status: vars.active ? 'success' : 'warning',
        });
      },
      onError: () => {
        toast({
          title: 'Action Failed',
          status: 'error',
        });
      },
    }
  );
  const onChange = (id: string) => async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    await mutation.mutateAsync({ id, active: event.target.checked });
  };

  return (
    <>
      {data.map((e, index: number, arr) => (
        <Box
          key={e.id}
          px={4}
          py={2}
          className="environment-item"
          display="flex"
          flexDirection={{ base: 'column', sm: 'row' }}
          alignItems={{ base: 'flex-start', sm: 'center' }}
          bgColor={e.active ? 'inherit' : 'gray.50'}
          borderColor="blue.100"
          borderBottomWidth={index === arr.length - 1 ? 0 : 1}
          color={e.active ? 'inherit' : 'grey.500'}
        >
          <Box
            width="15%"
            display="flex"
            alignItems="center"
            mb={{ base: 4, sm: 0 }}
          >
            <Box mr={4}>
              <Switch
                isDisabled={mutation.isLoading}
                isChecked={e.active}
                size="sm"
                onChange={onChange(e.id)}
              />
            </Box>
            <Text
              display="inline-block"
              fontSize="sm"
              bgColor="blue.300"
              color="white"
              textTransform="uppercase"
              px={2}
              borderRadius={2}
            >
              {e.name}
            </Text>
          </Box>
          <Box flex={1}>
            <HStack>
              <Tag
                borderRadius="full"
                variant="subtle"
                colorScheme="green"
                px={3}
              >
                <TagLeftIcon as={getAuthToken(e.flow)} />
                {e.flow.toUpperCase()}
              </Tag>
              {e.services.map((s) => (
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
          <Box>
            <ButtonGroup>
              <Link href={`/manager/products/${e.id}`}>
                <Button size="xs" variant="outline">
                  Edit
                </Button>
              </Link>
              <DeleteEnvironment id={e.id} />
            </ButtonGroup>
          </Box>
        </Box>
      ))}
    </>
  );
};

export default EnvironmentsList;
