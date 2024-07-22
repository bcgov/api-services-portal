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
  useDisclosure,
} from '@chakra-ui/react';
import { FaChevronDown } from 'react-icons/fa';
import { BiLinkExternal } from 'react-icons/bi';
import { useGlobal } from '@/shared/services/global';
import SupportLinks from '../support-links';

const HelpMenu: React.FC = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const data = useGlobal();

  return (
    <>
      <SupportLinks isOpen={isOpen} onClose={onClose} />
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
            <MenuGroup>
              <MenuItem
                as="a"
                color="bc-blue"
                href={data?.helpLinks.helpSupportUrl}
                data-testid="help-menu-aps-support"
                target="_blank"
                rel="noopener noreferrer"
              >
                Support Docs
                <Icon as={BiLinkExternal} boxSize="4" ml={2} />
              </MenuItem>
              <MenuItem
                as="a"
                color="bc-blue"
                href={data?.helpLinks.helpApiDocsUrl}
                target="_blank"
                rel="noopener noreferrer"
                data-testid="help-menu-api-docs"
              >
                API Console
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
            <MenuGroup>
              <MenuItem
                color="bc-blue"
                data-testid="help-menu-support"
                onClick={onOpen}
              >
                Contact Us
              </MenuItem>
            </MenuGroup>
            <MenuDivider />
            <MenuGroup>
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
