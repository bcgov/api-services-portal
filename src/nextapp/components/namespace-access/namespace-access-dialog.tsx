import * as React from 'react';
import {
  Button,
  Checkbox,
  CheckboxGroup,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalOverlay,
  ModalHeader,
  Input,
  ButtonGroup,
  FormControl,
  FormLabel,
  Icon,
  useDisclosure,
  VStack,
  WrapItem,
  ButtonProps,
} from '@chakra-ui/react';
import { FaPlusCircle } from 'react-icons/fa';
import startCase from 'lodash/startCase';
import { UmaScope } from '@/shared/types/query.types';

interface NamespaceAccessDialogProps {
  buttonVariant?: ButtonProps['variant'];
  data: UmaScope[];
  onSubmit: (formData: FormData) => void;
  variant: 'user' | 'service';
}

const NamespaceAccessDialog: React.FC<NamespaceAccessDialogProps> = ({
  buttonVariant = 'ghost',
  data = [],
  onSubmit,
  variant = 'user',
}) => {
  const title =
    variant === 'user' ? 'Grant user access' : 'Grant service account access';
  const formRef = React.useRef<HTMLFormElement>();
  const { isOpen, onClose, onOpen } = useDisclosure();
  const handleGrantAccess = () => {
    const formData = new FormData(formRef?.current);
    onSubmit(formData);
    onClose();
  };
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    handleGrantAccess();
  };
  const handleSubmitClick = () => {
    formRef.current?.requestSubmit();
  };

  return (
    <>
      <Button
        leftIcon={<Icon as={FaPlusCircle} />}
        onClick={onOpen}
        variant={buttonVariant}
        data-testid="nsa-grant-access-btn"
      >
        {title}
      </Button>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        scrollBehavior="inside"
        size="xl"
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{startCase(title)}</ModalHeader>
          <ModalBody>
            <form ref={formRef} onSubmit={handleSubmit}>
              <VStack spacing={6}>
                <FormControl isRequired>
                  <FormLabel>
                    {variant === 'user' ? 'Username' : 'Service Account'}
                  </FormLabel>
                  <Input
                    name="username"
                    type="text"
                    data-testid="nsa-gua-username-field"
                  />
                </FormControl>
                <FormControl>
                  <FormLabel mb={4}>Permissions</FormLabel>
                  <CheckboxGroup>
                    <VStack spacing={4} align="start">
                      {data.map((r) => (
                        <WrapItem key={r.name}>
                          <Checkbox value={r.name} name="scopes">
                            {r.name}
                          </Checkbox>
                        </WrapItem>
                      ))}
                    </VStack>
                  </CheckboxGroup>
                </FormControl>
              </VStack>
            </form>
          </ModalBody>
          <ModalFooter>
            <ButtonGroup>
              <Button
                variant="secondary"
                onClick={onClose}
                data-testid="nsa-gua-cancel-btn"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmitClick}
                data-testid="nsa-gua-share-btn"
              >
                Share
              </Button>
            </ButtonGroup>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default NamespaceAccessDialog;
