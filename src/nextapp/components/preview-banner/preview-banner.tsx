import * as React from 'react';
import {
  Box,
  Container,
  Flex,
  Text,
  Icon,
  IconButton,
  Link,
  Tooltip,
  useDisclosure,
} from '@chakra-ui/react';
import { gql } from 'graphql-request';
import { BsChevronDown, BsChevronUp } from 'react-icons/bs';
import { ImInfo } from 'react-icons/im';
import { useAuth } from '@/shared/services/auth';
import { useApi } from '@/shared/services/api';

const PreviewBanner: React.FC = () => {
  const { user } = useAuth();
  const { isOpen, onToggle } = useDisclosure();

  const { data, isSuccess } = useApi(
    'currentNamespace',
    { query },
    { enabled: true }
  );

  if (!user || !isSuccess || data.currentNamespace.org) {
    return null;
  }

  return (
    <Box width="100%" bgColor="#FCBA191A">
      <Container maxW="6xl" py={3}>
        <Flex align="center">
          <Tooltip
            hasArrow
            bg="black"
            color="white"
            label="Preview mode allows you to test and review your request access flow and dataset content before making it publicly available"
            aria-label="Preview mode tooltip"
            placement="right"
          >
            <div>
              <Icon as={ImInfo} boxSize="5" mr={2} color="bc-blue" />
            </div>
          </Tooltip>
          <Text fontSize="sm">
            Your products will remain in preview mode until you publish them in
            the API Directory
          </Text>
          <IconButton
            size="sm"
            icon={<Icon as={isOpen ? BsChevronUp : BsChevronDown} />}
            onClick={onToggle}
            variant="ghost"
            ml={2}
            aria-label="toggle details button"
          />
        </Flex>
        {isOpen && (
          <Box>
            <Text fontSize="sm">
              If this is a new namespace, it must be approved and associated
              with an organization before you can enable your products in the
              API Directory to make them visible to the public. You can still
              configure your products but they will remain in preview mode.{' '}
              <Link
                color="bc-blue"
                fontWeight="bold"
                textDecor="underline"
                href="#"
              >
                Find and contact your Organization Administrator for approval
              </Link>
            </Text>
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default PreviewBanner;

const query = gql`
  query GET {
    currentNamespace {
      org
      orgUnit
    }
  }
`;
