import * as React from 'react';
import { Box, Button, Flex, Icon, Text, useDisclosure } from '@chakra-ui/react';
import { FaExclamationCircle } from 'react-icons/fa';
import { AccessRequest as AccessRequestData } from '@/shared/types/query.types';
import AccessRequestDialog from './access-request-dialog';

interface AccessRequestProps {
  data: AccessRequestData;
}

const AccessRequest: React.FC<AccessRequestProps> = ({ data }) => {
  const { isOpen, onClose, onOpen } = useDisclosure();
  return (
    <>
      <AccessRequestDialog
        data={data}
        isOpen={isOpen}
        onClose={onClose}
        title={data.application?.name}
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
      >
        <Icon as={FaExclamationCircle} boxSize="8" color="bc-yellow" />
        <Box flex={1} mx={4}>
          <Text>
            <Text as="strong">{data.requestor?.name}</Text> has requested access
            to <Text as="strong">{data.application?.name}</Text>
          </Text>
          <Text as="small" color="bc-component">
            2 days ago
          </Text>
        </Box>
        <Button
          leftIcon={<Icon as={FaExclamationCircle} />}
          variant="secondary"
          onClick={onOpen}
        >
          Review
        </Button>
      </Flex>
    </>
  );
};

export default AccessRequest;
