import * as React from 'react';
import {
  Box,
  Container,
  Flex,
  Text,
  Icon,
  Link,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Tooltip,
  useDisclosure,
  Button,
  IconButton,
} from '@chakra-ui/react';
import { ImInfo } from 'react-icons/im';
import { useAuth } from '@/shared/services/auth';
import NewOrganizationForm from '../new-organization-form';
import { FaCheckCircle, FaChevronDown, FaClock, FaTimes } from 'react-icons/fa';
import useCurrentNamespace from '@/shared/hooks/use-current-namespace';

const PreviewBanner: React.FC = () => {
  const { user } = useAuth();
  const { isOpen, onToggle } = useDisclosure();
  const bannerDisclosure = useDisclosure({ defaultIsOpen: true });
  const toggleButtonText = isOpen ? 'Done' : 'Learn More';
  const { data, isSuccess } = useCurrentNamespace({ enabled: true });

  if (
    !user ||
    !user.roles.includes('api-owner') ||
    !isSuccess ||
    data.currentNamespace === null
  ) {
    return null;
  }

  // @ts-ignore
  if (data.currentNamespace.org && !data.currentNamespace.orgEnabled) {
    // @ts-ignore
    const firstAdminEmail = data.currentNamespace?.orgAdmins[0];
    // @ts-ignore
    const otherAdmins = data.currentNamespace?.orgAdmins.slice(1);

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
                  href={`mailto:${firstAdminEmail}`}
                  color="bc-link"
                  textDecor="underline"
                >
                  {firstAdminEmail}
                </Link>
                {otherAdmins.length > 0 && (
                  <Menu>
                    <MenuButton
                      as={Button}
                      ml={4}
                      size="sm"
                      variant="link"
                      color="bc-blue"
                      rightIcon={<Icon as={FaChevronDown} />}
                    >
                      More admins
                    </MenuButton>
                    <MenuList>
                      {otherAdmins.map((a: string) => (
                        <MenuItem key={a} as="a" href={`mailto:${a}`}>
                          {a}
                        </MenuItem>
                      ))}
                    </MenuList>
                  </Menu>
                )}
                .
              </Text>
            </Box>
          )}
        </Container>
      </Box>
    );
  }

  if (
    data.currentNamespace.org &&
    // @ts-ignore
    data.currentNamespace.orgEnabled &&
    bannerDisclosure.isOpen
  ) {
    return (
      <Box width="100%" bgColor="#E2F0DA" color="bc-success" boxShadow="md">
        <Container maxW="6xl" py={6}>
          <Flex align="center" justify="space-between" gridGap={8}>
            <Flex align="center" gridGap={4}>
              <Icon as={FaCheckCircle} />
              <Text fontSize="sm" fontWeight="bold">
                {`${user.namespace} namespace has been enabled to publish APIs to the Directory.`}
              </Text>
            </Flex>
            <IconButton
              icon={<Icon as={FaTimes} />}
              aria-label="Close banner button"
              onClick={bannerDisclosure.onClose}
              variant="link"
              ml={2}
              textDecor="underline"
              color="bc-link"
            />
          </Flex>
        </Container>
      </Box>
    );
  }

  if (data.currentNamespace?.org) {
    return null;
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
