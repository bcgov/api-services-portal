import * as React from 'react';
import {
  Badge,
  Box,
  Button,
  ButtonGroup,
  Divider,
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
import { FaCheckCircle, FaHourglassStart, FaMicroscope } from 'react-icons/fa';
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
      <Modal isOpen={isOpen} onClose={onClose} size="6xl">
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
            <Box as="header">
              <Heading size="md">
                {data?.AccessRequest.isApproved && (
                  <Icon as={FaCheckCircle} color="green.500" />
                )}
                {data?.AccessRequest.isIssued && (
                  <Icon as={FaHourglassStart} color="gray.500" />
                )}
                {data?.AccessRequest.isComplete && (
                  <Icon as={FaCheckCircle} color="cyan.500" />
                )}
                {data?.AccessRequest.requestor.name}
              </Heading>
              <Box display="grid" gridTemplateColumns="1fr 1fr">
                <Box>
                  <Heading size="sm">Communication</Heading>
                  <Text>{data?.AccessRequest.communication}</Text>
                </Box>
                <Box>
                  <Heading size="sm">Application</Heading>
                  {data?.AccessRequest.application.name}
                  <Badge>{data?.AccessRequest.productEnvironment.name}</Badge>
                </Box>
              </Box>
              <Divider my={4} />
              <Box>
                <Heading size="sm">Latest Activity</Heading>
                {data?.AccessRequest.activity.map((a) => (
                  <Box key={a.id}>
                    <Heading size="xs">
                      {a.name} = {a.action}
                    </Heading>
                    <Text>{a.message}</Text>
                  </Box>
                ))}
              </Box>
            </Box>
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
