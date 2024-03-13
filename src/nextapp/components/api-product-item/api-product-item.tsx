import * as React from 'react';
import AccessRequestForm from '@/components/access-request-form';
import { BiLinkExternal } from 'react-icons/bi';
import {
  Button,
  Flex,
  Grid,
  GridItem,
  Heading,
  Icon,
  Text,
} from '@chakra-ui/react';
import kebabCase from 'lodash/kebabCase';
import { FaLock } from 'react-icons/fa';
import { HiChartBar } from 'react-icons/hi';
import { RiEarthFill } from 'react-icons/ri';
import { Dataset, Environment, Product } from '@/shared/types/query.types';

export interface ApiEnvironment extends Environment {
  anonymous: boolean;
}

export interface ApiProduct extends Product {
  environments: ApiEnvironment[];
}

export interface ApiDataset extends Dataset {
  products: ApiProduct[];
}

export interface ApiProductItemProps {
  data: ApiProduct;
  id: string;
  preview: boolean;
}

const ApiProductItem: React.FC<ApiProductItemProps> = ({
  data,
  id,
  preview,
}) => {
  const isPublic = data.environments.some((e) => e.flow === 'public');
  const isGatewayProtected = data.environments.some(
    (e) => e.flow !== 'public' && e.flow !== 'protected-externally'
  );
  const isTiered = data.environments.some((e) => e.anonymous);

  return (
    <>
      <Flex px={9} py={7} bg={'white'} mb={'0.5'}>
        <Grid gap={4} flex={1} templateRows="auto" mr={12}>
          <GridItem>
            <Flex align="center" mt={3}>
              <Flex align="center" width={8}>
                <Icon
                  as={isPublic || isTiered ? RiEarthFill : FaLock}
                  color="bc-blue"
                  boxSize="5"
                  data-testid={`product-icon-${kebabCase(data.name)}-${
                    isPublic || isTiered ? 'RiEarthFill' : 'FaLock'
                  }`}
                />
              </Flex>
              <Heading size="xs">{data.name}</Heading>
            </Flex>
            {data.description && (
              <Text ml={8} fontSize="sm">
                {data.description}
              </Text>
            )}
          </GridItem>
        </Grid>
        {!isTiered && isGatewayProtected ? (
          <AccessRequestForm
            disabled={false}
            id={id}
            name={data.name}
            preview={preview}
          />
        ) : (
          <Button
            disabled={true}
            data-testid="no-api-key-button"
            variant={'primary'}
            fontWeight="600"
            color="white"
          >
            No API Key Required
          </Button>
        )}
      </Flex>
      {isTiered && (
        <Flex px={9} py={7} bg={'white'} my={-5} mb={'0.5'}>
          <Grid gap={4} flex={1} templateRows="auto" ml={8} mr={12}>
            <GridItem>
              <Flex align="center" mt={3}>
                <Flex align="center" width={8}>
                  <Icon as={HiChartBar} color="bc-blue" boxSize="5" />
                </Flex>
                <Heading size="xs">Elevated Access</Heading>
              </Flex>
            </GridItem>
          </Grid>
          <AccessRequestForm
            disabled={false}
            id={id}
            name={data.name}
            preview={preview}
          />
        </Flex>
      )}
    </>
  );
};

export default ApiProductItem;
