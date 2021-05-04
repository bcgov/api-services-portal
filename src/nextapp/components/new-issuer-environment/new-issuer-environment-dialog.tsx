import * as React from 'react';
import api from '@/shared/services/api';
import {
  Alert,
  AlertIcon,
  Box,
  Button,
  ButtonGroup,
  FormControl,
  FormLabel,
  FormHelperText,
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
  Textarea,
  useToast,
} from '@chakra-ui/react';
import { useMutation, useQueryClient } from 'react-query';
import { gql } from 'graphql-request';

interface NewIssuerEnvironmentDialog {
  open: boolean;
  onClose: () => void;
  onCreate: (obj: any) => void;
  mode: string;
}

const NewIssuerEnvironmentDialog: React.FC<NewIssuerEnvironmentDialog> = ({
  open,
  onClose,
  onCreate,
  mode
}) => {

  const [env, setEnv] = React.useState({ issuerUrl: "", clientRegistration: "" });

  const form = React.useRef<HTMLFormElement>();
  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    addEnvironmentConfig();
  };

  const addEnvironmentConfig = async () => {
    if (form.current) {
        const data = new FormData(form.current);
        var object : any = {};
        data.forEach((value, key) => object[key] = value);
        onCreate(object)
    }
  };

  return (
    <Modal isOpen={open} onClose={onClose}>
      <ModalOverlay />
      <ModalContent borderRadius="4px">
        <ModalHeader>Add Environment Config</ModalHeader>
        <ModalBody>
          <form ref={form} onSubmit={onSubmit}>

            <Box p={4}>
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
                    </FormHelperText>
                </FormControl>


                    <FormControl
                    isRequired
                    mb={4}
                    isDisabled={false}
                    >
                        <FormLabel>idP Issuer URL</FormLabel>
                        <Input
                            placeholder="Issuer URL"
                            name="issuerUrl"
                            variant="bc-input"
                        />
                    </FormControl>

                    <FormControl as="fieldset" isRequired>
                        <FormLabel as="legend">Client Registration</FormLabel>
                        <RadioGroup defaultValue="" onChange={(e : string) => setEnv({...env, ...{clientRegistration:e}})}>
                            <Stack>
                                <Radio name="clientRegistration" value="anonymous">
                                    Anonymous
                                </Radio>
                                {mode == "auto" && <Radio name="clientRegistration" value="iat">
                                    Initial Access Token
                                </Radio>}
                                {mode == "auto" && <Radio name="clientRegistration" value="managed">
                                    Managed
                                </Radio>}
                            </Stack>
                        </RadioGroup>
                        <FormHelperText>
                        </FormHelperText>
                    </FormControl>
                    {env.clientRegistration == 'iat'  && (
                        <>
                            <FormControl
                            isRequired
                            mb={4}
                            isDisabled={false}
                            >
                                <FormLabel>Initial Acccess Token</FormLabel>
                                <Input
                                    placeholder="Initial Acccess Token"
                                    name="initialAccessToken"
                                    variant="bc-input"
                                />
                            </FormControl>
                        </>
                      )}
                    {env.clientRegistration == 'managed'  && (
                        <>
                           <FormControl
                            isRequired
                            mb={4}
                            isDisabled={false}
                            >
                                <FormLabel>Client ID</FormLabel>
                                <Input
                                    placeholder="Client ID"
                                    name="clientId"
                                    variant="bc-input"
                                />
                            </FormControl>

                            <FormControl
                            isRequired
                            mb={4}
                            isDisabled={false}
                            >
                                <FormLabel>Client Secret</FormLabel>
                                <Input
                                    placeholder="Client Secret"
                                    name="clientSecret"
                                    variant="bc-input"
                                />
                            </FormControl>                            
                        </>
                      )}
                  </Box>

          </form>
        </ModalBody>
        <ModalFooter>
          <ButtonGroup>
            <Button onClick={onClose}>Cancel</Button>
            <Button variant="primary" onClick={addEnvironmentConfig}>
              Create
            </Button>
          </ButtonGroup>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default NewIssuerEnvironmentDialog;
