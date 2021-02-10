import * as React from 'react';
import api from '@/shared/services/api';
import {
  Box,
  Button,
  ButtonGroup,
  Center,
  Heading,
  HStack,
  Icon,
  IconButton,
  Switch,
  Tag,
  TagLeftIcon,
  Text,
} from '@chakra-ui/react';
import EmptyPane from '@/components/empty-pane';
import NewPackage from '@/components/new-package';
import { useQuery } from 'react-query';
import type { Query, EnvironmentAuthMethodType } from '@/types/query.types';

import AddEnvironment from './add-environment';
import { GET_LIST } from './queries';
import {
  FaKey,
  FaLayerGroup,
  FaLock,
  FaLockOpen,
  FaPenSquare,
  FaPlusCircle,
  FaTrash,
  FaUserSecret,
} from 'react-icons/fa';

const getAuthToken = (method: EnvironmentAuthMethodType) => {
  switch (method) {
    case 'keys':
      return FaKey;
    case 'JWT':
      return FaLock;
    case 'private':
      return FaUserSecret;
    case 'public':
    default:
      return FaLockOpen;
  }
};

const PackagesList: React.FC = () => {
  const { data } = useQuery<Query>(
    'packages',
    async () => await api(GET_LIST),
    {
      suspense: true,
    }
  );

  if (data.allPackages.length === 0) {
    return (
      <EmptyPane
        title="Make your first Package"
        message="You can create additional environments once a package has been made."
        action={<NewPackage />}
      />
    );
  }

  return (
    <Box width="100%">
      {data.allPackages.map((d) => (
        <Box key={d.id} mb={8} className="package-item">
          <Box
            as="header"
            bgColor="white"
            boxShadow="0 2px 5px rgba(0, 0, 0, 0.1)"
          >
            <Box
              as="hgroup"
              p={4}
              display="flex"
              alignItems="center"
              justifyContent="space-between"
              borderColor="gray.300"
              borderBottomWidth={1}
            >
              <Box display="flex" alignItems="center">
                <Icon
                  as={FaLayerGroup}
                  color={d.environments.length > 0 ? 'bc-blue-alt' : 'gray.200'}
                  mr={4}
                  boxSize="1.5rem"
                />
                <Heading as="h4" size="md">
                  {d.name}
                </Heading>
              </Box>
              <Box>
                <ButtonGroup
                  size="sm"
                  variant="tertiary"
                  opacity={0}
                  transition="opacity ease-in 0.2s"
                  sx={{
                    '.package-item:hover &': {
                      opacity: 1,
                    },
                  }}
                >
                  <Button leftIcon={<Icon as={FaPenSquare} />}>Edit</Button>
                  <AddEnvironment packageName={d.name}>
                    <Button leftIcon={<Icon as={FaPlusCircle} />}>
                      Add Env
                    </Button>
                  </AddEnvironment>
                </ButtonGroup>
              </Box>
            </Box>
            <Box bgColor="white">
              {d.environments.length === 0 && (
                <Box
                  py={4}
                  bgColor="gray.100"
                  boxShadow="inset 0 3px 5px rgba(0, 0, 0, 0.1)"
                >
                  <Center>
                    <AddEnvironment packageName={d.name}>
                      <Button variant="primary">Add Environment</Button>
                    </AddEnvironment>
                  </Center>
                </Box>
              )}
              {d.environments.length > 0 && (
                <Box bgColor="blue.50">
                  {d.environments.map((e, index: number, arr) => (
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
                          <Switch isChecked={e.active} size="sm" />
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
                            <TagLeftIcon as={getAuthToken(e.authMethod)} />
                            {e.authMethod.toUpperCase()}
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
                        <ButtonGroup
                          isAttached
                          sx={{
                            '.environment-item:hover &': {
                              opacity: 1,
                            },
                          }}
                          opacity="0"
                          transition="opacity ease-in 0.2s"
                          color="red"
                        >
                          <IconButton
                            aria-label="Edit Environment"
                            color="bc-blue-alt"
                            size="sm"
                          >
                            <Icon as={FaPenSquare} />
                          </IconButton>
                          <IconButton
                            aria-label="Delete Environment"
                            color="red"
                            size="sm"
                          >
                            <Icon as={FaTrash} color="red" />
                          </IconButton>
                        </ButtonGroup>
                      </Box>
                    </Box>
                  ))}
                </Box>
              )}
            </Box>
          </Box>
        </Box>
      ))}
    </Box>
  );
};

export default PackagesList;
