import * as React from 'react';
import {
  Box,
  Icon,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  useDisclosure,
} from '@chakra-ui/react';
import { HiOutlineChevronDown } from 'react-icons/hi';
import LabelDialog from './label-dialog';

interface InlineManageLabelsProps {
  data: string[];
  isReady: boolean;
}

const InlineManageLabels: React.FC<InlineManageLabelsProps> = ({
  data,
  isReady,
}) => {
  const { isOpen, onClose, onToggle } = useDisclosure();

  return (
    <>
      <LabelDialog data={data} isOpen={isOpen} onClose={onClose} />
      <Box as="span" pos="relative">
        Labels
        <Menu>
          <MenuButton pos="absolute" top="calc(-50% + 5px)">
            <IconButton
              aria-label="Manage labels button"
              icon={<Icon as={HiOutlineChevronDown} />}
              variant="ghost"
              data-testid="label-dialog-button"
            />
          </MenuButton>
          <MenuList>
            <MenuItem
              isDisabled={!isReady}
              onClick={onToggle}
              data-testid="label-dialog-menu-item"
            >
              Manage Group Labels
            </MenuItem>
          </MenuList>
        </Menu>
      </Box>
    </>
  );
};

export default InlineManageLabels;
