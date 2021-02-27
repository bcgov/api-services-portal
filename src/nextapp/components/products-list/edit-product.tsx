import * as React from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
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
  Text,
  useDisclosure,
  VStack,
} from '@chakra-ui/react';
import { FaPenSquare } from 'react-icons/fa';
import type { Product } from '@/shared/types/query.types';

import DatasetInput from './dataset-input';
import DeleteProduct from './delete-product';

interface EditProductProps {
  data: Product;
}

const EditProduct: React.FC<EditProductProps> = ({ data }) => {
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
              <FormControl isRequired id="product-name">
                <FormLabel>Product Name</FormLabel>
                <Input
                  type="text"
                  name="name"
                  defaultValue={data.name}
                  variant="bc-input"
                />
                <FormHelperText>Must be unique</FormHelperText>
              </FormControl>
              <FormControl id="product-organization">
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
                  Which organization does this product belong to?
                </FormHelperText>
              </FormControl>
              <FormControl id="product-organization-unit">
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
              <DatasetInput value={data.dataset.name} />
            </VStack>
          </ModalBody>

          <ModalFooter>
            <DeleteProduct id={data.id} onDeleted={onClose} />
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

export default EditProduct;
