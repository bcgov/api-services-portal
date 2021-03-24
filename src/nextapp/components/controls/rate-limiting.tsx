import * as React from 'react';
import {
  Button,
  ButtonGroup,
  HStack,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  useDisclosure,
  FormControl,
  FormLabel,
  Input,
  Select,
  Stack,
  Radio,
  RadioGroup,
} from '@chakra-ui/react';
import AddControlButton from './add-control-button';
import { FaTrafficLight } from 'react-icons/fa';

const IpRestriction: React.FC = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <>
      <AddControlButton icon={FaTrafficLight} onClick={onOpen}>
        Rate Limiting
      </AddControlButton>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Rate Limiting</ModalHeader>
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
            <HStack spacing={4} mb={4}>
              <FormControl id="second">
                <FormLabel>Second</FormLabel>
                <Input variant="bc-input" placeholder="00" />
              </FormControl>
              <FormControl id="minute">
                <FormLabel>Minute</FormLabel>
                <Input variant="bc-input" placeholder="00" />
              </FormControl>
              <FormControl id="hour">
                <FormLabel>Hour</FormLabel>
                <Input variant="bc-input" placeholder="00" />
              </FormControl>
              <FormControl id="day">
                <FormLabel>Day</FormLabel>
                <Input variant="bc-input" placeholder="00" />
              </FormControl>
            </HStack>
            <FormControl id="policy">
              <FormLabel>Policy</FormLabel>
              <Select variant="bc-input">
                <option value="local">Local</option>
                <option value="redis">Redis</option>
              </Select>
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
