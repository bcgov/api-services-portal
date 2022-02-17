import * as React from 'react';
import { Box, Grid, Heading, VStack } from '@chakra-ui/layout';
import { Checkbox } from '@chakra-ui/checkbox';

const Authorization: React.FC = () => {
  return (
    <Box>
      <Grid
        templateColumns="repeat(3, 1fr)"
        gap={8}
        borderBottom="2px solid"
        borderColor="bc-yellow"
        pb={4}
        mb={4}
      >
        <Heading size="sm" fontWeight="normal">
          Scope
        </Heading>
        <Heading size="sm" fontWeight="normal">
          Roles
        </Heading>
      </Grid>
      <Grid
        as="form"
        name="authorizationForm"
        templateColumns="repeat(3, 1fr)"
        gap={8}
        borderBottom="1px solid"
        pb={4}
        borderColor="bc-divider"
      >
        <VStack align="flex-start" spacing={3}>
          <Checkbox>System/Patient</Checkbox>
          <Checkbox>System/MedicationRequest</Checkbox>
          <Checkbox>System/OtherRolesAndSuch</Checkbox>
          <Checkbox>System/OtherRolesAndSuch</Checkbox>
          <Checkbox>System/OtherRolesAndSuch</Checkbox>
        </VStack>
        <VStack align="flex-start" spacing={3}>
          <Checkbox>System/Patient</Checkbox>
          <Checkbox>System/MedicationRequest</Checkbox>
          <Checkbox>System/OtherRolesAndSuch</Checkbox>
        </VStack>
      </Grid>
    </Box>
  );
};

export default Authorization;
