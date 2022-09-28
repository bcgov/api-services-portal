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
  useToast,
} from '@chakra-ui/react';
import { Environment, Product } from '@/shared/types/query.types';
import { ExpandableCards, ExpandableCard } from '@/components/card';
import EnvironmentPlugins from '@/components/environment-plugins';
import { gql } from 'graphql-request';
import { useApi, useApiMutation } from '@/shared/services/api';
import { FaCode, FaLock } from 'react-icons/fa';
import AuthorizationFlow from './authorization-flow';
import ConfigureEnvironment from './configure-environment';
import { useQueryClient } from 'react-query';

interface EnvironmentEditDialogProps {
  environment: Environment;
  open: boolean;
  onClose: () => void;
  product: Product;
}
const EnvironmentEditDialog: React.FC<EnvironmentEditDialogProps> = ({
  environment,
  open,
  onClose,
  product,
}) => {
  const [tab, setTab] = React.useState(0);
  const [flow, setFlow] = React.useState(environment.flow ?? 'public');
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
  const mutate = useApiMutation(mutation);

  const handleSetNextTab = () => setTab(1);
  const handleClose = () => {
    setTab(0);
    onClose();
  };
  const handleSubmit = (event) => event.preventDefault();
  const handleSave = async () => {
    try {
      const formData = new FormData(formRef.current);
      const data = Object.fromEntries(formData);
      await mutate.mutateAsync({ id: environment.id, data });
      client.invalidateQueries(queryKey);
      toast({
        title: 'Success',
        description: `Your ${environment.name} environment for ${product.name} has been updated successfully`,
        status: 'success',
      });
      handleClose();
    } catch (err) {
      toast({
        title: `${environment.name} update failed`,
        description: err,
        status: 'error',
      });
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
                onClick={() => setTab(1)}
                data-testid="edit-env-configure-services-tab"
              >
                Configure Environment Services
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
            >
              <AlertIcon />
              <AlertDescription>
                {isError && 'Unable to load environment details'}
                {mutate.isError &&
                  'Services update failed. Missing or incomplete acl or key-auth plugin'}
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
                <ExpandableCards>
                  <ExpandableCard
                    heading="Authorization Flow"
                    icon={FaLock}
                    data-testid="edit-env-auth-card"
                  >
                    <AuthorizationFlow
                      environment={data.OwnedEnvironment}
                      flow={flow}
                      onFlowChange={setFlow}
                    />
                  </ExpandableCard>
                  <ExpandableCard
                    heading="Plugin Template"
                    icon={FaCode}
                    data-testid="edit-env-plugin-card"
                  >
                    <EnvironmentPlugins
                      environment={data?.OwnedEnvironment}
                      flow={flow}
                    />
                  </ExpandableCard>
                </ExpandableCards>
              </Box>
              <Box hidden={tab !== 1} display={tab === 1 ? 'block' : 'none'}>
                <ConfigureEnvironment environment={data?.OwnedEnvironment} />
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
            {tab === 0 && (
              <Button
                data-testid="edit-env-continue-button"
                onClick={handleSetNextTab}
              >
                Continue
              </Button>
            )}
            {tab === 1 && (
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

const mutation = gql`
  mutation UpdateEnvironment($id: ID!, $data: EnvironmentUpdateInput) {
    updateEnvironment(id: $id, data: $data) {
      name
      id
    }
  }
`;
