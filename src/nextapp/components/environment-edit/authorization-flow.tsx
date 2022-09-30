import * as React from 'react';
import {
  Checkbox,
  Flex,
  FormControl,
  FormLabel,
  Grid,
  GridItem,
  Select,
  Textarea,
} from '@chakra-ui/react';
import { uid } from 'react-uid';
import CredentialIssuerSelect from '../environment-config/credential-issuer-select';
import { Environment } from '@/shared/types/query.types';
import LegalSelect from '../environment-config/legal-select';

interface AuthorizationFlowProps {
  environment: Environment;
  flow: string;
  onFlowChange: (flow: string) => void;
}

const AuthorizationFlow: React.FC<AuthorizationFlowProps> = ({
  environment,
  flow,
  onFlowChange,
}) => {
  const handleFlowChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    onFlowChange(event.target.value);
  };

  return (
    <Grid templateColumns="1fr 1fr" gap={8}>
      <GridItem>
        <FormControl isRequired>
          <FormLabel>Authorization</FormLabel>
          <Select
            name="flow"
            value={flow}
            onChange={handleFlowChange}
            data-testid="edit-env-auth-flow-select"
          >
            {flowTypes.map((f) => (
              <option key={uid(f)} value={f.value}>
                {f.label}
              </option>
            ))}
          </Select>
        </FormControl>
      </GridItem>
      <GridItem>
        <FormControl
          isRequired={/(client-credentials|authorization-code)/.test(flow)}
        >
          <FormLabel>Issuer</FormLabel>
          <CredentialIssuerSelect
            flow={flow}
            value={environment.credentialIssuer?.id}
            data-testid="prd-env-auth-issuer-select"
          />
        </FormControl>
      </GridItem>
      <GridItem colSpan={2}>
        <FormControl>
          <FormLabel>Instructions for Requester (Optional)</FormLabel>
          <Textarea
            name="additionalDetailsToRequest"
            defaultValue={environment.additionalDetailsToRequest}
            data-testid="edit-env-additional-details-textarea"
          ></Textarea>
        </FormControl>
      </GridItem>
      <GridItem>
        <FormControl>
          <FormLabel>Terms of Use</FormLabel>
          <LegalSelect value={environment.legal?.id} />
        </FormControl>
      </GridItem>
      <GridItem>
        <Flex align="center" justify="space-between" pt={10}>
          <Checkbox
            defaultChecked={environment.approval}
            name="approval"
            value="true"
            data-testid="edit-env-approval-checkbox"
          >
            Require Approval
          </Checkbox>
          <Checkbox
            defaultChecked={environment.active}
            name="active"
            value="true"
            data-testid="edit-env-active-checkbox"
          >
            Enable Environment
          </Checkbox>
        </Flex>
      </GridItem>
    </Grid>
  );
};

export default AuthorizationFlow;

const flowTypes: { value: string; label: string }[] = [
  { value: 'public', label: 'Public' },
  { value: 'authorization-code', label: 'Oauth2 Authorization Code Flow' },
  { value: 'client-credentials', label: 'Oauth2 Client Credentials Flow' },
  { value: 'kong-acl-only', label: 'Kong ACL Only' },
  { value: 'kong-api-key-only', label: 'Kong API Key Only' },
  { value: 'kong-api-key-acl', label: 'Kong API Key with ACL Flow' },
];