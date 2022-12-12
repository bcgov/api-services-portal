import * as React from 'react';
import { useApi, useApiMutation } from '@/shared/services/api';
import {
  Box,
  Button,
  Flex,
  Icon,
  Link,
  Tag,
  Text,
  Wrap,
  WrapItem,
} from '@chakra-ui/react';
import EmptyPane from '@/components/empty-pane';
import { gql } from 'graphql-request';
import NewProduct from '@/components/new-product';
import { FaPlusCircle } from 'react-icons/fa';
import { Tr, Td } from '@chakra-ui/react';
import Table from '@/components/table';
import { getFlowText } from '@/shared/services/utils';

import AddEnvironment from './add-environment';
import EditProduct from './edit-product';
import Card from '../card';
import { Environment } from '@/shared/types/query.types';
import EnvironmentEdit from '../environment-edit';
import { QueryKey } from 'react-query';
import NextLink from 'next/link';
import DeleteEnvironment from './delete-environment';

interface ProductsListProps {
  queryKey: QueryKey;
}

const ProductsList: React.FC<ProductsListProps> = ({ queryKey }) => {
  const { data } = useApi(queryKey, { query });

  if (data.allProductsByNamespace.length === 0) {
    return (
      <EmptyPane
        title="Make your first Product"
        message="You can create additional environments once a product has been made."
        action={<NewProduct queryKey={queryKey} />}
        boxProps={{ mx: 0 }}
      />
    );
  }

  return (
    <>
      {data.allProductsByNamespace.map((d) => (
        <Card
          key={d.id}
          mb={8}
          actions={
            <>
              <AddEnvironment
                productId={d.id}
                environments={d.environments.map((d) => d.name)}
                productName={d.name}
                productQueryKey={queryKey}
              >
                <Button
                  leftIcon={<Icon as={FaPlusCircle} mr={2} />}
                  variant="ghost"
                  sx={{
                    _active: {
                      boxShadow: 'none',
                    },
                    _focus: {
                      boxShadow: 'none',
                    },
                  }}
                >
                  Add Env
                </Button>
              </AddEnvironment>
              <EditProduct data={d} queryKey={queryKey} />
            </>
          }
          heading={
            <>
              {d.name}
              {d.dataset && (
                <NextLink
                  passHref
                  href={`/devportal/api-directory/${d.dataset.id}?preview=true`}
                >
                  <Link fontSize="sm" color="bc-blue" ml={4}>
                    View Dataset
                  </Link>
                </NextLink>
              )}
            </>
          }
        >
          {d.environments.length === 0 && (
            <EmptyPane
              title="No environments"
              message="Click Add Environment to add one"
            />
          )}
          {d.environments.length > 0 && (
            <Table
              sortable
              data={d.environments}
              columns={[
                { name: 'State', key: 'active', sortable: true },
                { name: 'Environment', key: 'name', sortable: true },
                { name: 'Authentication', key: 'flow', sortable: true },
                { name: 'Services', key: 'credentialIssuer.name' },
                { name: '', key: 'id' },
              ]}
            >
              {(item: Environment, index) => (
                <Tr key={index}>
                  <Td>
                    <Flex align="center">
                      {item.active ? (
                        <>
                          <Box
                            bgColor="bc-success"
                            w="12px"
                            h="12px"
                            borderRadius="full"
                            mr={2}
                          />{' '}
                          Active
                        </>
                      ) : (
                        <>
                          <Box bgColor="bc-error" w="12px" h="12px" mr={2} />{' '}
                          Inactive
                        </>
                      )}
                    </Flex>
                  </Td>
                  <Td>
                    <Tag colorScheme={item.name} variant="outline">
                      {item.name}
                    </Tag>
                  </Td>
                  <Td>{getFlowText(item.flow)}</Td>
                  <Td>
                    {!item.services.length && (
                      <Text as="em" color="bc-empty">
                        No services yet
                      </Text>
                    )}
                    {item.services?.length > 0 && (
                      <Wrap>
                        {item.services?.map((s) => (
                          <WrapItem key={s.id}>
                            <Tag variant="outline">{s.name}</Tag>
                          </WrapItem>
                        ))}
                      </Wrap>
                    )}
                  </Td>
                  <Td textAlign="right" w="17%">
                    <EnvironmentEdit
                      data={item}
                      product={d}
                      productQueryKey={queryKey}
                    />
                    <DeleteEnvironment data={item} queryKey={queryKey} />
                  </Td>
                </Tr>
              )}
            </Table>
          )}
        </Card>
      ))}
    </>
  );
};

export default ProductsList;

const query = gql`
  query GetAllProducts {
    allProductsByNamespace {
      id
      name
      description
      organization {
        id
        title
      }
      organizationUnit {
        id
        title
      }
      dataset {
        id
        name
        title
        notes
        sector
        license_title
      }
      environments {
        id
        name
        active
        flow
        services {
          id
          name
          host
        }
        credentialIssuer {
          name
        }
      }
    }
  }
`;
