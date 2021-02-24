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
import NewProduct from '@/components/new-product';
import { useQuery } from 'react-query';
import type { Query } from '@/types/query.types';
import {
  FaLayerGroup,
  FaPenSquare,
  FaPlusCircle,
  FaTrash,
  FaCube,
  FaFolder,
  FaFolderOpen,
} from 'react-icons/fa';

import AddEnvironment from './add-environment';
import { GET_LIST } from './queries';
import EditProduct from './edit-product';

const ProductsList: React.FC = () => {
  const { data } = useQuery<Query>(
    'products',
    async () => await api(GET_LIST),
    {
      suspense: true,
    }
  );

  if (data.allProducts.length === 0) {
    return (
      <EmptyPane
        title="Make your first Product"
        message="You can create additional environments once a product has been made."
        action={<NewProduct />}
      />
    );
  }

  return (
    <Box width="100%">
      {data.allProducts.map((d) => (
        <Box key={d.id} mb={8} className="product-item">
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
                  as={d.environments.length > 0 ? FaFolder : FaFolderOpen}
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
                  opacity={data.allProducts.length > 1 ? 0 : 1}
                  transition="opacity ease-in 0.2s"
                  position="relative"
                  sx={{
                    '.product-item:hover &': {
                      opacity: 1,
                    },
                  }}
                >
                  {d.environments.length < 6 && (
                    <AddEnvironment
                      productId={d.id}
                      environments={d.environments.map((d) => d.name)}
                    >
                      <Box
                        as="span"
                        display="flex"
                        alignItems="center"
                        bgColor="bc-link"
                        py={1}
                        px={2}
                        height="100%"
                        color="white"
                        borderRadius={4}
                      >
                        <Icon as={FaPlusCircle} mr={2} />
                        Add Env
                      </Box>
                    </AddEnvironment>
                  )}
                  <EditProduct data={d} />
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
                      productId={d.id}
                      environments={d.environments.map((d) => d.name)}
                    >
                      Add Environment
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

export default ProductsList;
