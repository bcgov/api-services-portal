import * as React from 'react';
import { Product, Environment } from '@/shared/types/query.types';
import {
  FormControl,
  FormLabel,
  Box,
  Checkbox,
  CheckboxGroup,
  Divider,
  Grid,
  Switch,
  Text,
  Wrap,
  WrapItem,
  useToast,
} from '@chakra-ui/react';
import { gql } from 'graphql-request';
import { QueryKey, useQueryClient } from 'react-query';
import { useApiMutation } from '@/shared/services/api';
import RolesComponent from './roles';

interface ConsumerACLProps {
  queryKey: any[];
  consumerId: string;
  consumerUsername: string;
  products: Product[];
}

const ConsumerPermissions: React.FC<ConsumerACLProps> = ({
  queryKey,
  consumerId,
  consumerUsername,
  products,
}) => {
  return (
    <Grid bgColor="white" p={4} mb={4} templateColumns="repeat(3, 1fr)" gap={6}>
      <Box fontWeight="bold"></Box>
      <Box fontWeight="bold">Roles</Box>
      <Box fontWeight="bold">Scopes</Box>
      {products.map((product) => {
        return product.environments
          .filter((env) => env.credentialIssuer != null)
          .map((env) => (
            <>
              <Box p={3} bg="white">
                {product.name}{' '}
                <Text
                  display="inline-block"
                  fontSize="sm"
                  bgColor="blue.300"
                  color="white"
                  textTransform="uppercase"
                  px={2}
                  borderRadius={2}
                >
                  {env.name}
                </Text>
              </Box>
              <RolesComponent
                prodEnvId={env.id}
                credentialIssuer={env.credentialIssuer}
                consumerId={consumerId}
                consumerUsername={consumerUsername}
              ></RolesComponent>
              <Box></Box>
            </>
          ));
      })}
    </Grid>
  );
};

export default ConsumerPermissions;
