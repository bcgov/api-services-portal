import * as React from 'react';
import { Accordion, AccordionProps } from '@chakra-ui/react';

interface ExpandableCardsProps extends AccordionProps {
  children: React.ReactElement | React.ReactElement[];
}

const ExpandableCards: React.FC<ExpandableCardsProps> = ({
  children,
  ...props
}) => {
  const totalCards = React.Children.count(children);
  return (
    <Accordion
      allowMultiple
      allowToggle={totalCards > 1}
      defaultIndex={totalCards === 1 ? 0 : undefined}
      sx={{
        '& > div': {
          mb: 4,
        },
      }}
      {...props}
    >
      {React.Children.map(children, (child) =>
        React.cloneElement(child as React.ReactElement, {
          isSingle: totalCards === 1,
        })
      )}
    </Accordion>
  );
};

export default ExpandableCards;
