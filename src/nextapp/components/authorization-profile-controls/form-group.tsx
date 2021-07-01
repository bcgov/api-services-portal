import * as React from 'react';
import { Box, Center, Grid } from '@chakra-ui/react';

interface FormGroupProps {
  children: React.ReactNode;
  infoBoxes?: React.ReactNode;
}

const FormGroup: React.FC<FormGroupProps> = ({ children, infoBoxes }) => {
  return (
    <Grid gap={4} templateColumns="1fr 1fr" p={4}>
      <Box>{children}</Box>
      <Center>{infoBoxes}</Center>
    </Grid>
  );
};

export default FormGroup;
