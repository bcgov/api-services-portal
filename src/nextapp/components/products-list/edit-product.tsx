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
import { useMutation, useQueryClient } from 'react-query';
import { UPDATE_PRODUCT } from '@/shared/queries/products-queries';
import type { Product, ProductUpdateInput } from '@/shared/types/query.types';

import DatasetInput from './dataset-input';
import DeleteProduct from './delete-product';
import OrganizationSelect from './organization-select';
import api from '@/shared/services/api';

interface EditProductProps {
  data: Product;
}

const EditProduct: React.FC<EditProductProps> = ({ data }) => {
  const client = useQueryClient();
  const formRef = React.useRef<HTMLFormElement>(null);
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const mutation = useMutation(
    (payload: ProductUpdateInput) =>
      api(UPDATE_PRODUCT, { id: data.id, data: payload }),
    {
      onSuccess: () => {
        client.invalidateQueries(['products']);
        onClose();
        toast({
          title: `${data.name} Updated`,
          status: 'success',
        });
      },
      onError: () => {
        toast({
          title: `${data.name} Update Failed`,
          status: 'error',
        });
      },
    }
  );
  const updateProduct = React.useCallback(async () => {
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

    await mutation.mutateAsync(payload);
  }, [mutation]);
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
                  />
                  <FormHelperText>Must be unique</FormHelperText>
                </FormControl>
                <OrganizationSelect data={data} />
                <DatasetInput value={data.dataset?.name} />
              </VStack>
            </form>
          </ModalBody>

          <ModalFooter>
            <DeleteProduct id={data.id} onDeleted={onClose} />
            <Box flex={1} />
            <Button mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button
              isDisabled={mutation.isLoading}
              isLoading={mutation.isLoading}
              variant="primary"
              onClick={onUpdate}
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
