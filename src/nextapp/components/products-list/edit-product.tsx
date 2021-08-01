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
  useDisclosure,
  useToast,
  VStack,
} from '@chakra-ui/react';
import { FaPenSquare } from 'react-icons/fa';
import { useQueryClient } from 'react-query';
import { useApiMutation } from '@/shared/services/api';
import { UPDATE_PRODUCT } from '@/shared/queries/products-queries';
import type { Product, ProductUpdateInput } from '@/shared/types/query.types';

import DatasetInput from './dataset-input';
import DeleteProduct from './delete-product';
import OrganizationSelect from './organization-select';

interface EditProductProps {
  data: Product;
}

const EditProduct: React.FC<EditProductProps> = ({ data }) => {
  const client = useQueryClient();
  const formRef = React.useRef<HTMLFormElement>(null);
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const mutation = useApiMutation<ProductUpdateInput>(UPDATE_PRODUCT);
  const updateProduct = React.useCallback(async () => {
    try {
      const formData = new FormData(formRef.current);
      const payload: ProductUpdateInput = {
        name: formData.get('name') as string,
      };

      for (const k of formData.keys()) {
        if (k !== 'name') {
          if (formData.get(k)) {
            payload[k] = {
              connect: {
                id: formData.get(k),
              },
            };
          } else {
            payload[k] = {
              disconnectAll: true,
            };
          }
        }
      }

      await mutation.mutateAsync({ id: data.id, data: payload });
      client.invalidateQueries(['products']);
      onClose();
      toast({
        title: `${data.name} Updated`,
        status: 'success',
      });
    } catch (err) {
      console.error(err.message);
      toast({
        title: 'Update Product Failed',
        status: 'error',
      });
    }
  }, [client, data, mutation, onClose, toast]);
  const onUpdate = React.useCallback(() => {
    if (formRef.current.checkValidity()) {
      updateProduct();
    }
  }, [updateProduct]);
  const onSubmit = React.useCallback(
    (event) => {
      event.preventDefault();
      updateProduct;
    },
    [updateProduct]
  );

  return (
    <>
      <Button
        variant="tertiary"
        leftIcon={<Icon as={FaPenSquare} />}
        onClick={onOpen}
        data-testid="prd-edit-btn"
      >
        Edit
      </Button>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{`Edit ${data.name}`}</ModalHeader>
          <ModalBody>
            <form ref={formRef} onSubmit={onSubmit}>
              <VStack spacing={4}>
                <FormControl isRequired id="product-name">
                  <FormLabel>Product Name</FormLabel>
                  <Input
                    type="text"
                    name="name"
                    defaultValue={data.name}
                    variant="bc-input"
                    data-testid="prd-edit-name-input"
                  />
                  <FormHelperText>Must be unique</FormHelperText>
                </FormControl>
                <OrganizationSelect data={data} />
                <DatasetInput dataset={data.dataset} />
              </VStack>
            </form>
          </ModalBody>

          <ModalFooter>
            <DeleteProduct id={data.id} onDeleted={onClose} />
            <Box flex={1} />
            <Button mr={3} onClick={onClose} data-testid="prd-edit-cancel-btn">
              Cancel
            </Button>
            <Button
              isDisabled={mutation.isLoading}
              isLoading={mutation.isLoading}
              variant="primary"
              onClick={onUpdate}
              data-testid="prd-edit-update-btn"
            >
              Update
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default EditProduct;
