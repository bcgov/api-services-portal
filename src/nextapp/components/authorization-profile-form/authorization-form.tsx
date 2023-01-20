import * as React from 'react';
import {
  Button,
  ButtonGroup,
  Grid,
  GridItem,
  Heading,
  Input,
  ModalBody,
  ModalFooter,
  Text,
} from '@chakra-ui/react';
import TagInput from '@/components/tag-input';
import RadioCardGroup from '@/components/radio-card-group';
import { CredentialIssuer } from '@/shared/types/query.types';

interface AuthorizationFormProps {
  data?: CredentialIssuer;
  hidden: boolean;
  id?: string;
  onCancel: () => void;
  onComplete: (payload: FormData) => void;
  ownerName: string;
}

const AuthorizationForm: React.FC<AuthorizationFormProps> = ({
  data,
  hidden,
  id,
  onCancel,
  onComplete,
  ownerName,
}) => {
  const formRef = React.useRef<HTMLFormElement>(null);
  const submitButtonText = id ? 'Save' : 'Continue';
  const cancelButtonText = id ? 'Close' : 'Cancel';
  const parseClientMappers = (value = '') => {
    try {
      const config = JSON.parse(value);
      return config[0]?.defaultValue;
    } catch {
      return value;
    }
  };

  // Events
  const handleSubmit = React.useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      if (formRef?.current.checkValidity()) {
        const formData = new FormData(formRef.current);
        const clientMappers = formData.get('clientMappers');
        formData.set(
          'clientMappers',
          JSON.stringify([{ name: 'audience', defaultValue: clientMappers }])
        );
        onComplete(formData);
      }
    },
    [onComplete]
  );
  const handleCreate = React.useCallback(() => {
    formRef?.current.requestSubmit();
  }, []);

  function Legend({ children }: { children: React.ReactNode }) {
    return (
      <Heading as="legend" size="sm" fontWeight="normal" mb={2}>
        {children}
      </Heading>
    );
  }

  return (
    <>
      <ModalBody
        className="authProfileFormContainer"
        hidden={hidden}
        sx={{
          '& fieldset': { mb: 8 },
          '& fieldset legend + div': { mt: 1 },
          '& fieldset p': {
            mb: 3,
          },
        }}
      >
        <form ref={formRef} onSubmit={handleSubmit}>
          <fieldset>
            <Legend>Mode</Legend>
            <RadioCardGroup
              isRequired
              name="mode"
              defaultValue={data?.mode ?? 'auto'}
              data-testid="ap-mode"
              options={[
                {
                  title: 'Automatic',
                  description: `Automatic issuing of the credential means that this owner (${ownerName}) has configured appropriate credentials here to allow the API Manager to manage Clients on the particular OIDC Provider.`,
                  value: 'auto',
                },
                {
                  title: 'Manual',
                  description: `Manual issuing of the credential means that this owner (${ownerName}) will complete setup of the new credential with the particular OIDC Provider, and communicate that to the requestor via email or other means.`,
                  value: 'manual',
                },
              ]}
            />
          </fieldset>
          <fieldset>
            <Legend>Client Scopes (optional)</Legend>
            <Text fontSize="sm" color="bc-component">
              If your APIs are protected by Scope, then provide the full list of
              Scopes setup in the IdP.
            </Text>
            <TagInput
              placeholder="Press Enter to add Scopes"
              name="availableScopes"
              value={data?.availableScopes}
              data-testid="ap-authorization-scopes"
            />
          </fieldset>
          <fieldset>
            <Legend>Client Roles (optional)</Legend>
            <Text fontSize="sm" color="bc-component">
              If your APIs are protected by Roles, provide the full list of
              Client Roles that will be used to manage access to the APIs that
              are protected with this Authorization configuration.
            </Text>
            <TagInput
              placeholder="Press Enter to add Client Roles"
              name="clientRoles"
              value={data?.clientRoles}
              data-testid="ap-authorization-client-roles"
            />
          </fieldset>
          <fieldset>
            <Legend>Client Mappers (optional)</Legend>
            <Grid templateColumns="210px 1fr" gap={4}>
              <GridItem bgColor="bc-gray" d="flex" alignItems="center" px={4}>
                Audience
              </GridItem>
              <GridItem>
                <Input
                  defaultValue={parseClientMappers(data?.clientMappers)}
                  data-testid="ap-authorization-client-mappers"
                  placeholder="Enter the Audience"
                  name="clientMappers"
                />
              </GridItem>
            </Grid>
          </fieldset>
          <fieldset>
            <Legend>UMA2 Resource Type (optional)</Legend>
            <Input
              defaultValue={data?.resourceType}
              data-testid="ap-authorization-uma2-resource-type"
              placeholder="Press Enter to add UMA2 Resource Type"
              name="resourceType"
            />
          </fieldset>
          <fieldset>
            <Legend>Resource Scopes (optional)</Legend>
            <Text fontSize="sm" color="bc-component">
              If your APIs are using UMA2 Resource Scopes, then provide the full
              list of Scopes setup in the IdP.
            </Text>
            <TagInput
              placeholder="Press Enter to add Resource Scopes"
              name="resourceScopes"
              value={data?.resourceScopes}
              data-testid="ap-authorization-resource-scopes"
            />
          </fieldset>
          <fieldset>
            <Legend>Resource Access Scope (optional)</Legend>
            <Text fontSize="sm" color="bc-component">
              The Resource Access Scope identifies a Resource Scope that, when
              granted to a user, allows them to administer permissions for the
              particular resource. This can be used when the Resource Server is
              the owner of the resource.
            </Text>
            <Input
              defaultValue={data?.resourceAccessScope}
              data-testid="ap-authorization-resource-access-scope"
              placeholder="Enter Resource Access Scope"
              name="resourceAccessScope"
            />
          </fieldset>
        </form>
      </ModalBody>
      <ModalFooter hidden={hidden}>
        <ButtonGroup>
          <Button
            onClick={onCancel}
            variant="secondary"
            data-testid="ap-authorization-form-cancel-btn"
          >
            {cancelButtonText}
          </Button>
          <Button
            onClick={handleCreate}
            data-testid="ap-authorization-form-continue-btn"
          >
            {submitButtonText}
          </Button>
        </ButtonGroup>
      </ModalFooter>
    </>
  );
};

export default AuthorizationForm;
