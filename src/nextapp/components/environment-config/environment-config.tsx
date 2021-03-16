import * as React from 'react';
import api from '@/shared/services/api';
import {
  Box,
  Button,
  Heading,
  Select,
  Badge,
  Text,
  Switch,
  ButtonGroup,
  Icon,
  useToast,
} from '@chakra-ui/react';
// import ClientRequest from '@/components/client-request';
import { UPDATE_ENVIRONMENT } from '@/shared/queries/products-queries';
import {
  Environment,
  EnvironmentFlowType,
  EnvironmentUpdateInput,
} from '@/types/query.types';
import { useMutation, useQueryClient } from 'react-query';
import { FaExclamationTriangle } from 'react-icons/fa';
import CredentialIssuerSelect from './credential-issuer-select';

interface EnvironmentConfigProps {
  data: Environment;
}

const EnvironmentConfig: React.FC<EnvironmentConfigProps> = ({ data = {} }) => {
  const toast = useToast();
  const [hasChanged, setChanged] = React.useState<boolean>(false);
  const [flow, setFlow] = React.useState<EnvironmentFlowType>(
    data.flow
  );
  const statusText = data.active ? 'Running' : 'Idle';
  const statusBoxColorScheme = data.active ? 'green' : 'orange';

  // Updates
  const client = useQueryClient();
  const mutation = useMutation(
    async (changes: unknown) => await api(UPDATE_ENVIRONMENT, changes, true)
  );

  // Events
  const onChange = React.useCallback(() => {
    if (!hasChanged) {
      setChanged(true);
    }
  }, [hasChanged, setChanged]);
  const onSubmit = async (event: React.ChangeEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const payload: EnvironmentUpdateInput = {
      active: Boolean(formData.get('active')),
      flow: formData.get('flow') as EnvironmentFlowType,
    };

    if (formData.has('credentialIssuer')) {
      payload.credentialIssuer = {
        connect: { id: formData.get('credentialIssuer') as string },
      };
    }

    try {
      await mutation.mutateAsync({
        id: data.id,
        data: payload,
      });
      client.invalidateQueries(['environment', data.id]);
    } catch (err) {
      toast({
        title: 'Environment Update Failed',
        description: err.map((e: Error) => e.message).join(', '),
        isClosable: true,
        status: 'error',
      });
    }
  };
  const onAuthChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setFlow(event.target.value as EnvironmentFlowType);
  };
  const onReset = React.useCallback(() => {
    if (flow !== data.flow) {
      setFlow(data.flow);
    }
    setChanged(false);
  }, [flow, data, setFlow, setChanged]);

  const flowTypes = [
    { value: 'public', label: 'Public'},
    { value: 'authorization-code', label: 'Oauth2 Authorization Code Flow'},
    { value: 'client-credentials', label: 'Oauth2 Client Credentials Flow'},
    { value: 'kong-api-key-acl', label: 'Kong API Key with ACL Flow'},
  ]

  return (
    <form onChange={onChange} onSubmit={onSubmit} onReset={onReset}>
      <Box
        bgColor="white"
        mt={8}
        p={4}
        display="flex"
        border="2px solid"
        borderColor={data.active ? 'green.500' : 'orange.500'}
        borderRadius={4}
        overflow="hidden"
      >
        <Box display="flex">
          <Switch
            defaultIsChecked={data.active}
            id="active"
            name="active"
            value="active"
          />
        </Box>
        <Box flex={1} ml={5} display="flex" flexDirection="column">
          <Heading
            size="sm"
            mb={2}
            color="inherit"
            display="flex"
            alignItems="center"
          >
            {data?.product.organization?.name}{' '}
            <Badge
              px={2}
              mx={1}
              colorScheme="blue"
              variant="solid"
              fontSize="inherit"
            >
              {data.name}
            </Badge>{' '}
            Environment is{' '}
            <Badge
              colorScheme={statusBoxColorScheme}
              px={2}
              mx={1}
              variant="solid"
              fontSize="inherit"
            >
              {statusText}
            </Badge>
            {mutation.isError && (
              <Box color="red" display="flex" alignItems="center" ml={8}>
                <Icon as={FaExclamationTriangle} mr={2} />
                <Text>Error updating environment</Text>
              </Box>
            )}
          </Heading>
          <Box>
            <Text mb={4}>
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Eius a
              facere velit ullam ea! Minima, nemo voluptatibus, expedita, libero
              quae itaque eos qui sapiente commodi repudiandae provident
              laboriosam odio voluptates.
            </Text>
            <Box display="flex" alignItems="center">
              <Text fontWeight="bold" mr={4}>
                Authentication
              </Text>
              <Select
                size="sm"
                variant="filled"
                width="auto"
                id="flow"
                name="flow"
                value={flow}
                onChange={onAuthChange}
              >
                {flowTypes.map(f => (<option value={f.value}>{f.label}</option>))}
              </Select>
              {flow === 'client-credentials' && (
                <CredentialIssuerSelect environmentId={data.id} />
              )}
              <Box flex={1} />
              <Box>
                <ButtonGroup size="sm">
                  <Button type="reset" isDisabled={mutation.isLoading}>
                    Cancel
                  </Button>
                  <Button
                    isDisabled={!hasChanged}
                    isLoading={mutation.isLoading}
                    type="submit"
                    variant="primary"
                  >
                    Apply Changes
                  </Button>
                </ButtonGroup>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    </form>
  );
};

export default EnvironmentConfig;
