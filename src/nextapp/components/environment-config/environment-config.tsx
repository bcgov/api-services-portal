import * as React from 'react';
import api from '@/shared/services/api';
import {
  Box,
  Button,
  Checkbox,
  Heading,
  Select,
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
// import ClientRequest from '@/components/client-request';
import { UPDATE_ENVIRONMENT } from '@/shared/queries/products-queries';
import { Environment, EnvironmentUpdateInput } from '@/types/query.types';
import { useMutation, useQueryClient } from 'react-query';
import { FaCircle } from 'react-icons/fa';
import CredentialIssuerSelect from './credential-issuer-select';
import LegalSelect from './legal-select';

interface EnvironmentConfigProps {
  data: Environment;
}

const EnvironmentConfig: React.FC<EnvironmentConfigProps> = ({ data = {} }) => {
  const toast = useToast();
  const [hasChanged, setChanged] = React.useState<boolean>(false);
  const [flow, setFlow] = React.useState<string>(data.flow);
  const [credentialIssuer, setCredentialIssuer] = React.useState(
    data.credentialIssuer?.id ?? ''
  );
  const [isEditing, setEditing] = React.useState<boolean>(false);

  const handleToggleEditing = React.useCallback(() => {
    setEditing((state) => !state);
  }, [setEditing]);

  // Updates
  const client = useQueryClient();
  const mutation = useMutation(
    async (changes: unknown) =>
      await api(UPDATE_ENVIRONMENT, changes, { ssr: false })
  );

  // Events
  const handleCredentialIssuerChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setCredentialIssuer(event.target.value);
  };
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
      flow: formData.get('flow') as string,
      approval: Boolean(formData.get('approval')) as boolean,
      additionalDetailsToRequest: formData.get(
        'additionalDetailsToRequest'
      ) as string,
    };

    ['credentialIssuer', 'legal'].map((fieldName: string) => {
      if (formData.has(fieldName) && formData.get(fieldName) != '') {
        payload[fieldName] = {
          connect: { id: formData.get(fieldName) as string },
        };
      } else {
        payload[fieldName] = { disconnectAll: true };
      }
    });

    try {
      await mutation.mutateAsync({
        id: data.id,
        data: payload,
      });
      client.invalidateQueries(['environment', data.id]);
      toast({
        title: 'Environment updated',
        status: 'success',
        isClosable: true,
      });
      setEditing(false);
    } catch (err) {
      toast({
        title: 'Environment update failed',
        description: err,
        isClosable: true,
        status: 'error',
      });
    }
  };
  const onAuthChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setFlow(event.target.value as string);
  };
  const onReset = React.useCallback(() => {
    if (flow !== data.flow) {
      setFlow(data.flow);
    }
    setChanged(false);
    setEditing(false);
  }, [flow, data, setFlow, setChanged]);

  const flowTypeText = flowTypes.reduce((memo: string, flow) => {
    if (flow.value === data.flow) {
      return flow.label;
    }
    return memo;
  }, '-');

  return (
    <>
      <Box
        bgColor="white"
        border="2px solid"
        borderColor="gray.300"
        borderRadius={4}
      >
        <Flex as="header" p={4} justify="space-between" align="center">
          <Heading size="md">
            <Box as="span">
              <Tooltip
                label={data.active ? 'Active' : 'Inactive'}
                aria-label={data.active ? 'Active icon' : 'Inactive icon'}
              >
                <Icon
                  as={FaCircle}
                  color={data.active ? 'green.500' : 'yellow.400'}
                  boxSize={3}
                  mr={2}
                />
              </Tooltip>
            </Box>
            {`${data.name} Environment Configuration`}
          </Heading>
          {!isEditing && (
            <Button
              size="sm"
              variant="outline"
              colorScheme="bc-blue"
              onClick={handleToggleEditing}
              data-testid="prd-env-config-edit-btn"
            >
              Edit
            </Button>
          )}
        </Flex>
        <Divider />
        <Box p={4}>
          {!isEditing && (
            <>
              <Heading size="sm">Authentication Flow</Heading>
              <Text mb={4}>{flowTypeText}</Text>
              {data.additionalDetailsToRequest && (
                <>
                  <Heading size="sm">Additional Details to Requester</Heading>
                  <Text>{data.additionalDetailsToRequest}</Text>
                </>
              )}
            </>
          )}
          {isEditing && (
            <form onChange={onChange} onSubmit={onSubmit} onReset={onReset}>
              <Box
                bgColor={data.active ? 'green.50' : 'yellow.50'}
                px={4}
                py={2}
                mb={4}
                borderRadius={4}
              >
                <FormControl display="flex" alignItems="center">
                  <FormLabel htmlFor="active" mb={1}>
                    {data.active ? 'Environment Enabled' : 'Environment Idle'}
                  </FormLabel>
                  <Switch
                    defaultIsChecked={data.active}
                    id="active"
                    name="active"
                    value="active"
                    data-testid="prd-env-config-activate-radio"
                  />
                </FormControl>
              </Box>
              <Grid gap={8} templateColumns="1fr 1fr">
                <GridItem>
                  <FormControl mb={4}>
                    <Checkbox
                      name="approval"
                      value="true"
                      defaultIsChecked={data.approval}
                      data-testid="prd-env-config-approval-checkbox"
                    >
                      Approval Required?
                    </Checkbox>
                  </FormControl>

                  <FormControl mb={4}>
                    <FormLabel htmlFor="legal">Terms of Use</FormLabel>
                    <Grid gap={4} templateColumns="1fr 1fr">
                      <GridItem>
                        <LegalSelect value={data.legal?.id} />
                      </GridItem>
                    </Grid>
                  </FormControl>

                  <FormControl>
                    <FormLabel htmlFor="flow">Authorization</FormLabel>
                    <Grid gap={4} templateColumns="1fr 1fr">
                      <GridItem>
                        <Select
                          size="sm"
                          variant="bc-input"
                          width="auto"
                          id="flow"
                          name="flow"
                          value={flow}
                          onChange={onAuthChange}
                          data-testid="prd-env-config-authz-dd"
                        >
                          {flowTypes.map((f) => (
                            <option key={f.value} value={f.value}>
                              {f.label}
                            </option>
                          ))}
                        </Select>
                      </GridItem>
                      {(flow === 'client-credentials' ||
                        flow === 'authorization-code') && (
                        <GridItem>
                          <CredentialIssuerSelect
                            value={credentialIssuer}
                            flow={flow}
                            onChange={handleCredentialIssuerChange}
                            data-testid="prd-env-auth-issuer-select"
                          />
                        </GridItem>
                      )}
                    </Grid>
                  </FormControl>
                </GridItem>
                <GridItem>
                  <FormControl>
                    <FormLabel htmlFor="additionalDetailsToRequest">
                      Optional Instructions for Requester
                    </FormLabel>
                    <Textarea
                      size="sm"
                      defaultValue={data.additionalDetailsToRequest}
                      variant="bc-input"
                      name="additionalDetailsToRequest"
                      data-testid="prd-env-config-optional-text"
                    />
                  </FormControl>
                </GridItem>
              </Grid>
              <Flex justify="flex-end" mt={4}>
                <ButtonGroup size="sm">
                  <Button
                    variant="secondary"
                    type="reset"
                    isDisabled={mutation.isLoading}
                    data-testid="prd-env-config-cancel-btn"
                  >
                    Cancel
                  </Button>
                  <Button
                    isDisabled={!hasChanged}
                    isLoading={mutation.isLoading}
                    type="submit"
                    data-testid="prd-env-config-apply-btn"
                  >
                    Apply Changes
                  </Button>
                </ButtonGroup>
              </Flex>
            </form>
          )}
        </Box>
      </Box>
    </>
  );
};

export default EnvironmentConfig;

const flowTypes: { value: string; label: string }[] = [
  { value: 'public', label: 'Public' },
  { value: 'authorization-code', label: 'Oauth2 Authorization Code Flow' },
  { value: 'client-credentials', label: 'Oauth2 Client Credentials Flow' },
  { value: 'kong-acl-only', label: 'Kong ACL Only' },
  { value: 'kong-api-key-only', label: 'Kong API Key Only' },
  { value: 'kong-api-key-acl', label: 'Kong API Key with ACL Flow' },
];
