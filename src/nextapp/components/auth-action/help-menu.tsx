import * as React from 'react';
import {
  Box,
  Icon,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Text,
  MenuDivider,
  MenuGroup,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Button,
  UnorderedList,
  ListItem,
  Link,
} from '@chakra-ui/react';
import { FaChevronDown } from 'react-icons/fa';
import { BiLinkExternal } from 'react-icons/bi';
import { useRestApi } from '@/shared/services/api';

type HelpLinks = {
  version: string;
  revision: string;
  cluster: string;
  helpLinks: Record<string, string>;
};

const HelpMenu: React.FC = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { data, isSuccess, isError } = useRestApi<HelpLinks>('help', '/about', {
    suspense: false,
  });

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Support Links</ModalHeader>
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
                  Submit product and service requests using the Data Systems and
                  Services request system
                  <Icon as={BiLinkExternal} boxSize="4" ml={2} />
                </Link>
              </ListItem>
              <ListItem>
                <Link
                  href={data?.helpLinks.helpChatUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Chat with us in Rocket Chat
                  <Icon as={BiLinkExternal} boxSize="4" ml={2} />
                </Link>
              </ListItem>
              <ListItem>
                <Link
                  href={data?.helpLinks.helpIssueUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Create an issue in Github
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
      <Box
        as="span"
        d="flex"
        pr={0}
        alignItems="center"
        position="relative"
        zIndex={2}
      >
        <Menu placement="bottom-end">
          <MenuButton
            isDisabled={!isSuccess}
            px={2}
            py={1}
            transition="all 0.2s"
            borderRadius={4}
            _hover={{ bg: 'bc-link' }}
            _expanded={{ bg: 'blue.400' }}
            _focus={{ boxShadow: 'outline' }}
            data-testid="help-dropdown-btn"
          >
            Help
            <Icon as={FaChevronDown} ml={2} aria-label="chevron down icon" />
          </MenuButton>
          <MenuList
            color="bc-component"
            sx={{
              'p.chakra-menu__group__title': {
                fontSize: 'md',
                fontWeight: 'normal !important',
                px: 1,
              },
            }}
          >
            <MenuGroup title="Documentation">
              <MenuItem
                as="a"
                color="bc-blue"
                href={data?.helpLinks.helpApiDocsUrl}
                target="_blank"
                rel="noopener noreferrer"
                data-testid="help-menu-api-docs"
              >
                API Docs
                <Icon as={BiLinkExternal} boxSize="4" ml={2} />
              </MenuItem>
              <MenuItem
                as="a"
                color="bc-blue"
                href={data?.helpLinks.helpSupportUrl}
                data-testid="help-menu-aps-support"
                target="_blank"
                rel="noopener noreferrer"
              >
                APS Support
                <Icon as={BiLinkExternal} boxSize="4" ml={2} />
              </MenuItem>
              <MenuItem
                as="a"
                color="bc-blue"
                href={data?.helpLinks.helpReleaseUrl}
                rel="noopener noreferrer"
                data-testid="help-menu-release-notes"
                target="_blank"
              >
                Release Notes
                <Icon as={BiLinkExternal} boxSize="4" ml={2} />
              </MenuItem>
            </MenuGroup>
            <MenuDivider />
            <MenuGroup title="Contact Us">
              <MenuItem
                color="bc-blue"
                data-testid="help-menu-support"
                onClick={onOpen}
              >
                Support Links
              </MenuItem>
            </MenuGroup>
            <MenuDivider />
            <MenuGroup title="About">
              <MenuItem
                as="a"
                color="bc-blue"
                href={data?.helpLinks.helpStatusUrl}
                target="_blank"
                rel="noopener noreferrer"
                data-testid="help-menu-status"
              >
                Status
                <Icon as={BiLinkExternal} boxSize="4" ml={2} />
              </MenuItem>
              <MenuItem
                isFocusable={false}
                as="div"
                flexDir="column"
                alignItems="flex-start"
                data-testid="help-menu-version"
              >
                <Text fontSize="xs">{`Version: ${
                  data?.version
                } revision: ${data?.revision?.slice(0, 9)}`}</Text>
                <Text fontSize="xs">{`Cluster: ${data?.cluster}`}</Text>
              </MenuItem>
            </MenuGroup>
          </MenuList>
        </Menu>
      </Box>
    </>
  );
};
export default HelpMenu;
