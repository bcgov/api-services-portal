import * as React from 'react';
import {
  Button,
  ButtonGroup,
  FormControl,
  FormLabel,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  RadioGroup,
  Radio,
  Stack,
  useDisclosure,
  Grid,
  GridItem,
} from '@chakra-ui/react';
import { gql } from 'graphql-request';

import { EnvironmentItem } from './types';

interface NewClientProps {
  onCreate: (payload: EnvironmentItem) => void;
  mode: string;
}

const NewClient: React.FC<NewClientProps> = ({ onCreate, mode }) => {
  const form = React.useRef<HTMLFormElement>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [clientRegistration, setClientRegistration] = React.useState<
    string | number
  >('');

  const createClient = React.useCallback(() => {
    const data = new FormData(form.current);
    const payload = {};
    for (const [key, value] of data) {
      payload[key] = value;
    }
    onCreate(payload as EnvironmentItem);
    onClose();
  }, [onClose, onCreate]);
  const handleSubmit = React.useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      event.stopPropagation();
      createClient();
    },
    [createClient]
  );
  const submitForm = React.useCallback(() => form.current?.requestSubmit(), []);

  return (
    <>
      <Button isDisabled={false} onClick={onOpen} variant="primary" data-testid="ap-client-mgmt-add-env-btn">
        Add Environment
      </Button>
      <Modal isOpen={isOpen} onClose={onClose} size="2xl">
        <ModalOverlay />
        <ModalContent borderRadius="4px">
          <ModalHeader>Add Environment Config</ModalHeader>
          <ModalBody>
            <form ref={form} onSubmit={handleSubmit}>
              <Grid gap={4} templateColumns="35% 1fr" p={4}>
                <GridItem>
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
                  </FormControl>
                </GridItem>
                <GridItem>
                  <FormControl isRequired mb={4} isDisabled={false}>
                    <FormLabel>idP Issuer URL</FormLabel>
                    <Input
                      placeholder="Issuer URL"
                      name="issuerUrl"
                      type="url"
                      variant="bc-input"
                      data-testid="ap-env-idp-url"
                    />
                  </FormControl>
                </GridItem>
                <GridItem>
                  <FormControl isRequired as="fieldset">
                    <FormLabel as="legend">Client Registration</FormLabel>
                    <RadioGroup onChange={setClientRegistration}>
                      <Stack>
                        <Radio name="clientRegistration" value="anonymous">
                          Anonymous
                        </Radio>
                        {mode === 'auto' && (
                          <>
                            <Radio name="clientRegistration" value="iat">
                              Initial Access Token
                            </Radio>
                            <Radio name="clientRegistration" value="managed">
                              Managed
                            </Radio>
                          </>
                        )}
                      </Stack>
                    </RadioGroup>
                  </FormControl>
                </GridItem>

                <GridItem>
                  {clientRegistration === 'iat' && (
                    <>
                      <FormControl isRequired mb={4}>
                        <FormLabel>Initial Acccess Token</FormLabel>
                        <Input
                          placeholder="Initial Acccess Token"
                          name="initialAccessToken"
                          variant="bc-input"
                          data-testid="ap-env-init-token"
                        />
                      </FormControl>
                    </>
                  )}
                  {clientRegistration === 'managed' && (
                    <>
                      <FormControl isRequired mb={4}>
                        <FormLabel>Client ID</FormLabel>
                        <Input
                          placeholder="Client ID"
                          name="clientId"
                          variant="bc-input"
                          data-testid="ap-env-client-id"
                        />
                      </FormControl>

                      <FormControl isRequired mb={4}>
                        <FormLabel>Client Secret</FormLabel>
                        <Input
                          placeholder="Client Secret"
                          name="clientSecret"
                          variant="bc-input"
                          data-testid="ap-env-client-secret"
                        />
                      </FormControl>
                    </>
                  )}
                </GridItem>
              </Grid>
            </form>
          </ModalBody>
          <ModalFooter>
            <ButtonGroup>
              <Button variant="secondary" onClick={onClose}>
                Cancel
              </Button>
              <Button variant="primary" onClick={submitForm} data-testid="ap-env-add-btn">
                Add
              </Button>
            </ButtonGroup>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default NewClient;

const mutation = gql`
  mutation CreateAuthzProfile($data: CredentialIssuerCreateInput!) {
    createCredentialIssuer(data: $data) {
      id
    }
  }
`;
