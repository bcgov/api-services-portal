import * as React from 'react';
import {
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  useDisclosure,
  FormControl,
  FormLabel,
  FormHelperText,
  Input,
  Select,
  ButtonGroup,
  RadioGroup,
  Stack,
  Radio,
} from '@chakra-ui/react';
import { FaDoorClosed } from 'react-icons/fa';

import AddControlButton from './add-control-button';

const IpRestriction: React.FC = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <>
      <AddControlButton icon={FaDoorClosed} onClick={onOpen}>
        IP Restritions
      </AddControlButton>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>IP Restrition</ModalHeader>
          <ModalBody>
            <FormControl id="type" mb={4}>
              <FormLabel>Type</FormLabel>
              <RadioGroup defaultValue="route">
                <Stack spacing={4} direction="row">
                  <Radio name="type" value="route">
                    Route
                  </Radio>
                  <Radio name="type" value="service">
                    Service
                  </Radio>
                </Stack>
              </RadioGroup>
            </FormControl>
            <FormControl id="allowed" mb={4}>
              <FormLabel>Route</FormLabel>
              <Select variant="bc-input">
                <option>Route Name</option>
              </Select>
            </FormControl>
            <FormControl id="allowed">
              <FormLabel>Allowed IPs</FormLabel>
              <Input variant="bc-input" />
              <FormHelperText>
                Comma-separated list, i.e. 1.1.1.1, 0.0.0.0
              </FormHelperText>
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary">Apply</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default IpRestriction;
