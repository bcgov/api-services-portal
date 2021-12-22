import * as React from 'react';
import { Accordion, AccordionProps } from '@chakra-ui/react';

interface ExpandableCardsProps extends AccordionProps {
  children: React.ReactElement | React.ReactElement[];
}

const ExpandableCards: React.FC<ExpandableCardsProps> = ({
  children,
  ...props
}) => {
  return (
    <Accordion
      allowToggle
      allowMultiple
      sx={{
        '& > div': {
          mb: 4,
        },
      }}
      {...props}
    >
      {children}
    </Accordion>
  );
};

export default ExpandableCards;
