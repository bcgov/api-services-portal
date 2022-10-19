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
  Icon,
  useDisclosure,
  GridItem,
  Grid,
  useToast,
  Flex,
  Alert,
  AlertDescription,
  AlertIcon,
} from '@chakra-ui/react';
import { ConsumerPlugin } from '@/shared/types/query.types';
import EnvironmentTag from '@/components/environment-tag';
import format from 'date-fns/format';
import { FaPen } from 'react-icons/fa';

import RequestControls from './controls';
import AuthorizationEdit from './authorization-edit';
import { QueryKey, useQueryClient } from 'react-query';
import { useApi, useApiMutation } from '@/shared/services/api';
import { gql } from 'graphql-request';

interface ConsumerEditDialogProps {
  queryKey: QueryKey;
  consumerId: string;
  prodEnvId: string;
}

const ConsumerEditDialog: React.FC<ConsumerEditDialogProps> = ({
  prodEnvId,
  queryKey,
  consumerId,
}) => {
  const client = useQueryClient();
  const ref = React.useRef(null);
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { data, isLoading, isSuccess } = useApi(
    ['consumerEdit', prodEnvId, consumerId],
    { query, variables: { consumerId, prodEnvId } },
    { suspense: false, enabled: isOpen }
  );
  const [tabIndex, setTabIndex] = React.useState(0);
  const [hasUnsavedChanges, setHasUnsavedChanges] = React.useState(false);
  const restrictions = React.useState<ConsumerPlugin[]>(() => {
    return (
      data?.getConsumerProdEnvAccess.plugins
        .filter((p) => p.name === 'ip-restriction')
        .map((p) => ({
          id: p.id,
          name: p.name,
          config: JSON.parse(p.config),
          service: p.service,
          route: p.route,
        })) ?? []
    );
  });
  const rateLimits = React.useState(() => {
    return (
      data?.getConsumerProdEnvAccess.plugins
        .filter((p) => p.name === 'rate-limiting')
        .map((p) => ({
          id: p.id,
          name: p.name,
          config: JSON.parse(p.config),
          service: p.service,
          route: p.route,
        })) ?? []
    );
  });
  const prodEnvAccess = data?.getConsumerProdEnvAccess;
  const authorization = prodEnvAccess?.authorization;
  const mutation = useApiMutation(saveMutation);

  // Events
  const handleTabChange = (index: number) => {
    setTabIndex(index);
  };
  const handleClose = () => {
    const [, setRestrictions] = restrictions;
    const [, setRateLimits] = rateLimits;
    setHasUnsavedChanges(false);
    setRestrictions(
      data?.getConsumerProdEnvAccess.plugins
        .filter((p) => p.name === 'ip-restriction')
        .map((p) => ({
          id: p.id,
          name: p.name,
          config: JSON.parse(p.config),
          service: p.service,
          route: p.route,
        }))
    );
    setRateLimits(
      data?.getConsumerProdEnvAccess.plugins
        .filter((p) => p.name === 'rate-limiting')
        .map((p) => ({
          id: p.id,
          name: p.name,
          config: JSON.parse(p.config),
          service: p.service,
          route: p.route,
        }))
    );
    onClose();
    setTabIndex(0);
  };
  const handleSave = async () => {
    const [restrictsionsData] = restrictions;
    const [rateLimitsData] = rateLimits;
    const data = {
      plugins: [...restrictsionsData, ...rateLimitsData],
    };
    const authorizationForm = ref?.current.querySelector(
      'form[name="authorizationForm"]'
    );
    const ipRestrictionForm = new FormData(
      ref?.current.querySelector('form[name="ipRestrictionsForm"]') || undefined
    );

    if (
      Boolean(ipRestrictionForm.get('allow')) &&
      ipRestrictionForm.get('allow') !== '[]'
    ) {
      setHasUnsavedChanges(true);
      return false;
    }

    if (authorizationForm) {
      const authorizationFormData = new FormData(authorizationForm);
      const defaultClientScopes = authorizationFormData.getAll(
        'defaultClientScopes'
      );
      const roles = authorizationFormData.getAll('roles');

      data['defaultClientScopes'] = defaultClientScopes;
      data['roles'] = roles;
    }

    try {
      await mutation.mutateAsync({
        consumerId: consumerId,
        prodEnvId: prodEnvAccess.environment.id,
        controls: data,
      });
      toast({
        title: 'Request saved',
        status: 'success',
      });
      client.invalidateQueries(queryKey);
      client.invalidateQueries(['consumerEdit', prodEnvId, consumerId]);
      onClose();
      setTabIndex(0);
      setHasUnsavedChanges(false);
    } catch (err) {
      toast({
        title: 'Request save failed',
        description: err,
        status: 'error',
      });
    }
  };
  React.useEffect(() => {
    if (isSuccess) {
      restrictions[1](
        data?.getConsumerProdEnvAccess.plugins
          .filter((p) => p.name === 'ip-restriction')
          .map((p) => ({
            id: p.id,
            name: p.name,
            config: JSON.parse(p.config),
            service: p.service,
            route: p.route,
          }))
      );
      rateLimits[1](
        data?.getConsumerProdEnvAccess.plugins
          .filter((p) => p.name === 'rate-limiting')
          .map((p) => ({
            id: p.id,
            name: p.name,
            config: JSON.parse(p.config),
            service: p.service,
            route: p.route,
          }))
      );
    }
  }, [data, isSuccess]);

  return (
    <>
      <Button
        leftIcon={<Icon as={FaPen} />}
        variant="ghost"
        size="sm"
        onClick={onOpen}
        data-testid={`${consumerId}-edit-btn`}
      >
        Edit
      </Button>
      <Modal
        closeOnEsc={false}
        isOpen={isOpen}
        onClose={handleClose}
        scrollBehavior="inside"
        size="4xl"
      >
        <ModalOverlay />
        <ModalContent data-testid="edit-consumer-dialog">
          <ModalHeader data-testid="edit-consumer-dialog-header">
            <Flex align="center" gridGap={4}>
              {data?.getConsumerProdEnvAccess?.productName}
              <EnvironmentTag
                name={data?.getConsumerProdEnvAccess?.environment.name}
              />
            </Flex>
            <Tabs
              index={tabIndex}
              mt={4}
              pos="relative"
              onChange={handleTabChange}
            >
              <TabList mb={5} data-testid="edit-consumer-dialog-tabs">
                <Tab px={0} isDisabled={isLoading}>
                  Controls
                </Tab>
                <Tab
                  px={0}
                  ml={4}
                  isDisabled={
                    isLoading || !data?.getConsumerProdEnvAccess?.authorization
                  }
                >
                  Authorization
                </Tab>
                <Tab
                  px={0}
                  ml={4}
                  isDisabled={
                    isLoading || !data?.getConsumerProdEnvAccess?.request
                  }
                >
                  Request Details
                </Tab>
              </TabList>
            </Tabs>
          </ModalHeader>
          <ModalCloseButton data-testid="consumer-edit-close-btn" />
          {isSuccess && (
            <ModalBody ref={ref}>
              {hasUnsavedChanges && (
                <Alert status="error" variant="solid" mb={8}>
                  <AlertIcon />
                  <AlertDescription>
                    You have an unapplied IP Restrictions control.
                  </AlertDescription>
                </Alert>
              )}
              <Box
                hidden={tabIndex !== 0}
                display={tabIndex === 0 ? 'block' : 'none'}
                data-testid="edit-consumer-dialog-controls-tab"
              >
                <RequestControls
                  prodEnvId={data?.getConsumerProdEnvAccess?.environment.id}
                  rateLimits={rateLimits}
                  restrictions={restrictions}
                />
              </Box>
              <Box
                hidden={tabIndex !== 1}
                display={tabIndex === 1 ? 'block' : 'none'}
                data-testid="edit-consumer-dialog-authorization-tab"
              >
                {authorization && (
                  <AuthorizationEdit
                    credentialIssuer={authorization.credentialIssuer}
                    defaultClientScopes={authorization.defaultClientScopes}
                    roles={authorization.roles}
                  />
                )}
              </Box>
              <Box
                hidden={tabIndex !== 2}
                display={tabIndex === 2 ? 'block' : 'none'}
                data-testid="edit-consumer-dialog-request-details-tab"
              >
                {data?.getConsumerProdEnvAccess?.request && (
                  <Grid
                    templateColumns="205px 1fr"
                    rowGap={3}
                    columnGap={2}
                    sx={{
                      '& dt:after': {
                        content: '":"',
                      },
                    }}
                    data-testid="edit-consumer-dialog-request-details"
                  >
                    <GridItem as="dt">Request Date</GridItem>
                    <GridItem as="dd">
                      <time>
                        {format(
                          new Date(
                            data?.getConsumerProdEnvAccess.request.createdAt
                          ),
                          'MMM do, yyyy'
                        )}
                      </time>
                    </GridItem>
                    <GridItem as="dt">
                      Instructions from the API Provider
                    </GridItem>
                    <GridItem as="dd">
                      {
                        data?.getConsumerProdEnvAccess.environment
                          .additionalDetailsToRequest
                      }
                    </GridItem>
                    <GridItem as="dt">Requester Comments</GridItem>
                    <GridItem as="dd">
                      {data?.getConsumerProdEnvAccess.request.additionalDetails}
                    </GridItem>
                    <GridItem as="dt">Approver</GridItem>
                    <GridItem as="dd">
                      {data?.getConsumerProdEnvAccess.requestApprover?.name}
                    </GridItem>
                  </Grid>
                )}
              </Box>
            </ModalBody>
          )}
          <ModalFooter>
            <ButtonGroup>
              <Button
                variant="secondary"
                data-testid="edit-consumer-dialog-edit-cancel-btn"
                onClick={handleClose}
              >
                Cancel
              </Button>
              <Button
                data-testid="edit-consumer-dialog-edit-save-btn"
                onClick={handleSave}
              >
                Save
              </Button>
            </ButtonGroup>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default ConsumerEditDialog;

const saveMutation = gql`
  mutation UpdateConsumerAccess(
    $consumerId: ID!
    $prodEnvId: ID!
    $controls: JSON
  ) {
    updateConsumerAccess(
      consumerId: $consumerId
      prodEnvId: $prodEnvId
      controls: $controls
    )
  }
`;

const query = gql`
  query GetConsumerEditDetails($consumerId: ID!, $prodEnvId: ID!) {
    getConsumerProdEnvAccess(consumerId: $consumerId, prodEnvId: $prodEnvId) {
      productName
      environment {
        id
        name
        additionalDetailsToRequest
      }
      plugins {
        id
        name
        config
        service
        route
      }
      revocable
      authorization {
        credentialIssuer {
          name
          availableScopes
          clientRoles
        }
        defaultClientScopes
        roles
      }
      request {
        id
        additionalDetails
        createdAt
      }
      requestApprover {
        name
      }
    }
  }
`;
