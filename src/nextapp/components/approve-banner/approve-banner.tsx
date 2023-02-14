import * as React from 'react';
import { Box, Container, Flex, Text, Icon, Button } from '@chakra-ui/react';
import { FaExclamationCircle } from 'react-icons/fa';
import Link from 'next/link';
import { useAuth } from '@/shared/services/auth';
import useCurrentNamespace from '@/shared/hooks/use-current-namespace';

const ApproveBanner: React.FC = () => {
  const { user } = useAuth();
  const { data, isSuccess, isLoading, isFetching } = useCurrentNamespace({
    enabled: true,
  });

  if (
    !user ||
    !isSuccess ||
    isLoading ||
    isFetching ||
    data.currentNamespace === null ||
    data.currentNamespace?.org === null ||
    data.currentNamespace?.orgEnabled ||
    !data.currentNamespace?.orgAdmins.includes(user.email)
  ) {
    return null;
  }

  return (
    <Box width="100%" bgColor="bc-yellow-light" color="#6C4A00" boxShadow="md">
      <Container maxW="6xl" py={6}>
        <Flex align="center" justify="space-between" gridGap={8}>
          <Flex align="center" gridGap={4}>
            <Icon as={FaExclamationCircle} color="bc-yellow" />
            <Text fontSize="sm" fontWeight="bold">
              Enable your team to publish APIs to the Directory so consumers can
              find and request access.
            </Text>
          </Flex>
          <Link passHref href="/manager/products">
            <Button as="a" ml={2}>
              Enable Publishing
            </Button>
          </Link>
        </Flex>
      </Container>
    </Box>
  );
};

export default ApproveBanner;
