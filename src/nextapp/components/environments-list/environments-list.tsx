import * as React from 'react';
import {
  Box,
  Button,
  ButtonGroup,
  HStack,
  Switch,
  Tag,
  TagLeftIcon,
  Text,
  useToast,
} from '@chakra-ui/react';
import Link from 'next/link';
import { useQueryClient } from 'react-query';
import type { Environment, Mutation } from '@/types/query.types';
import { UPDATE_ENVIRONMENT_ACTIVE } from '@/shared/queries/products-queries';
import DeleteEnvironment from './delete-environment';
import { getAuthToken } from '@/shared/services/utils';
import { useApiMutation } from '@/shared/services/api';

interface EnvironmentsListProps {
  data: Environment[];
}

const EnvironmentsList: React.FC<EnvironmentsListProps> = ({ data }) => {
  const toast = useToast();
  const client = useQueryClient();
  const mutation = useApiMutation<{ id: string; active: boolean }>(
    UPDATE_ENVIRONMENT_ACTIVE
  );
  const onChange = (id: string) => async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    try {
      const res: Mutation = await mutation.mutateAsync({
        id,
        active: event.target.checked,
      });
      client.invalidateQueries('products');
      toast({
        title: res.updateEnvironment.active
          ? 'Environment Enabled'
          : 'Environment Disabled',
        status: res.updateEnvironment.active ? 'success' : 'warning',
      });
    } catch {
      toast({
        title: 'Action Failed',
        status: 'error',
      });
    }
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
