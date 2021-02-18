import * as React from 'react';
import api from '@/shared/services/api';
import {
  Box,
  Button,
  ButtonGroup,
  Center,
  Heading,
  Icon,
} from '@chakra-ui/react';
import EmptyPane from '@/components/empty-pane';
import EnvironmentsList from '@/components/environments-list';
import NewPackage from '@/components/new-package';
import { useQuery } from 'react-query';
import type { Query } from '@/types/query.types';
import {
  FaLayerGroup,
  FaPenSquare,
  FaPlusCircle,
  FaTrash,
} from 'react-icons/fa';

import AddEnvironment from './add-environment';
import { GET_LIST } from './queries';
import EditPackage from './edit-package';

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
                  opacity={data.allPackages.length > 1 ? 0 : 1}
                  transition="opacity ease-in 0.2s"
                  sx={{
                    '.package-item:hover &': {
                      opacity: 1,
                    },
                  }}
                >
                  {d.environments.length < 6 && (
                    <AddEnvironment
                      packageId={d.id}
                      environments={d.environments.map((d) => d.name)}
                    >
                      <Button
                        variant="tertiary"
                        leftIcon={<Icon as={FaPlusCircle} />}
                      >
                        Add Env
                      </Button>
                    </AddEnvironment>
                  )}
                  <EditPackage data={d} />
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
                    <AddEnvironment
                      packageId={d.id}
                      environments={d.environments.map((d) => d.name)}
                    >
                      <Button variant="primary">Add Environment</Button>
                    </AddEnvironment>
                  </Center>
                </Box>
              )}
              {d.environments.length > 0 && (
                <Box bgColor="blue.50">
                  <EnvironmentsList data={d.environments} />
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
