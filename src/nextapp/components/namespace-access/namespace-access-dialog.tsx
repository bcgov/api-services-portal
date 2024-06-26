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
  Text,
} from '@chakra-ui/react';
import { FaPlusCircle } from 'react-icons/fa';
import startCase from 'lodash/startCase';
import { UmaPolicy, UmaScope } from '@/shared/types/query.types';
import { AccessItem, Scope } from './types';

interface NamespaceAccessDialogProps {
  accessItem?: AccessItem;
  buttonVariant?: ButtonProps['variant'];
  data: UmaScope[];
  onCancel?: () => void;
  onSubmit: (formData: FormData) => void;
  serviceAccount?: UmaPolicy;
  variant: 'user' | 'service';
}

const NamespaceAccessDialog: React.FC<NamespaceAccessDialogProps> = ({
  accessItem,
  buttonVariant = 'ghost',
  data = [],
  onCancel,
  onSubmit,
  serviceAccount,
  variant = 'user',
}) => {
  const isEditing = Boolean(accessItem) ?? Boolean(serviceAccount);
  const title = React.useMemo(() => {
    if (accessItem) {
      return 'Edit access';
    }
    if (variant === 'user') {
      return 'Grant user access';
    }
    return 'Grant service account access';
  }, [variant, accessItem]);
  const formRef = React.useRef<HTMLFormElement>();
  const getDefault = () => {
    if (variant === 'user' && accessItem) {
      return accessItem.scopes.map((s: Scope) => s.name);
    } else if (variant === 'service' && serviceAccount) {
      return serviceAccount?.scopes;
    }
    return [];
  };
  const [selected, setSelected] = React.useState<string[]>(getDefault);
  const { isOpen, onClose, onOpen } = useDisclosure();

  // Events
  const handleGrantAccess = () => {
    const formData = new FormData(formRef?.current);
    selected.forEach((scope) => {
      formData.append('scopes', scope);
    });
    onSubmit(formData);
    if (accessItem || serviceAccount) {
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
    if (accessItem || serviceAccount) {
      setSelected(getDefault());
      onCancel();
    } else {
      setSelected([]);
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
        closeOnOverlayClick={false}
        isOpen={Boolean(accessItem) || Boolean(serviceAccount) || isOpen}
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
                    readOnly={isEditing}
                    defaultValue={
                      accessItem?.requesterEmail ?? serviceAccount?.name
                    }
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
                        <WrapItem key={r.name} d="flex" flexDir="column">
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
                          <Text fontSize="sm" color="bc-component" ml={6}>
                            {permissionHelpTextLookup[r.name] ?? ''}
                          </Text>
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
                {accessItem || serviceAccount ? 'Save' : 'Share'}
              </Button>
            </ButtonGroup>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default React.memo(NamespaceAccessDialog);

const permissionHelpTextLookup = {
  'Access.Manage':
    'Can approve/reject access requests to your APIs that you make discoverable.',
  'Content.Publish': 'Can update the documentation on the portal.',
  'CredentialIssuer.Admin':
    'Can create Authorization Profiles so that they are available to be used when configuring Product Environments.',
  'GatewayConfig.Publish':
    'Can publish gateway configuration to Kong and to view the status of the upstreams.',
  'Namespace.Manage':
    'Can update the Access Control List for controlling access to viewing metrics, service configuration and service account management. This is a superuser for the gateway.',
  'Namespace.View': 'Read-only access to the gateway.',
};
