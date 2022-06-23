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
} from '@chakra-ui/react';
import {
  CredentialIssuer,
  GatewayPlugin,
  GatewayPluginCreateInput,
} from '@/shared/types/query.types';
import format from 'date-fns/format';
import { FaPen } from 'react-icons/fa';

import RequestControls from './controls';
import RequestAuthorization from './authorization-edit';
import { QueryKey, useMutation, useQueryClient } from 'react-query';
import api, { useApi } from '@/shared/services/api';
import { gql } from 'graphql-request';

interface ConsumerEditDialogProps {
  queryKey: QueryKey;
  serviceAccessId: string;
  consumerId: string;
  prodEnvId: string;
}

const ConsumerEditDialog: React.FC<ConsumerEditDialogProps> = ({
  prodEnvId,
  queryKey,
  consumerId,
  serviceAccessId,
}) => {
  const client = useQueryClient();
  const ref = React.useRef(null);
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { data, isLoading, isSuccess } = useApi(
    ['consumerEdit', prodEnvId, serviceAccessId],
    { query, variables: { serviceAccessId, prodEnvId } },
    { suspense: false, enabled: isOpen }
  );
  const [tabIndex, setTabIndex] = React.useState(0);
  const restrictions = React.useState<
    (GatewayPlugin | GatewayPluginCreateInput)[]
  >(() => {
    return (
      data?.getConsumerProdEnvAccess.plugins.filter(
        (p) => p.name === 'ip-restriction'
      ) ?? []
    );
  });
  const rateLimits = React.useState(() => {
    return (
      data?.getConsumerProdEnvAccess.plugins.filter(
        (p) => p.name === 'rate-limiting'
      ) ?? []
    );
  });
  // const authorization = React.useState(() => {
  //   return data?.getConsumerProdEnvAccess?.authorization;
  // });
  const prodEnvAccess = data?.getConsumerProdEnvAccess;
  const authorization = prodEnvAccess?.authorization;

  const mutation = useMutation(
    async (changes: unknown) => await api(saveMutation, changes, { ssr: false })
  );

  // Events
  const handleTabChange = (index: number) => {
    setTabIndex(index);
  };
  const handleClose = () => {
    const [, setRestrictions] = restrictions;
    const [, setRateLimits] = rateLimits;
    setRestrictions(
      data?.getConsumerProdEnvAccess.plugins.filter(
        (p) => p.name === 'ip-restriction'
      )
    );
    setRateLimits(
      data?.getConsumerProdEnvAccess.plugins.filter(
        (p) => p.name === 'rate-limiting'
      )
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
      client.invalidateQueries(['consumerEdit', prodEnvId, serviceAccessId]);
      onClose();
      setTabIndex(0);
    } catch {
      toast({
        title: 'Request save failed',
        status: 'error',
      });
    }
  };
  React.useEffect(() => {
    if (isSuccess) {
      restrictions[1](
        data?.getConsumerProdEnvAccess.plugins.filter(
          (p) => p.name === 'ip-restriction'
        )
      );
      rateLimits[1](
        data?.getConsumerProdEnvAccess.plugins.filter(
          (p) => p.name === 'rate-limiting'
        )
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
        data-testid={`${serviceAccessId}-edit-btn`}
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
          <ModalHeader data-testid="ar-modal-header">
            {data?.getConsumerProdEnvAccess?.productName}
            <Tabs
              index={tabIndex}
              mt={4}
              pos="relative"
              onChange={handleTabChange}
            >
              <TabList mb={5} data-testid="ar-tabs">
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
              <Box
                hidden={tabIndex !== 0}
                display={tabIndex === 0 ? 'block' : 'none'}
                data-testid="ar-controls-tab"
              >
                <RequestControls
                  rateLimits={rateLimits}
                  restrictions={restrictions}
                />
              </Box>
              <Box
                hidden={tabIndex !== 1}
                display={tabIndex === 1 ? 'block' : 'none'}
                data-testid="ar-authorization-tab"
              >
                {authorization && (
                  <RequestAuthorization
                    credentialIssuer={authorization.credentialIssuer}
                    defaultClientScopes={authorization.defaultClientScopes}
                    roles={authorization.roles}
                  />
                )}
              </Box>
              <Box
                hidden={tabIndex !== 2}
                display={tabIndex === 2 ? 'block' : 'none'}
                data-testid="ar-request-details-tab"
              >
                <Grid
                  templateColumns="205px 1fr"
                  rowGap={3}
                  columnGap={2}
                  sx={{
                    '& dt:after': {
                      content: '":"',
                    },
                  }}
                  data-testid="ar-request-details"
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
              </Box>
            </ModalBody>
          )}
          <ModalFooter>
            <ButtonGroup>
              <Button
                variant="secondary"
                data-testid="ar-edit-cancel-btn"
                onClick={handleClose}
              >
                Cancel
              </Button>
              <Button data-testid="ar-edit-save-btn" onClick={handleSave}>
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
  query GetConsumerEditDetails($serviceAccessId: ID!, $prodEnvId: ID!) {
    getConsumerProdEnvAccess(
      serviceAccessId: $serviceAccessId
      prodEnvId: $prodEnvId
    ) {
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
