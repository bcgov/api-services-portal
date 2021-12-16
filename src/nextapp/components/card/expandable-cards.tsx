import * as React from 'react';
import { Accordion } from '@chakra-ui/react';

interface ExpandableCardsProps {
  children: React.ReactElement | React.ReactElement[];
}

const ExpandableCards: React.FC<ExpandableCardsProps> = ({ children }) => {
  return (
    <Accordion
      allowToggle
      allowMultiple
      sx={{
        '& > div': {
          mb: 4,
        },
      }}
    >
      {children}
    </Accordion>
  );
};

export default ExpandableCards;
