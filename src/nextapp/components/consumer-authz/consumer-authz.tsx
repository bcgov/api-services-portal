import * as React from 'react';
import { Product, Environment } from '@/shared/types/query.types';
import {
  Box,
  Divider,
  Icon,
  Heading,
  Text,
  Switch,
  useToast,
} from '@chakra-ui/react';
import { gql } from 'graphql-request';
import { QueryKey, useQueryClient } from 'react-query';
import { useApiMutation } from '@/shared/services/api';
import { FaPlusCircle, FaFolder, FaFolderOpen } from 'react-icons/fa';

import ACLComponent from './types/acl';
import RolesComponent from './types/roles';
import ScopesComponent from './types/scopes';

interface ConsumerACLProps {
  queryKey?: any[];
  consumerId: string;
  consumerUsername: string;
  consumerAclGroups: string[];
  aclGroups?: string[];
  products: Product[];
}

const ConsumerAuthz: React.FC<ConsumerACLProps> = ({
  queryKey,
  products,
  consumerId,
  consumerUsername,
  consumerAclGroups,
}) => {
  return (
    <>
      <Box as="header" bgColor="white" p={4}>
        <Heading size="md">Authorization</Heading>
        <Divider />

        <Box width="100%" p={5}>
          {products
            .filter((p) => p.environments.length > 0)
            .filter(
              (p) => p.environments.filter((e) => e.flow != 'public').length > 0
            )
            .map((d) => (
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
                        color={
                          d.environments.length > 0 ? 'bc-blue-alt' : 'gray.200'
                        }
                        mr={4}
                        boxSize="1.5rem"
                      />
                      <Heading as="h4" size="md">
                        {d.name}
                      </Heading>
                    </Box>
                  </Box>
                  <Box bgColor="white">
                    <Box>
                      {d.environments
                        .filter((e) => e.flow != 'public')
                        .map((e, index: number, arr: any) => (
                          <Box
                            key={e.id}
                            px={4}
                            py={2}
                            className="environment-item"
                            display="flex"
                            flexDirection={{ base: 'column', sm: 'row' }}
                            alignItems={{ base: 'flex-start', sm: 'center' }}
                            bgColor={'inherit'}
                            borderColor="blue.100"
                            borderBottomWidth={index === arr.length - 1 ? 0 : 1}
                            color={'inherit'}
                          >
                            <Box
                              width="15%"
                              display="flex"
                              alignItems="center"
                              mb={{ base: 4, sm: 0 }}
                            >
                              <Box mr={4}>
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
                            </Box>
                            {(e.flow === 'client-credentials' ||
                              e.flow === 'authorization-code') && (
                              <Box width="20%" mr={10}>
                                <RolesComponent
                                  prodEnvId={e.id}
                                  credentialIssuer={e.credentialIssuer}
                                  consumerId={consumerId}
                                  consumerUsername={consumerUsername}
                                ></RolesComponent>
                              </Box>
                            )}
                            {(e.flow === 'client-credentials' ||
                              e.flow == 'authorization-code') && (
                              <Box width="20%" mr={10}>
                                <ScopesComponent
                                  prodEnvId={e.id}
                                  credentialIssuer={e.credentialIssuer}
                                  consumerId={consumerId}
                                  consumerUsername={consumerUsername}
                                ></ScopesComponent>
                              </Box>
                            )}
                            {(e.flow === 'kong-api-key-acl' ||
                              e.flow == 'kong-acl-only') && (
                              <Box width="20%" mr={10}>
                                <ACLComponent
                                  queryKey={queryKey}
                                  env={e}
                                  consumerId={consumerId}
                                  aclGroups={consumerAclGroups}
                                ></ACLComponent>
                              </Box>
                            )}
                          </Box>
                        ))}
                    </Box>
                  </Box>
                </Box>
              </Box>
            ))}
        </Box>
      </Box>
    </>
  );
};

export default ConsumerAuthz;
