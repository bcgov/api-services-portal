import * as React from 'react';
import {
  Avatar,
  Badge,
  Box,
  Button,
  ButtonGroup,
  Divider,
  Flex,
  Heading,
  Icon,
  List,
  ListIcon,
  ListItem,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
  useDisclosure,
} from '@chakra-ui/react';
import {
  FaCheckCircle,
  FaHourglassStart,
  FaMicroscope,
  FaPaperPlane,
  FaStamp,
} from 'react-icons/fa';
import { AccessRequest } from '@/shared/types/query.types';
import { gql } from 'graphql-request';
import NextLink from 'next/link';
import { useApi } from '@/shared/services/api';

const query = gql`
  query GetAccessRequest($id: ID!) {
    AccessRequest(where: { id: $id }) {
      id
      name
      communication
      isApproved
      isIssued
      isComplete
      requestor {
        name
        email
      }
      productEnvironment {
        name
      }
      application {
        name
      }
      activity(orderBy: "updatedAt_desc", first: 2) {
        id
        name
        action
        message
        result
        actor {
          name
        }
      }
    }
  }
`;

interface AccessRequestViewerProps {
  index: number;
  request: AccessRequest;
  total: number;
}

const AccessRequestViewer: React.FC<AccessRequestViewerProps> = ({
  index,
  request,
  total,
}) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { data, isLoading, isSuccess } = useApi(
    ['accessRequest', index],
    {
      query,
      variables: { id: index },
    },
    {
      enabled: isOpen,
      suspense: false,
    }
  );

  return (
    <>
      <Button
        leftIcon={<Icon as={FaMicroscope} />}
        size="sm"
        onClick={onOpen}
        variant="secondary"
      >
        Review
      </Button>
      <Modal isOpen={isOpen} onClose={onClose} size="3xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader display="flex" justifyContent="space-between">
            <Box>
              {request.name}{' '}
              <Text as="small" color="gray.500">{`(${
                index + 1
              } of ${total})`}</Text>
            </Box>
            <NextLink href={`/manager/requests/${index + 10000}`}>
              <Button variant="primary">View Full Request</Button>
            </NextLink>
          </ModalHeader>
          <ModalBody>
            <Flex>
              <Box flex={1}>
                <Box>
                  <Heading size="sm">Requestor</Heading>
                  <Text mb={3}>
                    <Avatar
                      name={data?.AccessRequest.requestor.name}
                      size="xs"
                      mr={2}
                    />
                    {data?.AccessRequest.requestor.name}
                  </Text>
                </Box>
                <Box>
                  <Heading size="sm">Product</Heading>
                  <Text mb={3}>
                    {data?.AccessRequest.productEnvironment.name}
                  </Text>
                </Box>
                <Box>
                  <Heading size="sm">Application</Heading>
                  <Text>{data?.AccessRequest.application.name}</Text>
                </Box>
              </Box>
              <Box flex={1}>
                <Heading mb={2} size="sm">
                  Status
                </Heading>
                <List spacing={2} fontSize="sm">
                  <ListItem>
                    <ListIcon
                      as={FaStamp}
                      color={
                        data?.AccessRequest.isApproved
                          ? 'green.500'
                          : 'gray.500'
                      }
                    />
                    Approved
                  </ListItem>
                  <ListItem>
                    <ListIcon
                      as={FaPaperPlane}
                      color={
                        data?.AccessRequest.isIssued ? 'green.500' : 'gray.500'
                      }
                    />
                    Issued
                  </ListItem>
                  <ListItem>
                    <ListIcon
                      as={FaCheckCircle}
                      color={
                        data?.AccessRequest.isComplete
                          ? 'green.500'
                          : 'gray.500'
                      }
                    />
                    Completed
                  </ListItem>
                </List>
              </Box>
            </Flex>
          </ModalBody>
          <ModalFooter justifyContent="space-between">
            <ButtonGroup>
              <Button>Prev</Button>
              <Button>Next</Button>
            </ButtonGroup>
            <Button onClick={onClose} variant="primary">
              Done
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default AccessRequestViewer;
