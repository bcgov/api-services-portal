import * as React from 'react';
import {
  Button,
  Checkbox,
  Flex,
  FormControl,
  FormLabel,
  Grid,
  GridItem,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Select,
  Textarea,
  useDisclosure,
  Tooltip,
  Box,
} from '@chakra-ui/react';
import { uid } from 'react-uid';
import CredentialIssuerSelect from '../environment-config/credential-issuer-select';
import { Environment } from '@/shared/types/query.types';
import LegalSelect from '../environment-config/legal-select';
import EnvironmentPlugins from '../environment-plugins';
import useCurrentNamespace from '@/shared/hooks/use-current-namespace';

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
  const { isOpen, onClose, onOpen } = useDisclosure();
  const [credentialIssuer, setCredentialIssuer] = React.useState(
    environment.credentialIssuer?.id ?? ''
  );
  const handleFlowChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    onFlowChange(event.target.value);
  };
  const isPluginButtonDisabled = React.useMemo(() => {
    if (flow === 'client-credentials' || flow === 'authorization-code') {
      return !credentialIssuer;
    }
    return flow === 'public' || flow === 'protected-externally';
  }, [flow, credentialIssuer]);
  const { data, isSuccess } = useCurrentNamespace();

  const handleCredentialIssuerChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setCredentialIssuer(event.target.value);
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        scrollBehavior="inside"
        size="2xl"
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Plugin Template</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <EnvironmentPlugins
              environment={environment}
              flow={flow}
              selectedIssuer={credentialIssuer}
            />
          </ModalBody>
          <ModalFooter>
            <Button onClick={onClose}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
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
          <FormControl isRequired={flow === 'client-credentials'}>
            <FormLabel>Issuer</FormLabel>
            <CredentialIssuerSelect
              flow={flow}
              onChange={handleCredentialIssuerChange}
              value={credentialIssuer}
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
          <Flex align="center" gridGap={10} pt={10}>
            <Checkbox
              defaultChecked={environment.approval}
              name="approval"
              value="true"
              data-testid="edit-env-approval-checkbox"
            >
              Require Approval
            </Checkbox>
            <Tooltip
              hasArrow
              isDisabled={Boolean(data?.currentNamespace.org)}
              label="Available after an Organization has been associated with your Gateway."
            >
              <Box>
                <Checkbox
                  defaultChecked={environment.active}
                  isDisabled={!isSuccess || !data?.currentNamespace.org}
                  name="active"
                  value="true"
                  data-testid="edit-env-active-checkbox"
                >
                  Enable Environment
                </Checkbox>
              </Box>
            </Tooltip>
          </Flex>
        </GridItem>
        <GridItem>
          <Button
            isDisabled={isPluginButtonDisabled}
            color="bc-blue"
            variant="link"
            onClick={onOpen}
            data-testid="edit-env-view-plugin-template-btn"
          >
            View Plugin Template
          </Button>
        </GridItem>
      </Grid>
    </>
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
  { value: 'protected-externally', label: 'Protected Externally' },
];
