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

  if (
    !user ||
    !user.roles.includes('portal-user') ||
    !isSuccess ||
    data.currentNamespace === null
  ) {
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
                your Organization Administrator{' '}
                <Link
                  href={`mailto:${data.currentNamespace?.orgAdmins[0]}`}
                  color="bc-link"
                  textDecor="underline"
                >
                  {data.currentNamespace?.orgAdmins[0]}
                </Link>
                .
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
              Preview mode allows you to test and preview your APIs to the
              Directory prior to publishing. Publishing APIs to the Directory
              makes them available so consumers find and request access. Add
              your Organization to the namespace when you are ready to publish
              your APIs.
            </Text>
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default PreviewBanner;
