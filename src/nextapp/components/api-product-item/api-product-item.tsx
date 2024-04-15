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

  const isTieredHidden = data.environments.some((e) =>
    e.services.some((s) =>
      s.plugins.some((p) => p.tags.includes('aps.two-tiered-hidden'))
    )
  );

  return (
    <>
      <Flex px={9} py={7} bg={'white'} mb={'0.5'}>
        <Grid gap={4} flex={1} templateRows="auto" mr={12}>
          <GridItem>
            <Flex align="center" mb={2}>
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
        {(!isTiered && isGatewayProtected) || isTieredHidden ? (
          <AccessRequestForm
            disabled={false}
            id={id}
            name={data.name}
            preview={preview}
            isTieredHidden={isTieredHidden}
          />
        ) : null}
      </Flex>
      {isTiered && !isTieredHidden && (
        <Flex px={9} py={7} bg={'white'} my={-1} mb={'0.5'}>
          <Grid gap={4} flex={1} templateRows="auto" mr={12}>
            <GridItem>
              <Flex align="center" mb={2}>
                <Flex align="center" width={8}>
                  <Icon
                    as={HiChartBar}
                    color="bc-blue"
                    boxSize="5"
                    data-testid={`two-tiered-icon-${kebabCase(data.name)}`}
                  />
                </Flex>
                <Heading size="xs">Limits</Heading>
              </Flex>
              <Text ml={8} fontSize="sm">
                Public access has a rate limit enforced.
              </Text>
              <Text ml={8} fontSize="sm">
                For elevated access, please request access.
              </Text>
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
