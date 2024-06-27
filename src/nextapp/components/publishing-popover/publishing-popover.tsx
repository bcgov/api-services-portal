import * as React from 'react';
import {
  Icon,
  Text,
  Link,
  Flex,
  Center,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverBody,
  PopoverArrow,
} from '@chakra-ui/react';
import { FaClock, FaMinusCircle, FaCheckCircle } from 'react-icons/fa';

import { useGlobal } from '@/shared/services/global';

interface PublishingPopoverProps {
  status: string;
}

const PublishingPopover: React.FC<PublishingPopoverProps> = ({ status }) => {
  const global = useGlobal();
  const DiscoveryUrl =
    global?.helpLinks.helpSupportUrl +
    'how-to/api-discovery/#enabling-for-discovery';

  return (
    <>
      {status === 'disabled' && (
        <Popover trigger="hover">
          <PopoverTrigger>
            <Center p={1}>
              <Icon as={FaMinusCircle} color="#B0B0B0" mr={2} boxSize={4} />
              <Text fontSize="sm" w={36}>
                Publishing disabled
              </Text>
            </Center>
          </PopoverTrigger>
          <PopoverContent>
            <PopoverArrow />
            <PopoverBody p={6}>
              <Flex align="center" mb={3}>
                <Icon as={FaMinusCircle} color="#B0B0B0" mr={2} boxSize={4} />
                <Text fontSize="sm" as="b">
                  Publishing disabled
                </Text>
              </Flex>
              <Text fontSize="sm">
                This means you still don't have permission to publish to the API
                directory any API contained in this gateway. Request publishing
                permission by{' '}
                <Link
                  href={DiscoveryUrl}
                  target="_blank"
                  color="bc-link"
                  textDecor="underline"
                >
                  adding an organization
                </Link>{' '}
                to your gateway.
              </Text>
            </PopoverBody>
          </PopoverContent>
        </Popover>
      )}
      {status === 'pending' && (
        <Popover trigger="hover">
          <PopoverTrigger>
            <Center p={1}>
              <Icon as={FaClock} color="#EE9B1F" mr={2} boxSize={4} />
              <Text fontSize="sm" w={36}>
                Pending publishing permission
              </Text>
            </Center>
          </PopoverTrigger>
          <PopoverContent>
            <PopoverArrow />
            <PopoverBody p={6}>
              <Flex align="center" mb={3}>
                <Icon as={FaClock} color="#EE9B1F" mr={2} boxSize={4} />
                <Text fontSize="sm" as="b">
                  Pending publishing permission
                </Text>
              </Flex>
              <Text fontSize="sm">
                This means you submitted a request to enable publishing
                permission and is pending your Organization Administrator
                approval.
              </Text>
            </PopoverBody>
          </PopoverContent>
        </Popover>
      )}
      {status === 'enabled' && (
        <Popover trigger="hover">
          <PopoverTrigger>
            <Center p={1}>
              <Icon as={FaCheckCircle} color="#2E8540" mr={2} boxSize={4} />
              <Text fontSize="sm" w={36}>
                Publishing enabled
              </Text>
            </Center>
          </PopoverTrigger>
          <PopoverContent>
            <PopoverArrow />
            <PopoverBody p={6}>
              <Flex align="center" mb={3}>
                <Icon as={FaCheckCircle} color="#2E8540" mr={2} boxSize={4} />
                <Text fontSize="sm" as="b">
                  Publishing enabled
                </Text>
              </Flex>
              <Text fontSize="sm">
                This means you are now allowed to publish to the API directory
                any API contained in this gateway, so others can find and access
                them.
              </Text>
            </PopoverBody>
          </PopoverContent>
        </Popover>
      )}
    </>
  );
};

export default PublishingPopover;
