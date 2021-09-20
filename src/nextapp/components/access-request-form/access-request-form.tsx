import * as React from 'react';
import {
  Box,
  Checkbox,
  Flex,
  Link,
  Radio,
  RadioGroup,
  Select,
  Stack,
  Text,
  Textarea,
} from '@chakra-ui/react';
import { FaComments, FaNetworkWired, FaWindowMaximize } from 'react-icons/fa';

import Fieldset from './access-request-fieldset';

const AccessRequestForm = () => {
  return (
    <>
      <Fieldset isRequired icon={FaWindowMaximize} label="Test NK API">
        <Select>
          <option>App</option>
        </Select>
      </Fieldset>
      <Fieldset isRequired icon={FaNetworkWired} label="API Environment">
        <RadioGroup>
          <Stack direction="column">
            <Radio>conformance</Radio>
            <Radio>dev</Radio>
          </Stack>
        </RadioGroup>
      </Fieldset>
      <Fieldset label="Comments" icon={FaComments}>
        <Box mb={2}>
          <Text>
            Instructions from the API Provider: Access to this API requires a
            BCeID. Your request will be rejected if you did not log into the
            Portal with a valid Business BCeID. To continue, please provide your
            contact phone number below.
          </Text>
        </Box>
        <Textarea name="additionalDetails" />
      </Fieldset>
      <Box mt={4} p={4} bgColor="#f2f2f2" borderRadius={4}>
        <Checkbox colorScheme="blue" name="acceptLegal">
          I aggree to the terms of service for Test NK API
        </Checkbox>
        <Box mt={2} ml={7}>
          <Link
            fontWeight="bold"
            href="#"
            colorScheme="blue"
            target="_blank"
            rel="noreferrer"
          >
            View Legal
          </Link>
        </Box>
      </Box>
    </>
  );
};

export default AccessRequestForm;
