import * as React from 'react';
import {
  Button,
  ButtonGroup,
  FormControl,
  FormLabel,
  Input,
  ModalBody,
  ModalFooter,
  Radio,
  RadioGroup,
  Text,
  VStack,
} from '@chakra-ui/react';

interface AuthenticationFormProps {
  id?: string;
  onChange: (value: string) => void;
  onCancel: () => void;
  onComplete: (value: FormData) => void;
  value: string;
}

const AuthenticationForm: React.FC<AuthenticationFormProps> = ({
  id,
  onChange,
  onCancel,
  onComplete,
  value,
}) => {
  const form = React.useRef<HTMLFormElement>(null);
  const isKong = value === 'kong-api-key-acl';
  const createText = isKong ? 'Create' : 'Continue';
  const submitButtonText = id ? 'Save' : createText;

  // Events
  const handleCreate = () => {
    form.current?.requestSubmit();
  };
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    onComplete(data);
  };

  return (
    <>
      <ModalBody>
        <form ref={form} onSubmit={handleSubmit}>
          <FormControl isRequired mb={4}>
            <FormLabel fontWeight="bold" mb={6}>
              Flow
            </FormLabel>
            <RadioGroup
              value={value}
              onChange={onChange}
              data-testid="ap-flow-select"
            >
              <VStack align="stretch" spacing={2}>
                <Radio
                  name="flow"
                  data-testid="cc-id-secret-chkBox"
                  value="client-credentials.client-secret"
                >
                  Client Credential Flow, using Client ID and Secret
                </Radio>
                <Radio
                  name="flow"
                  data-testid="cc-jwt-key-chkBox"
                  value="client-credentials.client-jwt"
                >
                  Client Credential Flow, using signed JWT with Generated Key
                  Pair
                </Radio>
                <Radio
                  name="flow"
                  value="client-credentials.client-jwt-jwks-url"
                  data-testid="cc-jwt-jwks-chkBox"
                >
                  Client Credential Flow, using signed JWT with JWKS URL
                </Radio>
              </VStack>
            </RadioGroup>
          </FormControl>
        </form>
        <Text color="bc-component" fontSize="sm">
          <Text as="span" fontWeight="bold">
            client-credentials
          </Text>{' '}
          implements the OAuth2 Client Credential Flow
          <br />
          <Text as="span" fontWeight="bold">
            authorization-code
          </Text>{' '}
          implements the OAuth2 Authorization Code Flow
        </Text>
      </ModalBody>
      <ModalFooter>
        <ButtonGroup>
          <Button
            onClick={onCancel}
            variant="secondary"
            data-testid="ap-authentication-form-cancel-btn"
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreate}
            data-testid="ap-authentication-form-continue-btn"
          >
            {submitButtonText}
          </Button>
        </ButtonGroup>
      </ModalFooter>
    </>
  );
};

export default AuthenticationForm;
