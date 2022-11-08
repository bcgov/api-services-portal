import * as React from 'react';
import {
  Box,
  Container,
  Flex,
  Text,
  Icon,
  Link,
  Tooltip,
  useDisclosure,
  Button,
} from '@chakra-ui/react';
import { ImInfo } from 'react-icons/im';
import { useAuth } from '@/shared/services/auth';
import NewOrganizationForm from '../new-organization-form';
import { FaClock } from 'react-icons/fa';
import useCurrentNamespace from '@/shared/hooks/use-current-namespace';

const PreviewBanner: React.FC = () => {
  const { user } = useAuth();
  const { isOpen, onToggle } = useDisclosure();
  const toggleButtonText = isOpen ? 'Done' : 'Learn More';
  const { data, isSuccess } = useCurrentNamespace({ enabled: true });

  if (!user || !isSuccess || data.currentNamespace === null) {
    return null;
  }

  if (data.currentNamespace.org) {
    return (
      <Box
        width="100%"
        bgColor="bc-yellow-light"
        color="#6C4A00"
        boxShadow="md"
      >
        <Container maxW="6xl" py={6}>
          <Flex align="center" justify="space-between" gridGap={8}>
            <Flex align="center" gridGap={4}>
              <Icon as={FaClock} color="bc-yellow" />
              <Text fontSize="sm" fontWeight="bold">
                {`Your Organization Administrator has been notified to enable API
                Publishing to the Directory for the ${user.namespace} namespace.`}
              </Text>
            </Flex>
            <Button
              size="sm"
              onClick={onToggle}
              variant="link"
              ml={2}
              textDecor="underline"
              color="bc-link"
            >
              {toggleButtonText}
            </Button>
          </Flex>
          {isOpen && (
            <Box mt={4}>
              <Text fontSize="sm">
                New namespaces must be reviewed by your Organization
                Administrator before you can publish APIs to the Directory. Your
                APIs are still in preview mode. For status inquiries, contact
                your Organization Administrator.
              </Text>
            </Box>
          )}
        </Container>
      </Box>
    );
  }

  return (
    <Box width="100%" bgColor="bc-divider" boxShadow="md">
      <Container maxW="6xl" py={3}>
        <Flex align="center" justify="space-between">
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
            <Text fontSize="sm" fontWeight="bold">
              Your APIs are in preview mode; add your Organization to publish
              your APIs to the Directory.
            </Text>
          </Flex>
          <Flex gridGap={4}>
            <NewOrganizationForm />
            <Button
              size="sm"
              onClick={onToggle}
              variant="link"
              ml={2}
              textDecor="underline"
              color="bc-link"
            >
              {toggleButtonText}
            </Button>
          </Flex>
        </Flex>
        {isOpen && (
          <Box mt={4}>
            <Text fontSize="sm">
              If this is a new namespace, it must be approved and associated
              with an organization before you can enable your products in the
              API Directory to make them visible to the public. You can still
              configure your products but they will remain in preview mode.
              Please open a ticket with the{' '}
              <Link
                color="bc-blue"
                fontWeight="bold"
                textDecor="underline"
                href="https://dpdd.atlassian.net/servicedesk/customer/portal/1/group/2/create/118"
                target="_blank"
                rel="external noreferrer noopener"
              >
                Data Systems and Services request system
              </Link>{' '}
              for your namespace approval.
            </Text>
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default PreviewBanner;
