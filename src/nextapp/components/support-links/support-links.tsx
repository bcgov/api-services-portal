import * as React from 'react';
import {
  Icon,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  UnorderedList,
  ListItem,
  Link,
} from '@chakra-ui/react';
import { BiLinkExternal } from 'react-icons/bi';
import { useGlobal } from '@/shared/services/global';

interface SupportLinksProps {
  isOpen: boolean;
  onClose: () => void;
}

const SupportLinks: React.FC<SupportLinksProps> = ({ isOpen, onClose }) => {
  const data = useGlobal();

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Contact Us</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <UnorderedList
            spacing={4}
            sx={{
              '& a': {
                textDecor: 'underline',
                color: 'bc-link',
                _hover: {
                  textDecor: 'none',
                },
              },
            }}
          >
            <ListItem>
              <Link
                href={data?.helpLinks.helpDeskUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                Submit a support ticket
                <Icon as={BiLinkExternal} boxSize="4" ml={2} />
              </Link>
            </ListItem>
            <ListItem>
              <Link
                href={data?.helpLinks.helpChatUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                Chat with us in Rocket.Chat
                <Icon as={BiLinkExternal} boxSize="4" ml={2} />
              </Link>
            </ListItem>
          </UnorderedList>
        </ModalBody>

        <ModalFooter>
          <Button onClick={onClose}>Close</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default SupportLinks;
