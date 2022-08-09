import * as React from 'react';
import { Box, Button, Flex, Icon, Text, useDisclosure } from '@chakra-ui/react';
import { FaExclamationCircle } from 'react-icons/fa';
import formatDistanceToNow from 'date-fns/formatDistanceToNow';
import { AccessRequest as AccessRequestData } from '@/shared/types/query.types';
import type { QueryKey } from 'react-query';

import AccessRequestDialog from './access-request-dialog';

interface AccessRequestProps {
  accessRequestsQueryKey: QueryKey;
  allConsumersQueryKey: QueryKey;
  data: AccessRequestData;
  labels: string[];
}

const AccessRequest: React.FC<AccessRequestProps> = ({
  accessRequestsQueryKey,
  allConsumersQueryKey,
  data,
  labels,
}) => {
  const { isOpen, onClose, onOpen } = useDisclosure();
  const title = data.productEnvironment?.product?.name ?? 'Access Request';
  return (
    <>
      <AccessRequestDialog
        data={data}
        isOpen={isOpen}
        onClose={onClose}
        accessRequestsQueryKey={accessRequestsQueryKey}
        allConsumersQueryKey={allConsumersQueryKey}
        labels={labels}
        title={title}
      />
      <Flex
        align="center"
        bgColor="#fff9ef"
        border="1px solid"
        borderColor="bc-yellow"
        borderRadius={4}
        mb={9}
        px={9}
        py={4}
        boxShadow="md"
        role="alert"
        data-testid={`access-request-banner-${data.id}`}
      >
        <Icon as={FaExclamationCircle} boxSize="8" color="bc-yellow" />
        <Box flex={1} mx={4} data-testid="ar-request-description">
          <Text>
            <Text as="strong">{data.requestor?.name}</Text> has requested access
            to <Text as="strong">{title}</Text>
          </Text>
          <Text as="small" color="bc-component">
            {formatDistanceToNow(new Date(data.createdAt))} ago
          </Text>
        </Box>
        <Button
          leftIcon={<Icon as={FaExclamationCircle} />}
          variant="secondary"
          onClick={onOpen}
          data-testid="ar-review-btn"
        >
          Review
        </Button>
      </Flex>
    </>
  );
};

export default AccessRequest;
