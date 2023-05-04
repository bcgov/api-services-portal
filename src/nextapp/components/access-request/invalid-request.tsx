import * as React from 'react';
import { Box, Button, Flex, Icon, Text } from '@chakra-ui/react';
import { FaTimesCircle } from 'react-icons/fa';
import { AccessRequest as AccessRequestData } from '@/shared/types/query.types';

interface InvalidRequestProps {
  data: AccessRequestData;
}
const InvalidRequest: React.FC<InvalidRequestProps> = ({ data }) => {
  const title =
    'Joe Lee has requested access to MoH PharmaNet Electronic Prescribing';

  return (
    <Flex
      align="center"
      bgColor="#efdfde"
      border="1px solid"
      borderColor="bc-error"
      borderRadius={4}
      mb={9}
      px={9}
      py={4}
      boxShadow="md"
      role="alert"
      data-testid={`access-request-banner-${data.id}`}
    >
      <Icon as={FaTimesCircle} boxSize="8" color="bc-error" />
      <Box flex={1} mx={4} data-testid="ar-request-description">
        <Text>
          <Text as="strong">{data.requestor?.name}</Text> has requested access
          to <Text as="strong">{title}</Text>
        </Text>
        <Text as="small" color="#943129">
          The associated application has been deleted. No action is required for
          this request.
        </Text>
      </Box>
      <Button
        leftIcon={<Icon as={FaTimesCircle} />}
        variant="secondary"
        data-testid="ar-review-btn"
      >
        Dismiss
      </Button>
    </Flex>
  );
};

export default InvalidRequest;
