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
  VStack,
} from '@chakra-ui/react';

interface AuthenticationFormProps {
  onCancel: () => void;
  onComplete: (value: FormData) => void;
}

const AuthenticationForm: React.FC<AuthenticationFormProps> = ({
  onCancel,
  onComplete,
}) => {
  const form = React.useRef<HTMLFormElement>(null);
  const [value, setValue] = React.useState<string>(
    'client-credentials.client-secret'
  );

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
          <FormControl isRequired mb={8}>
            <FormLabel>Profile Name</FormLabel>
            <RadioGroup value={value} onChange={setValue}>
              <VStack align="stretch" spacing={2}>
                <Radio name="flow" value="client-credentials.client-secret">
                  Client Credential Flow, using Client ID and Secret
                </Radio>
                <Radio name="flow" value="client-credentials.client-jwt">
                  Client Credential Flow, using signed JWT with Generated Key
                  Pair
                </Radio>
                <Radio
                  name="flow"
                  value="client-credentials.client-jwt-jwks-url"
                >
                  Client Credential Flow, using signed JWT with JWKS URL
                </Radio>
                <Radio name="flow" value="kong-api-key-acl">
                  Kong API Key
                </Radio>
              </VStack>
            </RadioGroup>
          </FormControl>
          {value === 'kong-api-key-acl' && (
            <FormControl
              ml={2}
              pl={5}
              width="50%"
              borderLeft="1px solid"
              borderColor="bc-component"
            >
              <FormLabel>Key Name</FormLabel>
              <Input name="apiKeyName" placeholder="X-API-KEY" />
            </FormControl>
          )}
        </form>
      </ModalBody>
      <ModalFooter>
        <ButtonGroup>
          <Button onClick={onCancel} variant="secondary">
            Cancel
          </Button>
          <Button onClick={handleCreate}>Continue</Button>
        </ButtonGroup>
      </ModalFooter>
    </>
  );
};

export default AuthenticationForm;
