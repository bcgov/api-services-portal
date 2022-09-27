import * as React from 'react';
import {
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
import { useApi } from '@/shared/services/api';
import { FaCode, FaLock } from 'react-icons/fa';
import AuthorizationFlow from './authorization-flow';
import ConfigureEnvironment from './configure-environment';

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
  const [tab, setTab] = React.useState(1);
  const { data, isLoading, isError, isSuccess } = useApi(
    ['environment', environment.id],
    { query, variables: { id: environment.id } },
    {
      enabled: open,
      suspense: false,
    }
  );

  const handleSetNextTab = () => setTab(1);
  const handleSave = () => console.log('submit!');

  return (
    <Modal isOpen={open} onClose={onClose} scrollBehavior="inside" size="xl">
      <ModalOverlay />
      <ModalContent minW="75%">
        <ModalHeader>
          <Flex align="center" gridGap={4}>
            {product.name}
            <Tag colorScheme={environment.name} variant="outline">
              {environment.name}
            </Tag>
          </Flex>
          <Tabs defaultIndex={tab} index={tab}>
            <TabList mt={4}>
              <Tab px={0} onClick={() => setTab(0)}>
                Configure Environment
              </Tab>
              <Tab px={0} ml={4} onClick={() => setTab(1)}>
                Configure Environment Services
              </Tab>
            </TabList>
          </Tabs>
        </ModalHeader>
        <ModalBody>
          {isLoading && 'Loading...'}
          {isSuccess && (
            <>
              {tab === 0 && (
                <ExpandableCards>
                  <ExpandableCard
                    heading="Authorization Flow"
                    icon={FaLock}
                    data-testid="auth-flow-card"
                  >
                    <AuthorizationFlow environment={data.OwnedEnvironment} />
                  </ExpandableCard>
                  <ExpandableCard
                    heading="Plugin Template"
                    icon={FaCode}
                    data-testid="plugin-template-card"
                  >
                    <EnvironmentPlugins environment={data?.OwnedEnvironment} />
                  </ExpandableCard>
                </ExpandableCards>
              )}
              {tab === 1 && (
                <ConfigureEnvironment environment={data?.OwnedEnvironment} />
              )}
            </>
          )}
        </ModalBody>
        <ModalFooter>
          <ButtonGroup>
            <Button
              variant="secondary"
              onClick={onClose}
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
              <Button data-testid="edit-env-submit-button" onClick={handleSave}>
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
      }
    }
  }
`;
