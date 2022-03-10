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
import RequestAuthorization from './authorization';
import { useApi, useApiMutation } from '@/shared/services/api';
import { useQueryClient } from 'react-query';
import { useAuth } from '@/shared/services/auth';

interface GrantAccessDialogProps {
  consumer: any;
  isOpen: boolean;
  onClose: () => void;
  queryKey: string[];
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
  const [restrictions, setRestrictions] = React.useState([]);
  const [rateLimits, setRateLimits] = React.useState([]);
  const [product, setProduct] = React.useState(null);
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

  const handleUpdateRateLimits = React.useCallback((payload) => {
    setRateLimits((state) => [...state, payload]);
  }, []);
  const handleUpdateRestrictions = React.useCallback((payload) => {
    setRestrictions((state) => [...state, payload]);
  }, []);
  const handleTabChange = React.useCallback((index) => {
    setTabIndex(index);
  }, []);
  const handleProductChange = React.useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>) => {
      setProduct(event.target.value);
    },
    []
  );
  const handleGrant = React.useCallback(async () => {
    try {
      await grantMutate.mutateAsync({
        prodEnvId: '123',
        consumerId: '123123',
        group: '123',
        grant: true,
      });
      onClose();
      toast({
        title: 'Access granted',
        status: 'success',
      });
    } catch (err) {
      toast({
        title: 'Access grant failed',
        status: 'error',
      });
    }
  }, [grantMutate, onClose, toast]);
  const handleClose = React.useCallback(() => {
    setTabIndex(0);
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
                <FormLabel>Environment</FormLabel>
                <Select isDisabled={!product} placeholder="Select Environment">
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
              <Tab px={0} ml={4}>
                Authorization
              </Tab>
            </TabList>
          </Tabs>
        </ModalHeader>
        <ModalCloseButton data-testid="access-request-close-btn" />
        {consumer && (
          <ModalBody>
            <Box
              hidden={tabIndex !== 0}
              display={tabIndex === 0 ? 'block' : 'none'}
            >
              <RequestControls
                onUpdateRateLimits={handleUpdateRateLimits}
                onUpdateRestrictions={handleUpdateRestrictions}
                rateLimits={rateLimits}
                restrictions={restrictions}
              />
            </Box>
            <Box
              hidden={tabIndex !== 1}
              display={tabIndex === 1 ? 'block' : 'none'}
            >
              <RequestAuthorization id={consumer.id} />
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
      product {
        id
        name
        environments {
          id
          name
        }
      }
    }
  }
`;

const mutation = gql`
  mutation ToggleConsumerACLMembership(
    $prodEnvId: ID!
    $consumerId: ID!
    $group: String!
    $grant: Boolean!
  ) {
    updateConsumerGroupMembership(
      prodEnvId: $prodEnvId
      consumerId: $consumerId
      group: $group
      grant: $grant
    )
  }
`;
