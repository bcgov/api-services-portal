import * as React from 'react';
import {
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionItemProps,
  AccordionPanel,
  Box,
  Icon,
} from '@chakra-ui/react';
import { FaRegCircle } from 'react-icons/fa';

interface ExpandableCardProps extends AccordionItemProps {
  icon?: React.FC;
  isSingle?: boolean;
  heading: React.ReactNode;
  onButtonClick?: () => void;
}

const ExpandableCard: React.FC<ExpandableCardProps> = ({
  children,
  isSingle,
  icon = FaRegCircle,
  heading,
  onButtonClick,
  ...props
}) => {
  return (
    <AccordionItem
      borderRadius={4}
      sx={{
        '&:last-of-type': {
          borderBottomWidth: 'none',
        },
      }}
      {...props}
    >
      <h2>
        <AccordionButton
          px={7}
          py={9}
          borderRadius={4}
          borderX="1px solid"
          borderBottom="1px solid"
          borderColor="#e1e1e5"
          _hover={{
            bgColor: 'none',
            color: isSingle ? 'inherit' : 'bc-link',
            cursor: isSingle ? 'default' : undefined
          }}
          _focus={{
            outline: 'none',
          }}
          _expanded={{
            borderBottom: 'none',
            borderBottomRadius: 0,
            pb: 7,
          }}
          onClick={onButtonClick}
        >
          <Box flex="1" textAlign="left">
            <Icon as={icon} boxSize="5" color="bc-blue" mr={2.5} />
            {heading}
          </Box>
          {!isSingle && <AccordionIcon />}
        </AccordionButton>
      </h2>
      <AccordionPanel
        pb={7}
        px={14}
        borderBottomRadius={4}
        borderBottom="1px solid"
        borderX="1px solid"
        borderColor="#e1e1e5"
      >
        {children}
      </AccordionPanel>
    </AccordionItem>
  );
};

export default ExpandableCard;
