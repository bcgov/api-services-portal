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
  const { data, isLoading, isError, isSuccess } = useApi(
    ['environment', environment.id],
    { query, variables: { id: environment.id } },
    {
      enabled: open,
      suspense: false,
    }
  );

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
              <Tab px={0}>Configure Environment</Tab>
              <Tab px={0} ml={4}>
                Configure Environment Services
              </Tab>
            </TabList>
          </Tabs>
        </ModalHeader>
        <ModalBody>
          {isLoading && 'Loading...'}
          {isSuccess && (
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
        </ModalBody>
        <ModalFooter>
          <ButtonGroup>
            <Button
              variant="secondary"
              onClick={onClose}
              data-testid="access-request-cancel-button"
            >
              Cancel
            </Button>
            <Button data-testid="access-request-submit-button">Continue</Button>
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
