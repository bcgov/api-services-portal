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
} from '@chakra-ui/react';
import {
  CredentialIssuer,
  Environment,
  GatewayConsumer,
  GatewayPlugin,
  GatewayPluginCreateInput,
  Product,
} from '@/shared/types/query.types';
import { FaPen } from 'react-icons/fa';

import RequestControls from './controls';
import RequestAuthorization from './authorization';

interface ConsumerEditDialogProps {
  consumer: GatewayConsumer;
  data: GatewayPlugin[];
  environment: Environment;
  product: Product;
  queryKey: string;
}

const ConsumerEditDialog: React.FC<ConsumerEditDialogProps> = ({
  consumer,
  environment,
  data,
  product,
  queryKey,
}) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [tabIndex, setTabIndex] = React.useState(0);
  const restrictions = React.useState<
    (GatewayPlugin | GatewayPluginCreateInput)[]
  >(() => {
    return data.filter((p) => p.name === 'ip-restriction');
  });
  const rateLimits = React.useState(() => {
    return data.filter((p) => p.name === 'rate-limiting');
  });
  // Events
  const handleTabChange = React.useCallback((index) => {
    setTabIndex(index);
  }, []);
  const handleSave = React.useCallback(() => {
    const [restrictsionsData] = restrictions;
    const [rateLimitsData] = rateLimits;
    console.log('ip-restriction', restrictsionsData, rateLimitsData);
  }, [restrictions, rateLimits]);
  const handleClose = () => {
    const [, setRestrictions] = restrictions;
    const [, setRateLimits] = rateLimits;
    setRestrictions(data.filter((p) => p.name === 'ip-restriction'));
    setRateLimits(data.filter((p) => p.name === 'rate-limiting'));
    onClose();
  };

  return (
    <>
      <Button
        leftIcon={<Icon as={FaPen} />}
        variant="ghost"
        size="sm"
        onClick={onOpen}
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
        <ModalContent>
          <ModalHeader data-testid="ar-modal-header">
            {product.name}
            <Tabs
              index={tabIndex}
              mt={4}
              pos="relative"
              onChange={handleTabChange}
            >
              <TabList mb={5} data-testid="ar-tabs">
                <Tab px={0}>Controls</Tab>
                <Tab px={0} ml={4}>
                  Authorization
                </Tab>
                <Tab px={0} ml={4}>
                  Request Details
                </Tab>
              </TabList>
            </Tabs>
          </ModalHeader>
          <ModalCloseButton data-testid="consumer-edit-close-btn" />
          <ModalBody>
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
              <RequestAuthorization
                credentialIssuer={environment.credentialIssuer}
                id={environment.id}
              />
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
                <GridItem as="dd">-</GridItem>
                <GridItem as="dt">Instructions from the API Provider</GridItem>
                <GridItem as="dd">-</GridItem>
                <GridItem as="dt">Requester Comments</GridItem>
                <GridItem as="dd">-</GridItem>
                <GridItem as="dt">Approver</GridItem>
                <GridItem as="dd">-</GridItem>
              </Grid>
            </Box>
          </ModalBody>
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
