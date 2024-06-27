import * as React from 'react';
import compact from 'lodash/compact';
import {
  Avatar,
  Box,
  Button,
  Flex,
  Icon,
  Text,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useDisclosure,
  Link,
} from '@chakra-ui/react';
import { dump } from 'js-yaml';
import { FaExclamationTriangle } from 'react-icons/fa';
import { HiOutlineDocumentSearch } from 'react-icons/hi';
import { uid } from 'react-uid';
import YamlViewer from '@/components/yaml-viewer';
import { ActivitySummary } from '@/shared/types/query.types';

interface ActivitySortDate extends ActivitySummary {
  sortDate: string;
}

interface ActivityItemProps {
  data: ActivitySortDate;
  onSelect: (key: string, value: string) => void;
}

const ActivityItem: React.FC<ActivityItemProps> = ({ data, onSelect }) => {
  const { isOpen, onClose, onOpen } = useDisclosure();
  const compiled = template(data.message, data.params as TemplateMap);
  const regex = /(\{|<|\[|\]|>|\})/g;
  const clean = compact(compiled.split(regex));
  const text = [];

  clean.forEach((str, index, arr) => {
    if (!regex.test(str)) {
      switch (arr[index - 1]) {
        case '<':
          text.push(
            <Link
              key={uid(str)}
              textDecoration="underline"
              data-filter-type="users"
              onClick={() => onSelect('users', str)}
            >
              {str}
            </Link>
          );
          break;
        case '{':
          text.push(
            <Link
              key={uid(str)}
              textDecoration="underline"
              data-filter-type="consumers"
              onClick={() => onSelect('consumers', str)}
            >
              {str}
            </Link>
          );
          break;
        case '[':
          text.push(
            <Text key={uid(str)} as="strong">
              {str}
            </Text>
          );
          break;
        default:
          text.push(str);
          break;
      }
    }
  });

  return (
    <Flex pb={5} align="center" data-content-id={data.id}>
      <Avatar name={data.params?.actor} size="sm" mr={5} />
      <Box>
        <Flex align="center">
          {data.result === 'failed' && (
            <>
              <Icon as={FaExclamationTriangle} color="bc-error" mr={2} />
            </>
          )}
          <Text>{text}</Text>
          {data.blob && (
            <Box ml={2}>
              <Button
                leftIcon={<Icon as={HiOutlineDocumentSearch} />}
                color="bc-blue"
                onClick={onOpen}
                variant="link"
              >
                More details
              </Button>
              <Modal
                isOpen={isOpen}
                onClose={onClose}
                scrollBehavior="inside"
                size="2xl"
              >
                <ModalOverlay />
                <ModalContent>
                  <ModalCloseButton />
                  <ModalHeader>Activity Details</ModalHeader>
                  <ModalBody>
                    <YamlViewer doc={dump(data.blob)} />
                  </ModalBody>
                  <ModalFooter>
                    <Button onClick={onClose}>Done</Button>
                  </ModalFooter>
                </ModalContent>
              </Modal>
            </Box>
          )}
        </Flex>
        <Text
          as="time"
          color="bc-component"
          fontSize="sm"
          dateTime={data.activityAt}
        >
          {new Date(data.activityAt).toLocaleTimeString('en-CA', {
            timeStyle: 'short',
          })}
        </Text>
      </Box>
    </Flex>
  );
};

export default ActivityItem;

// Adapted from just-template
// https://github.com/angus-c/just/blob/master/packages/string-template/index.js
type TemplateMap = {
  [key: string]: TemplateMap | string;
};

function template(string: string, data: TemplateMap): string {
  const proxyRegEx = /\{([^}]+)?\}/g;

  return string.replace(proxyRegEx, (_, key) => {
    const keyParts = key.split('.');
    let result = '';

    for (let i = 0; i < keyParts.length; i++) {
      if (!data) return '';

      switch (keyParts[i]) {
        case 'actor':
          result += `<${data[keyParts[i]]}>`;
          break;
        case 'consumer':
          result += `{${data[keyParts[i]]}}`;
          break;
        case 'action':
          result += `[${data[keyParts[i]]}]`;
          break;
        default:
          result += data[keyParts[i]];
          break;
      }
    }

    return result || '';
  }).replace(/namespace/gi, (match) => match === 'namespace' ? 'gateway' : 'Gateway') // Replace both 'namespace' and 'Namespace'
}
