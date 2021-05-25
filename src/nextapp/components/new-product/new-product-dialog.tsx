// @ts-nocheck
import * as React from 'react';
import {
  Button,
  ButtonGroup,
  FormControl,
  FormHelperText,
  FormLabel,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Radio,
  RadioGroup,
  Stack,
  useToast,
} from '@chakra-ui/react';
import { useQueryClient } from 'react-query';
import {
  ADD_ENVIRONMENT,
  ADD_PRODUCT,
} from '@/shared/queries/products-queries';
import { useApiMutation } from '@/shared/services/api';
import type { Mutation } from '@/types/query.types';

interface NewProductDialogProps {
  open: boolean;
  onClose: () => void;
}

const NewProductDialog: React.FC<NewProductDialogProps> = ({
  open,
  onClose,
}) => {
  const toast = useToast();
  const queryClient = useQueryClient();
  const productMutation = useApiMutation<{ name: string }>(ADD_PRODUCT);
  const environmentMutation = useApiMutation<{
    product: string;
    name: string;
  }>(ADD_ENVIRONMENT);
  const form = React.useRef<HTMLFormElement>();
  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    createProduct();
  };
  const createProduct = async () => {
    if (form.current) {
      const data = new FormData(form.current);

      if (form.current.checkValidity()) {
        try {
          const productName = data.get('name') as string;
          const environment = data.get('environment') as string;
          const res = await productMutation.mutateAsync({ name: productName });
          await environmentMutation.mutateAsync({
            product: res.createProduct.id,
            name: environment,
          });

          queryClient.invalidateQueries('products');
          toast({
            title: `Product ${productName} created!`,
            description: 'You can now add more environments',
            status: 'success',
          });
          onClose();
        } catch {
          toast({
            title: 'Create Failed',
            status: 'error',
          });
        }
      }
    }
  };

  return (
    <Modal isOpen={open} onClose={onClose}>
      <ModalOverlay />
      <ModalContent borderRadius="4px">
        <ModalHeader>Create Product</ModalHeader>
        <ModalBody>
          <form ref={form} onSubmit={onSubmit}>
            <FormControl
              isRequired
              mb={4}
              isDisabled={productMutation.isLoading}
            >
              <FormLabel>Product Name</FormLabel>
              <Input
                placeholder="Product Name"
                name="name"
                variant="bc-input"
              />
            </FormControl>
            <FormControl as="fieldset" isRequired>
              <FormLabel as="legend">Environment</FormLabel>
              <RadioGroup defaultValue="dev">
                <Stack>
                  <Radio name="environment" value="dev">
                    Development
                  </Radio>
                  <Radio name="environment" value="test">
                    Test
                  </Radio>
                  <Radio name="environment" value="sandbox">
                    Sandbox
                  </Radio>
                  <Radio name="environment" value="prod">
                    Production
                  </Radio>
                  <Radio name="environment" value="other">
                    Other
                  </Radio>
                </Stack>
              </RadioGroup>
              <FormHelperText>
                Select the first environment for this product
              </FormHelperText>
            </FormControl>
          </form>
        </ModalBody>
        <ModalFooter>
          <ButtonGroup>
            <Button onClick={onClose}>Cancel</Button>
            <Button
              isLoading={productMutation.isLoading}
              variant="primary"
              onClick={createProduct}
            >
              Create
            </Button>
          </ButtonGroup>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default NewProductDialog;
