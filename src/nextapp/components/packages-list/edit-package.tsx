import * as React from 'react';
import {
  Box,
  Button,
  Checkbox,
  FormControl,
  FormLabel,
  FormErrorMessage,
  FormHelperText,
  Icon,
  Input,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  Select,
  useDisclosure,
  VStack,
} from '@chakra-ui/react';
import { FaPenSquare } from 'react-icons/fa';
import type { Package } from '@/shared/types/query.types';

interface EditPackageProps {
  data: Package;
}

const EditPackage: React.FC<EditPackageProps> = ({ data }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <>
      <Button
        variant="tertiary"
        leftIcon={<Icon as={FaPenSquare} />}
        onClick={onOpen}
      >
        Edit
      </Button>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{`Edit ${data.name}`}</ModalHeader>
          <ModalBody>
            <VStack as="form" onSubmit={(e) => e.preventDefault()} spacing={4}>
              <FormControl isRequired id="package-name">
                <FormLabel>Package Name</FormLabel>
                <Input
                  type="text"
                  name="name"
                  defaultValue={data.name}
                  variant="bc-input"
                />
                <FormHelperText>Must be unique</FormHelperText>
              </FormControl>
              <FormControl id="package-organization">
                <FormLabel>Organization</FormLabel>
                <Select
                  defaultValue={data.organization ? data.organization[0] : ''}
                  name="organization"
                  variant="bc-input"
                >
                  <option value="health">Health</option>
                  <option value="loc">Location Services</option>
                </Select>
                <FormHelperText>
                  Which organization does this package belong to?
                </FormHelperText>
              </FormControl>
              <FormControl id="package-organization-unit">
                <FormLabel>Organization Unit</FormLabel>
                <Select
                  defaultValue={data.organizationUnit?.name}
                  name="organizationUnit"
                  variant="bc-input"
                >
                  <option value="health">Health</option>
                  <option value="loc">Location Services</option>
                </Select>
              </FormControl>
              <FormControl>
                <Checkbox defaultIsChecked>Link to BCDC</Checkbox>
              </FormControl>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="red">Delete Package</Button>
            <Box flex={1} />
            <Button mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary">Update</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default EditPackage;
