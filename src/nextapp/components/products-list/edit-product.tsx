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
  MenuItem,
} from '@chakra-ui/react';
import { FaPenSquare } from 'react-icons/fa';
import { useQueryClient } from 'react-query';
import { useApiMutation } from '@/shared/services/api';
import { UPDATE_PRODUCT } from '@/shared/queries/products-queries';
import type { Product, ProductUpdateInput } from '@/shared/types/query.types';
import kebabCase from 'lodash/kebabCase';
import DatasetInput from './dataset-input';
import DeleteProduct from './delete-product';
import ActionsMenu from '../actions-menu';

interface EditProductProps {
  data: Product;
}

const EditProduct: React.FC<EditProductProps> = ({ data }) => {
  const client = useQueryClient();
  const formRef = React.useRef<HTMLFormElement>(null);
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const deleteDisclosure = useDisclosure();
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
        title: `${data.name} updated`,
        status: 'success',
        isClosable: true,
      });
    } catch (err) {
      toast({
        title: 'Update product failed',
        status: 'error',
        description: err,
        isClosable: true,
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
      <ActionsMenu>
        <MenuItem
          onClick={onOpen}
          data-testid={`${kebabCase(data.name)}-edit-btn`}
        >
          Edit Product
        </MenuItem>
        <MenuItem
          color="bc-error"
          data-testid={`${kebabCase(data.name)}-delete-btn`}
          onClick={deleteDisclosure.onOpen}
        >
          Delete Product...
        </MenuItem>
      </ActionsMenu>
      <DeleteProduct
        isOpen={deleteDisclosure.isOpen}
        onClose={deleteDisclosure.onClose}
        id={data.id}
        onDeleted={deleteDisclosure.onClose}
      />
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
                <DatasetInput dataset={data.dataset} />
              </VStack>
            </form>
          </ModalBody>

          <ModalFooter>
            <Button
              mr={3}
              onClick={onClose}
              data-testid="prd-edit-cancel-btn"
              variant="secondary"
            >
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
