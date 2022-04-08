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
  Icon,
  useDisclosure,
  GridItem,
  Grid,
} from '@chakra-ui/react';
import {
  AccessRequest,
  Environment,
  GatewayConsumer,
  Product,
  Query,
} from '@/shared/types/query.types';
import format from 'date-fns/format';
import { gql } from 'graphql-request';
import { useApiMutation } from '@/shared/services/api';
import { useQueryClient } from 'react-query';
import { FaPen } from 'react-icons/fa';

import RequestControls from './controls';
import RequestAuthorization from './authorization';

interface ConsumerEditDialogProps {
  consumer: GatewayConsumer;
  data: Environment;
  product: Product;
  queryKey: string;
}

const ConsumerEditDialog: React.FC<ConsumerEditDialogProps> = ({
  consumer,
  data,
  product,
  queryKey,
}) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [tabIndex, setTabIndex] = React.useState(0);
  const [restrictions, setRestrictions] = React.useState(() => {
    const restrictionConfigs = consumer.plugins
      .filter((p) => p.name === 'ip-restriction')
      .filter((p) => {
        const name = p.service?.name ?? p.route?.name;
        return data.services.some((s) => s.name === name);
      });
    return restrictionConfigs;
  });
  const [rateLimits, setRateLimits] = React.useState(() => {
    const restrictionConfigs = consumer.plugins
      .filter((p) => p.name === 'rate-limiting')
      .filter((p) => {
        const name = p.service?.name ?? p.route?.name;
        return data.services.some((s) => s.name === name);
      });
    return restrictionConfigs;
  });

  // Events
  const handleUpdateRateLimits = React.useCallback((payload) => {
    setRateLimits((state) => [...state, payload]);
  }, []);
  const handleUpdateRestrictions = (payload: any, index?: number) => {
    setRestrictions((state) => {
      if (index !== undefined) {
        return state.map((s, i) => {
          if (i === index) {
            return payload;
          }
          return s;
        });
      }
      if (state.includes(payload)) {
        return state.filter((s) => s !== payload);
      } else {
        return [...state, payload];
      }
    });
  };
  const handleTabChange = React.useCallback((index) => {
    setTabIndex(index);
  }, []);
  const handleSave = React.useCallback(() => {
    console.log(restrictions);
  }, [restrictions]);

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
        onClose={onClose}
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
          <ModalCloseButton data-testid="access-request-close-btn" />
          <ModalBody>
            <Box
              hidden={tabIndex !== 0}
              display={tabIndex === 0 ? 'block' : 'none'}
              data-testid="ar-controls-tab"
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
              data-testid="ar-authorization-tab"
            >
              <RequestAuthorization
                credentialIssuer={data.credentialIssuer}
                id={data.id}
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
                onClick={onClose}
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
