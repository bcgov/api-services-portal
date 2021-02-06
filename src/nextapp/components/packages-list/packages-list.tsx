import * as React from 'react';
import api from '@/shared/services/api';
import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
} from '@chakra-ui/react';
import EmptyPane from '@/components/empty-pane';
import { useQuery } from 'react-query';

import { GET_LIST } from './queries';

const PackagesList: React.FC = () => {
  const { data } = useQuery<Query>(
    'packages',
    async () => await api(GET_LIST),
    {
      suspense: true,
    }
  );

  if (data.allPackages.length === 0) {
    return (
      <EmptyPane
        title="You Have No Packages"
        message="Create your first package via the New Package button. You can create additional environments once a package has been made."
      />
    );
  }

  return (
    <Box width="100%">
      <Accordion>
        {data.allPackages.map((d) => (
          <AccordionItem key={d}>
            <AccordionButton>
              <Box flex="1" textAlign="left">
                {d.name}
              </Box>
              <AccordionIcon />
            </AccordionButton>
            <AccordionPanel>Hello</AccordionPanel>
          </AccordionItem>
        ))}
      </Accordion>
    </Box>
  );
};

export default PackagesList;
