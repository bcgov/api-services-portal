import * as React from 'react';
import {
  Button,
  FormControl,
  FormLabel,
  FormHelperText,
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
import { QueryKey, useQueryClient } from 'react-query';
import { useApiMutation } from '@/shared/services/api';
import type { Product, ProductUpdateInput } from '@/shared/types/query.types';
import kebabCase from 'lodash/kebabCase';
import DatasetInput from './dataset-input';
import DeleteProduct from './delete-product';
import ActionsMenu from '../actions-menu';
import { gql } from 'graphql-request';

interface EditProductProps {
  data: Product;
  queryKey: QueryKey;
}

const EditProduct: React.FC<EditProductProps> = ({ data, queryKey }) => {
  const client = useQueryClient();
  const formRef = React.useRef<HTMLFormElement>(null);
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const deleteDisclosure = useDisclosure();
  const mutate = useApiMutation<ProductUpdateInput>(mutation);
  const updateProduct = async () => {
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

      await mutate.mutateAsync({ id: data.id, data: payload });
      await client.invalidateQueries(queryKey);
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
  };
  const handleSaveClick = () => {
    formRef.current?.requestSubmit();
  };
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    updateProduct();
  };
  const dataTestIdName = kebabCase(data.name);

  return (
    <>
      <ActionsMenu data-testid={`${dataTestIdName}-more-options-btn`}>
        <MenuItem onClick={onOpen} data-testid={`${dataTestIdName}-edit-btn`}>
          Edit Product
        </MenuItem>
        <MenuItem
          color="bc-error"
          data-testid={`${dataTestIdName}-delete-btn`}
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
        queryKey={queryKey}
      />
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{`Edit ${data.name}`}</ModalHeader>
          <ModalBody>
            <form ref={formRef} onSubmit={handleSubmit}>
              <VStack spacing={4}>
                <FormControl isRequired id="product-name">
                  <FormLabel>Product Name</FormLabel>
                  <FormHelperText>Must be unique</FormHelperText>
                  <Input
                    type="text"
                    name="name"
                    defaultValue={data.name}
                    variant="bc-input"
                    data-testid="prd-edit-name-input"
                  />
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
              isDisabled={mutate.isLoading}
              isLoading={mutate.isLoading}
              variant="primary"
              onClick={handleSaveClick}
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

const mutation = gql`
  mutation UpdateProduct($id: ID!, $data: ProductUpdateInput) {
    updateProduct(id: $id, data: $data) {
      id
    }
  }
`;
