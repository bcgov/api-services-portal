import * as React from 'react';
import {
  Alert,
  AlertDescription,
  AlertIcon,
  Box,
  Button,
  ButtonGroup,
  Flex,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Tab,
  TabList,
  Tabs,
  Tag,
  Tooltip,
  useToast,
} from '@chakra-ui/react';
import { Environment, Product } from '@/shared/types/query.types';
import { ExpandableCards, ExpandableCard } from '@/components/card';
import EnvironmentPlugins from '@/components/environment-plugins';
import { gql } from 'graphql-request';
import { useApi, useApiMutation } from '@/shared/services/api';
import { FaCode, FaLock } from 'react-icons/fa';
import { QueryKey, useQueryClient } from 'react-query';
import { useAuth } from '@/shared/services/auth';

import AuthorizationFlow from './authorization-flow';
import ConfigureEnvironment from './configure-environment';

interface EnvironmentEditDialogProps {
  environment: Environment;
  open: boolean;
  onClose: () => void;
  product: Product;
  productQueryKey: QueryKey;
}
const EnvironmentEditDialog: React.FC<EnvironmentEditDialogProps> = ({
  environment,
  open,
  onClose,
  product,
  productQueryKey,
}) => {
  const [tab, setTab] = React.useState(0);
  const [flow, setFlow] = React.useState(environment.flow ?? 'public');
  const [expandedIndexes, setExpandedIndexes] = React.useState<number[]>([]);
  const auth = useAuth();
  const formRef = React.useRef<HTMLFormElement>(null);
  const client = useQueryClient();
  const toast = useToast();
  const queryKey = ['environment', environment.id];
  const { data, isLoading, isError, isSuccess } = useApi(
    queryKey,
    { query, variables: { id: environment.id } },
    {
      enabled: open,
      suspense: false,
    }
  );
  const servicesRequest = useApi(
    ['allGatewayServices'],
    {
      query: servicesQuery,
      variables: { ns: auth.user.namespace },
    },
    { suspense: false, enabled: Boolean(auth?.user.namespace) }
  );
  const mutate = useApiMutation(mutation);
  const isConfigureServicesTabEnabled = React.useMemo(() => {
    if (isSuccess && data.OwnedEnvironment?.services.length > 0) {
      return true;
    }
    if (servicesRequest.isSuccess) {
      return servicesRequest.data?.allGatewayServices?.length > 0;
    }
    return false;
  }, [data, isSuccess, servicesRequest.data, servicesRequest.isSuccess]);
  // Events
  const handleSetNextTab = () => {
    if (formRef.current?.checkValidity()) {
      setTab(1);
    } else {
      const isSettingsCardClosed = !expandedIndexes.includes(0);
      if (isSettingsCardClosed) {
        setExpandedIndexes([...expandedIndexes, 0]);
        setTimeout(() => {
          formRef.current?.reportValidity();
        }, 100);
      } else {
        formRef.current?.reportValidity();
      }
    }
  };
  const handleClose = () => {
    mutate.reset();
    setTab(0);
    setExpandedIndexes([]);
    onClose();
  };
  const handleExpandCard = (index: number) => () => {
    setExpandedIndexes((state) => {
      if (state.includes(index)) {
        return state.filter((i) => i !== index);
      }
      return [...state, index];
    });
  };
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const formData = new FormData(formRef.current);
      const entries = Object.fromEntries(formData);
      const activeValue = formData.get('active');
      const approvalValue = formData.get('approval');
      const credentialIssuerValue = formData.get('credentialIssuer');
      const credentialIssuer = credentialIssuerValue
        ? {
            connect: {
              id: credentialIssuerValue,
            },
          }
        : undefined;
      const legalValue = formData.get('legal');
      const legal = legalValue
        ? {
            connect: {
              id: legalValue,
            },
          }
        : undefined;
      const servicesValue = formData.get('services');
      const selectedServices = JSON.parse(servicesValue as string) ?? [];
      const services = {
        connect: {
          services: selectedServices,
        },
      };
      const data = {
        ...entries,
        active: Boolean(activeValue),
        approval: Boolean(approvalValue),
        legal,
        services,
        credentialIssuer,
      };
      await mutate.mutateAsync({ id: environment.id, data });
      await client.invalidateQueries(queryKey);
      await client.invalidateQueries(productQueryKey);
      toast({
        title: 'Success',
        description: `Your ${environment.name} environment for ${product.name} has been updated successfully`,
        status: 'success',
        isClosable: true,
      });
      handleClose();
    } catch (err) {
      toast({
        title: 'Services update failed',
        description: err,
        status: 'error',
        isClosable: true,
      });
    }
  };
  const handleSave = () => {
    if (formRef.current?.checkValidity()) {
      formRef.current?.requestSubmit();
    }
  };

  return (
    <Modal
      isOpen={open}
      onClose={handleClose}
      scrollBehavior="inside"
      size="xl"
    >
      <ModalOverlay />
      <ModalContent minW="75%">
        <ModalHeader>
          <Flex align="center" gridGap={4} data-testid="edit-env-modal-title">
            {product.name}
            <Tag colorScheme={environment.name} variant="outline">
              {environment.name}
            </Tag>
          </Flex>
          <Tabs defaultIndex={tab} index={tab}>
            <TabList mt={4}>
              <Tab
                px={0}
                onClick={() => setTab(0)}
                data-testid="edit-env-configure-env-tab"
              >
                Configure Environment
              </Tab>
              <Tab
                px={0}
                ml={4}
                isDisabled={!isConfigureServicesTabEnabled}
                onClick={handleSetNextTab}
                data-testid="edit-env-configure-services-tab"
              >
                <Tooltip
                  isDisabled={isConfigureServicesTabEnabled}
                  label="No available services"
                >
                  Configure Environment Services
                </Tooltip>
              </Tab>
            </TabList>
          </Tabs>
        </ModalHeader>
        <ModalBody>
          {(isError || mutate.isError) && (
            <Alert
              status="error"
              variant="solid"
              data-testid="edit-env-error-alert"
              mb={7}
            >
              <AlertIcon />
              <AlertDescription>
                {isError && 'Unable to load environment details'}
                {mutate.isError && mutate.error}
              </AlertDescription>
            </Alert>
          )}
          {isLoading && 'Loading...'}
          {isSuccess && (
            <form
              onSubmit={handleSubmit}
              name="updateEnvironmentForm"
              ref={formRef}
            >
              <Box hidden={tab !== 0} display={tab === 0 ? 'block' : 'none'}>
                <ExpandableCards index={expandedIndexes}>
                  <ExpandableCard
                    heading="Authorization Flow"
                    icon={FaLock}
                    onButtonClick={handleExpandCard(0)}
                    data-testid="edit-env-auth-card"
                  >
                    <AuthorizationFlow
                      environment={data.OwnedEnvironment}
                      flow={flow}
                      onFlowChange={setFlow}
                    />
                  </ExpandableCard>
                  {flow !== 'public' && (
                    <ExpandableCard
                      heading="Plugin Template"
                      icon={FaCode}
                      onButtonClick={handleExpandCard(1)}
                      data-testid="edit-env-plugin-card"
                    >
                      <EnvironmentPlugins
                        environment={data?.OwnedEnvironment}
                        flow={flow}
                      />
                    </ExpandableCard>
                  )}
                </ExpandableCards>
              </Box>
              <Box hidden={tab !== 1} display={tab === 1 ? 'block' : 'none'}>
                <ConfigureEnvironment
                  data={servicesRequest.data?.allGatewayServices}
                  environment={data?.OwnedEnvironment}
                />
              </Box>
            </form>
          )}
        </ModalBody>
        <ModalFooter>
          <ButtonGroup>
            <Button
              variant="secondary"
              onClick={handleClose}
              data-testid="edit-env-cancel-button"
            >
              Cancel
            </Button>
            {tab === 0 && isConfigureServicesTabEnabled && (
              <Button
                data-testid="edit-env-continue-button"
                isDisabled={!servicesRequest.isSuccess}
                onClick={handleSetNextTab}
              >
                Continue
              </Button>
            )}
            {(tab === 1 || !isConfigureServicesTabEnabled) && (
              <Button
                isLoading={mutate.isLoading}
                data-testid="edit-env-submit-button"
                onClick={handleSave}
              >
                Save
              </Button>
            )}
          </ButtonGroup>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default EnvironmentEditDialog;

const query = gql`
  query GetOwnedEnvironment($id: ID!) {
    OwnedEnvironment(where: { id: $id }) {
      id
      name
      active
      flow
      appId
      legal {
        id
        title
        reference
      }
      credentialIssuer {
        id
      }
      approval
      additionalDetailsToRequest
      product {
        name
        namespace
        organization {
          name
        }
        environments {
          name
          id
        }
      }
      services {
        name
        id
        updatedAt
      }
    }
  }
`;
const servicesQuery = gql`
  query GetAllGatewayServices($ns: String!) {
    allGatewayServices(where: { namespace: $ns }) {
      id
      name
      environment {
        id
      }
    }
  }
`;

const mutation = gql`
  mutation UpdateEnvironment($id: ID!, $data: EnvironmentUpdateInput) {
    updateEnvironment(id: $id, data: $data) {
      name
      id
    }
  }
`;
