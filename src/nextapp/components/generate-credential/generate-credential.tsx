import * as React from 'react';
import {
  Alert,
  AlertDescription,
  AlertIcon,
  Box,
  Button,
  Center,
  Icon,
  Text,
} from '@chakra-ui/react';
import { gql } from 'graphql-request';
import isEmpty from 'lodash/isEmpty';
import { useApiMutation } from '@/shared/services/api';
import type { Mutation } from '@/shared/types/query.types';

import ViewSecret from '../view-secret';
import { FaTimesCircle } from 'react-icons/fa';
import { HiRefresh } from 'react-icons/hi';

interface GenerateCredentialsProps {
  id: string;
  onCredentialGenerated?: () => void;
  regenerate?: boolean;
}

const GenerateCredentials: React.FC<GenerateCredentialsProps> = ({
  id,
  onCredentialGenerated,
  regenerate,
}) => {
  const [credentials, setCredentials] = React.useState<Record<string, string>>(
    {}
  );
  const credentialGenerator = useApiMutation(
    regenerate ? mutationRegenerate : mutation,
    {
      onSuccess() {
        if (onCredentialGenerated) {
          onCredentialGenerated();
        }
      },
    }
  );
  const buttonText = React.useMemo(() => {
    let result = 'Generate Secrets';

    if (regenerate) {
      result = 'Regenerate Secrets';
    }

    if (credentialGenerator.isError) {
      return `Retry ${result}`;
    }

    return result;
  }, [credentialGenerator.isError, regenerate]);
  const generateCredentials = React.useCallback(async () => {
    if (regenerate) {
      const res: Mutation = await credentialGenerator.mutateAsync({ id });
      setCredentials(JSON.parse(res.regenerateCredentials.credential));
    } else {
      const res: Mutation = await credentialGenerator.mutateAsync({ id });
      if (res.updateAccessRequest.credential !== 'NEW') {
        setCredentials(JSON.parse(res.updateAccessRequest.credential));
      }
    }
  }, [credentialGenerator, id, regenerate]);

  return (
    <>
      {!isEmpty(credentials) && (
        <Box my={8}>
          <ViewSecret credentials={credentials} />
          <Alert
            status="warning"
            mt={8}
            mb={5}
            data-testid="generate-secrets-instructions"
            variant="outline"
          >
            <AlertIcon />
            <AlertDescription>
              Please store your new API key somewhere safe because as soon as
              you navigate away from this dialog, we will not be able to
              retrieve this token.
            </AlertDescription>
          </Alert>
        </Box>
      )}
      {!credentialGenerator.isSuccess && (
        <>
          <Text pl={7} color="bc-component">
            {regenerate
              ? 'By clicking on "Regenerate", we will instantly regenerate your new credentials. Any old credentials will be revoked.'
              : 'By clicking Generate Secrets we will generate your credentials once.'}
          </Text>
          <Center minH="250px">
            <Box>
              <Button
                leftIcon={regenerate ? <Icon as={HiRefresh} /> : null}
                isLoading={credentialGenerator.isLoading}
                onClick={generateCredentials}
                data-testid="generate-secrets-button"
              >
                {buttonText}
              </Button>
              {credentialGenerator.isError && (
                <Alert
                  status="error"
                  mt={5}
                  variant="outline"
                  borderRadius="md"
                  data-testid="generate-secrets-error-message"
                >
                  <AlertIcon as={FaTimesCircle} />
                  <AlertDescription>Unable to generate keys</AlertDescription>
                </Alert>
              )}
            </Box>
          </Center>
        </>
      )}
    </>
  );
};

export default GenerateCredentials;

const mutation = gql`
  mutation genCredential($id: ID!) {
    updateAccessRequest(id: $id, data: { credential: "NEW" }) {
      credential
    }
  }
`;

const mutationRegenerate = gql`
  mutation genCredential($id: ID!) {
    regenerateCredentials(id: $id) {
      credential
    }
  }
`;
