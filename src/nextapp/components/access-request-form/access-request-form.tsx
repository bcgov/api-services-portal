import * as React from 'react';
import {
  Box,
  Checkbox,
  FormHelperText,
  FormLabel,
  Input,
  Link,
  Radio,
  RadioGroup,
  Stack,
  Text,
  Textarea,
} from '@chakra-ui/react';
import { FaCommentDots, FaLayerGroup } from 'react-icons/fa';
import { RiApps2Fill } from 'react-icons/ri';
import { gql } from 'graphql-request';
import isEmpty from 'lodash/isEmpty';
import { useApi } from '@/shared/services/api';
import { uid } from 'react-uid';
import { Environment } from '@/shared/types/query.types';

import Fieldset from './access-request-fieldset';
import ApplicationSelect from './application-select';

interface AccessRequestFormProps {
  id: string;
  preview: boolean;
  onEnvironmentSelect: (value: Environment) => void;
}

const AccessRequestForm: React.FC<AccessRequestFormProps> = ({
  id,
  preview,
  onEnvironmentSelect,
}) => {
  const { data } = useApi('accessRequestForm', {
    query,
    variables: { id },
  });
  const [environment, setEnvironment] = React.useState<string>('');
  const [authMethod, setAuthMethod] = React.useState('publicKey');
  const itemList = preview
    ? data.allProductsByNamespace
    : data.allDiscoverableProducts;
  const apiTitle = itemList?.reduce((memo: string, d) => {
    if (!memo && d.id !== id) {
      return 'API';
    }
    return d.name;
  }, '');
  const dataset = itemList[0];
  const requestor = data?.allTemporaryIdentities[0];
  const selectedEnvironment: Environment = React.useMemo(() => {
    return dataset.environments.find((e) => e.id === environment);
  }, [dataset, environment]);
  const isCommentsRequired = Boolean(
    selectedEnvironment?.additionalDetailsToRequest
  );
  const clientAuthenticator =
    selectedEnvironment?.credentialIssuer?.clientAuthenticator;
  const hasNotAgreedLegal = React.useMemo(() => {
    const legalsAgreed = !isEmpty(data?.mySelf?.legalsAgreed)
      ? JSON.parse(data.mySelf.legalsAgreed)
      : [];

    if (selectedEnvironment?.legal) {
      const { reference } = selectedEnvironment?.legal;

      if (!isEmpty(reference)) {
        const legalAgreements = legalsAgreed.filter(
          (ag: { reference: string }) => ag.reference === reference
        );

        return legalAgreements.length === 0;
      }
    }

    return true;
  }, [data.mySelf, selectedEnvironment]);

  React.useEffect(() => {
    if (selectedEnvironment) {
      onEnvironmentSelect(selectedEnvironment);
    }
  }, [onEnvironmentSelect, selectedEnvironment]);

  return (
    <>
      <Fieldset isRequired icon={FaLayerGroup} label={apiTitle}>
        <ApplicationSelect />
      </Fieldset>
      <Fieldset isRequired icon={RiApps2Fill} label="API Environment">
        <RadioGroup
          name="productEnvironmentId"
          value={environment}
          onChange={setEnvironment}
        >
          <Stack direction="column">
            {dataset?.environments
              .filter((e) => e.active || preview)
              .filter((e) => e.flow !== 'public')
              .map((e) => (
                <Radio
                  key={uid(e.id)}
                  value={e.id}
                  data-testid={`access-rqst-app-env-${e.name}`}
                >
                  {e.name}
                </Radio>
              ))}
          </Stack>
        </RadioGroup>
        {clientAuthenticator === 'client-jwt-jwks-url' && (
          <Box ml={2} pl={4} borderColor="bc-component" borderLeft="1px solid">
            <RadioGroup
              name=""
              value={authMethod}
              onChange={setAuthMethod}
              my={2}
            >
              <Stack direction="column">
                <Radio
                  value="jwks"
                  data-testid={`access-rqst-app-env-jwks-url`}
                >
                  JWKS URL
                </Radio>
                {authMethod === 'jwks' && (
                  <Box ml={2} mb={4} pl={7}>
                    <FormHelperText>
                      Enter the URL where the JWKS is hosted for authentication.
                    </FormHelperText>
                    <Input
                      isRequired
                      placeholder="https://"
                      name="jwksUrl"
                      variant="bc-input"
                      type="url"
                    />
                  </Box>
                )}
                <Radio
                  value="publicKey"
                  data-testid={`access-rqst-app-env-public-key`}
                >
                  Public Key
                </Radio>
              </Stack>
            </RadioGroup>
            {authMethod === 'publicKey' && (
              <Box ml={2} mb={4} pl={6}>
                <FormHelperText>
                  Enter the public key for authentication.
                </FormHelperText>
                <Textarea
                  isRequired
                  height="64px"
                  name="clientCertificate"
                  variant="bc-input"
                />
              </Box>
            )}
          </Box>
        )}
      </Fieldset>
      {environment && (
        <Fieldset
          label={`Comments${isCommentsRequired ? '' : ' (optional)'}`}
          icon={FaCommentDots}
          isRequired={isCommentsRequired}
        >
          <Box mb={2}>
            {selectedEnvironment?.additionalDetailsToRequest && (
              <Text>
                <Text as="strong">Instructions from API Provider:</Text>{' '}
                {selectedEnvironment.additionalDetailsToRequest}
              </Text>
            )}
          </Box>
          <Textarea
            name="additionalDetails"
            data-testid="access-rqst-add-notes-text"
          />
        </Fieldset>
      )}
      {selectedEnvironment?.legal && hasNotAgreedLegal && (
        <Box mt={4} p={4} bgColor="#f2f2f2" borderRadius={4}>
          <Checkbox
            isRequired
            colorScheme="blue"
            data-testid="acceptLegalTerm"
            name="acceptLegal"
          >
            {selectedEnvironment.legal.title}
          </Checkbox>
          <Box mt={2} ml={7}>
            <Link
              fontWeight="bold"
              href={selectedEnvironment.legal.link}
              colorScheme="blue"
              target="_blank"
              rel="noreferrer"
            >
              View Legal
            </Link>
          </Box>
        </Box>
      )}

      <input
        type="hidden"
        name="name"
        value={`${dataset.name} FOR ${
          requestor.name ?? requestor.providerUsername
        }`}
      />
      <input
        type="hidden"
        name="clientAuthenticator"
        value={clientAuthenticator}
      />
      <input type="hidden" name="requestor" value={requestor?.userId} />
    </>
  );
};

export default AccessRequestForm;

const query = gql`
  query GetAccessRequestForm($id: ID!) {
    allProductsByNamespace(where: { id: $id }) {
      id
      name
      environments {
        id
        approval
        name
        active
        flow
        additionalDetailsToRequest
        legal {
          title
          description
          link
          reference
        }
        credentialIssuer {
          clientAuthenticator
        }
      }
    }
    allDiscoverableProducts(where: { id: $id }) {
      id
      name
      environments {
        id
        approval
        name
        active
        flow
        additionalDetailsToRequest
        legal {
          title
          description
          link
          reference
        }
        credentialIssuer {
          clientAuthenticator
        }
      }
    }
    myApplications {
      id
      appId
      name
      owner {
        name
      }
    }
    mySelf {
      legalsAgreed
    }
    allTemporaryIdentities {
      id
      userId
      name
      providerUsername
      email
    }
  }
`;
