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
import { AccessItem, Scope } from './types';

interface NamespaceAccessDialogProps {
  accessItem?: AccessItem;
  buttonVariant?: ButtonProps['variant'];
  data: UmaScope[];
  onCancel?: () => void;
  onSubmit: (formData: FormData) => void;
  variant: 'user' | 'service';
}

const NamespaceAccessDialog: React.FC<NamespaceAccessDialogProps> = ({
  accessItem,
  buttonVariant = 'ghost',
  data = [],
  onCancel,
  onSubmit,
  variant = 'user',
}) => {
  const title =
    variant === 'user' ? 'Grant user access' : 'Grant service account access';
  const formRef = React.useRef<HTMLFormElement>();
  const [selected, setSelected] = React.useState<string[]>(() => {
    if (accessItem) {
      return accessItem.scopes.map((s) => s.name);
    }
    return [];
  });
  const { isOpen, onClose, onOpen } = useDisclosure();

  // Events
  const handleGrantAccess = () => {
    const formData = new FormData(formRef?.current);
    selected.forEach((scope) => {
      formData.append('scopes', scope);
    });
    onSubmit(formData);
    if (accessItem) {
      onCancel();
    } else {
      onClose();
    }
  };
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    handleGrantAccess();
  };
  const handleSubmitClick = () => {
    formRef.current?.requestSubmit();
  };
  const handleCancel = () => {
    if (accessItem) {
      onCancel();
    } else {
      onClose();
    }
  };

  return (
    <>
      {buttonVariant && (
        <Button
          leftIcon={<Icon as={FaPlusCircle} />}
          onClick={onOpen}
          variant={buttonVariant}
          data-testid="nsa-grant-access-btn"
        >
          {title}
        </Button>
      )}
      <Modal
        isOpen={Boolean(accessItem) || isOpen}
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
                    {variant === 'user' ? 'Email' : 'Service Account'}
                  </FormLabel>
                  <Input
                    defaultValue={accessItem?.requesterName}
                    name="email"
                    type="text"
                    data-testid="nsa-gua-email-field"
                  />
                </FormControl>
                <FormControl>
                  <FormLabel mb={4}>Permissions</FormLabel>
                  <CheckboxGroup>
                    <VStack spacing={4} align="start">
                      {data.map((r) => (
                        <WrapItem key={r.name}>
                          <Checkbox
                            onChange={(event) => {
                              if (event.target.checked) {
                                setSelected((s) => [...s, r.name]);
                              } else {
                                setSelected((s) =>
                                  s.filter((n) => n !== r.name)
                                );
                              }
                            }}
                            isChecked={selected.includes(r.name)}
                          >
                            {r.name}
                          </Checkbox>
                        </WrapItem>
                      ))}
                    </VStack>
                  </CheckboxGroup>
                </FormControl>
              </VStack>
              <button hidden type="submit" />
            </form>
          </ModalBody>
          <ModalFooter>
            <ButtonGroup>
              <Button
                variant="secondary"
                onClick={handleCancel}
                data-testid="nsa-gua-cancel-btn"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmitClick}
                data-testid="nsa-gua-share-btn"
              >
                {accessItem ? 'Update' : 'Share'}
              </Button>
            </ButtonGroup>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default React.memo(NamespaceAccessDialog);
