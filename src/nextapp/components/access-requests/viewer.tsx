import * as React from 'react';
import {
  Avatar,
  Box,
  Button,
  ButtonGroup,
  Flex,
  Heading,
  Icon,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
  useDisclosure,
} from '@chakra-ui/react';
import { FaMicroscope } from 'react-icons/fa';
import { AccessRequest } from '@/shared/types/query.types';
import { gql } from 'graphql-request';
import NextLink from 'next/link';
import { useApi } from '@/shared/services/api';
import ControlsList from '../controls-list';

const query = gql`
  query GetAccessRequest($id: ID!) {
    AccessRequest(where: { id: $id }) {
      id
      name
      controls
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

  const plugins = []; // JSON.parse(data?.AccessRequest.controls).plugins     data?.AccessRequest.productEnvironment.

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
              <ControlsList
                consumerId={index.toString()}
                data={plugins ?? []}
                queryKey={['consumer', index.toString()]}
              />
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
