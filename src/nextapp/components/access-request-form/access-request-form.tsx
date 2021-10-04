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
import { FaComments, FaNetworkWired, FaWindowMaximize } from 'react-icons/fa';
import { gql } from 'graphql-request';
import isEmpty from 'lodash/isEmpty';
import { useApi } from '@/shared/services/api';
import { uid } from 'react-uid';
import { Environment } from '@/shared/types/query.types';

import Fieldset from './access-request-fieldset';
import ApplicationSelect from './application-select';

interface AccessRequestFormProps {
  id: string;
}

const AccessRequestForm: React.FC<AccessRequestFormProps> = ({ id }) => {
  const { data } = useApi('accessRequestForm', { query, variables: { id } });
  const [environment, setEnvironment] = React.useState<string>('');
  const apiTitle = data.allDiscoverableProducts?.reduce((memo: string, d) => {
    if (!memo && d.id !== id) {
      return 'API';
    }
    return d.name;
  }, '');
  const dataset = data?.allDiscoverableProducts[0];
  const requestor = data?.allTemporaryIdentities[0];
  const selectedEnvironment: Environment = dataset.environments.find(
    (e) => e.id === environment
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

  return (
    <>
      <Fieldset isRequired icon={FaWindowMaximize} label={apiTitle}>
        <ApplicationSelect />
      </Fieldset>
      <Fieldset isRequired icon={FaNetworkWired} label="API Environment">
        <RadioGroup
          name="productEnvironmentId"
          value={environment}
          onChange={setEnvironment}
        >
          <Stack direction="column">
            {dataset?.environments
              .filter((e) => e.active)
              .filter((e) => e.flow !== 'public')
              .map((e) => (
                <Radio key={uid(e.id)} value={e.id}>
                  {e.name}
                </Radio>
              ))}
          </Stack>
        </RadioGroup>
        {clientAuthenticator === 'client-jwt-jwks-url' && (
          <Box ml={2} pl={4} borderColor="bc-component" borderLeft="1px solid">
            <FormLabel>Public Key URL</FormLabel>
            <FormHelperText>
              A URL to a JWKS formatted document for signed JWT authentication
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
      </Fieldset>
      {environment && (
        <Fieldset label="Comments" icon={FaComments}>
          <Box mb={2}>
            {selectedEnvironment?.additionalDetailsToRequest && (
              <Text>
                <Text as="strong">Instructions from API Provider:</Text>{' '}
                {selectedEnvironment.additionalDetailsToRequest}
              </Text>
            )}
          </Box>
          <Textarea name="additionalDetails" />
        </Fieldset>
      )}
      {selectedEnvironment?.legal && hasNotAgreedLegal && (
        <Box mt={4} p={4} bgColor="#f2f2f2" borderRadius={4}>
          <Checkbox colorScheme="blue" name="acceptLegal">
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
        value={`${dataset.name} FOR ${requestor.name ?? requestor.username}`}
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
  query Get($id: ID!) {
    allDiscoverableProducts(where: { id: $id }) {
      id
      name
      environments {
        id
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
      username
      email
    }
  }
`;
