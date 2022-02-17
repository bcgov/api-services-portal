import * as React from 'react';
import { FaKey } from 'react-icons/fa';
import {
  Box,
  Button,
  Checkbox,
  Heading,
  Select,
  Input,
  Text,
  Textarea,
  Switch,
  ButtonGroup,
  Icon,
  useToast,
  Flex,
  Divider,
  Tooltip,
  FormControl,
  FormLabel,
  Grid,
  GridItem,
} from '@chakra-ui/react';
import {
  Environment,
  EnvironmentUpdateInput,
  Mutation,
} from '@/types/query.types';
import api, { useApiMutation } from '@/shared/services/api';
import { UPDATE_ENVIRONMENT_CALLBACK_URL } from '@/shared/queries/products-queries';
import { useMutation, UseMutationResult, useQueryClient } from 'react-query';

import ViewSecret from '../view-secret';

interface AuthCodeClientConfigProps {
  data: Environment;
}

const AuthCodeClientConfig: React.FC<AuthCodeClientConfigProps> = ({
  data: { id, flow, callbackUrl },
}) => {
  const clientId = '1';
  const clientSecret = '2';
  const issuer = '';

  const toast = useToast();
  const [hasChanged, setChanged] = React.useState<boolean>(false);
  const [isEditing, setEditing] = React.useState<boolean>(false);
  const [credentials, showCredentials] = React.useState<string>('');

  // Updates
  const mutation: UseMutationResult = useMutation(
    async (changes: unknown) =>
      await api(UPDATE_ENVIRONMENT_CALLBACK_URL, changes, { ssr: false })
  );

  const onSubmit = async (event: React.ChangeEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.target);

    try {
      const response: Mutation = await mutation.mutateAsync({
        id,
        callbackUrl: formData.get('callbackUrl') as string,
      });

      toast({
        title: 'Application Settings Updated',
        status: 'success',
      });
      setEditing(false);
      showCredentials(
        response.updateEnvironmentClient.credentials
          ? response.updateEnvironmentClient.credentials
          : ''
      );
    } catch (err) {
      console.log(err);
      toast({
        title: 'Environment Update Failed',
        description: err
          .map((e) =>
            e.data?.messages ? e.data.messages.join(',') : e.message
          )
          .join(', '),
        isClosable: true,
        status: 'error',
      });
    }
  };

  return (
    flow === 'authorization-code' && (
      <Box my={4} bgColor="white">
        <Flex as="header" p={4} align="center">
          <Icon as={FaKey} color="bc-link" mr={2} boxSize={5} />
          <Heading size="md">Application Settings</Heading>
        </Flex>
        <Divider />
        <form onSubmit={onSubmit}>
          <Box p={4}>
            <Text fontSize="sm">
              Settings for the Oauth2 Authorization Code Flow
            </Text>
          </Box>
          <Box p={4}>
            <FormControl>
              <FormLabel>
                Callback URL of your Application from the Identity Provider
              </FormLabel>
              <Input
                placeholder="https://"
                name="callbackUrl"
                variant="bc-input"
                defaultValue={callbackUrl}
              />
            </FormControl>
          </Box>
          <Box p={4} bg="white">
            <Flex justify="flex-end" mt={4}>
              <ButtonGroup size="sm">
                <Button
                  type="submit"
                  variant="secondary"
                  data-testid="prd-env-authcode-gencreds-btn"
                >
                  Generate Credentials
                </Button>
              </ButtonGroup>
            </Flex>
          </Box>
          <Box p={4} bg="white">
            {credentials && (
              <ViewSecret credentials={JSON.parse(credentials)} />
            )}
          </Box>
        </form>
      </Box>
    )
  );
};

export default AuthCodeClientConfig;
