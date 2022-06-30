import * as React from 'react';
import {
  Box,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  ButtonGroup,
  Tabs,
  TabList,
  Tab,
  useToast,
  Grid,
  GridItem,
  Select,
  FormControl,
  FormLabel,
} from '@chakra-ui/react';
import { gql } from 'graphql-request';

import RequestControls from './controls';
import RequestAuthorization from './authorization-edit';
import { useApi, useApiMutation } from '@/shared/services/api';
import { QueryKey, useQueryClient } from 'react-query';
import { useAuth } from '@/shared/services/auth';
import { GatewayConsumer } from '@/shared/types/query.types';

interface GrantAccessDialogProps {
  consumer: GatewayConsumer;
  isOpen: boolean;
  onClose: () => void;
  queryKey: QueryKey;
}

const GrantAccessDialog: React.FC<GrantAccessDialogProps> = ({
  consumer,
  isOpen,
  onClose,
  queryKey,
}) => {
  const client = useQueryClient();
  const { user } = useAuth();
  const [tabIndex, setTabIndex] = React.useState(0);
  const restrictions = React.useState([]);
  const rateLimits = React.useState([]);
  const [defaultClientScopes, setDefaultClientScopes] = React.useState([]);
  const [roles, setRoles] = React.useState([]);
  const [product, setProduct] = React.useState(null);
  const [environment, setEnvironment] = React.useState(null);
  const environmentRef = React.useRef<HTMLSelectElement>(null);
  const { data, isLoading, isSuccess } = useApi(
    'GetConsumerProductsAndEnvironments',
    {
      query,
      variables: { namespace: user?.namespace },
    },
    {
      suspense: false,
    }
  );
  const grantMutate = useApiMutation(mutation, {
    onSuccess() {
      client.invalidateQueries(queryKey);
    },
  });
  const toast = useToast();
  const handleTabChange = React.useCallback((index) => {
    setTabIndex(index);
  }, []);
  const handleProductChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setProduct(event.target.value);
  };
  const handleEnvironmentChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const selectedEnv = data?.allProductsByNamespace
      .find((p) => p.id === product)
      ?.environments.find((e) => e.id === event.target.value);
    setEnvironment(
      selectedEnv.flow === 'client-credentials' ? selectedEnv : undefined
    );
  };
  const handleGrant = async () => {
    try {
      const prodEnvId = environmentRef.current?.value;
      if (!prodEnvId || !product) {
        throw 'Missing values product and/or environment';
      }

      const [restrictsionsData] = restrictions;
      const [rateLimitsData] = rateLimits;
      const data = {
        plugins: [...restrictsionsData, ...rateLimitsData],
      };
      data['defaultClientScopes'] = defaultClientScopes;
      data['roles'] = roles;

      await grantMutate.mutateAsync({
        prodEnvId,
        consumerId: consumer.id,
        controls: data,
      });
      onClose();
      setProduct(null);
      toast({
        title: 'Access granted',
        status: 'success',
      });
    } catch (err) {
      toast({
        title: 'Access grant failed',
        description: err,
        status: 'error',
      });
    }
  };
  const handleClose = React.useCallback(() => {
    setTabIndex(0);
    setProduct(null);
    onClose();
  }, [onClose]);

  return (
    <Modal
      closeOnEsc={false}
      isOpen={isOpen}
      onClose={onClose}
      scrollBehavior="inside"
      size="4xl"
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          Grant Access
          <Grid templateColumns="1fr 35%" gap={9} my={9}>
            <GridItem>
              <FormControl>
                <FormLabel>Product</FormLabel>
                <Select
                  isDisabled={isLoading}
                  placeholder="Select Product"
                  onChange={handleProductChange}
                  data-testid="ar-product-select"
                >
                  {isSuccess &&
                    data?.allProductsByNamespace.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                </Select>
              </FormControl>
            </GridItem>
            <GridItem>
              <FormControl>
                <FormLabel>Environment {product}</FormLabel>
                <Select
                  isDisabled={!product}
                  placeholder="Select Environment"
                  onChange={handleEnvironmentChange}
                  ref={environmentRef}
                  data-testid="ar-environment-select"
                >
                  {product &&
                    data?.allProductsByNamespace
                      .find((p) => p.id === product)
                      ?.environments.map((e) => (
                        <option key={e.id} value={e.id}>
                          {e.name}
                        </option>
                      ))}
                </Select>
              </FormControl>
            </GridItem>
          </Grid>
          <Tabs
            index={tabIndex}
            mt={4}
            pos="relative"
            onChange={handleTabChange}
          >
            <TabList mb={5} data-testid="ar-tabs">
              <Tab px={0} ml={4}>
                Controls
              </Tab>
              <Tab px={0} ml={4} isDisabled={!environment}>
                Authorization
              </Tab>
            </TabList>
          </Tabs>
        </ModalHeader>
        <ModalCloseButton data-testid="access-request-close-btn" />
        {consumer && (
          <ModalBody>
            <Box
              data-testid="ar-controls-tab"
              hidden={tabIndex !== 0}
              display={tabIndex === 0 ? 'block' : 'none'}
            >
              <RequestControls
                rateLimits={rateLimits}
                restrictions={restrictions}
              />
            </Box>
            <Box
              data-testid="ar-authorization-tab"
              hidden={tabIndex !== 1}
              display={tabIndex === 1 ? 'block' : 'none'}
            >
              {environment && (
                <RequestAuthorization
                  credentialIssuer={environment.credentialIssuer}
                  defaultClientScopes={defaultClientScopes}
                  roles={roles}
                />
              )}
            </Box>
          </ModalBody>
        )}
        <ModalFooter>
          <ButtonGroup>
            <Button
              variant="secondary"
              data-testid="ar-cancel-btn"
              onClick={handleClose}
            >
              Cancel
            </Button>
            <Button data-testid="ar-grant-btn" onClick={handleGrant}>
              Grant Access
            </Button>
          </ButtonGroup>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default GrantAccessDialog;

const query = gql`
  query GetConsumerProductsAndEnvironments($namespace: String!) {
    allProductsByNamespace(where: { namespace: $namespace }) {
      id
      name
      environments {
        id
        name
        flow
        credentialIssuer {
          name
          availableScopes
          clientRoles
        }
      }
    }
  }
`;

const mutation = gql`
  mutation GrantAccessToConsumer(
    $prodEnvId: ID!
    $consumerId: ID!
    $controls: JSON
  ) {
    grantAccessToConsumer(
      prodEnvId: $prodEnvId
      consumerId: $consumerId
      controls: $controls
    )
  }
`;
