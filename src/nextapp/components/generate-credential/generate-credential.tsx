import * as React from 'react';
import {
  Alert,
  AlertDescription,
  AlertIcon,
  Box,
  Button,
  Center,
  Text,
} from '@chakra-ui/react';
import { gql } from 'graphql-request';
import isEmpty from 'lodash/isEmpty';
import { useApiMutation } from '@/shared/services/api';
import type { Mutation } from '@/shared/types/query.types';

import ViewSecret from '../view-secret';
import { FaTimesCircle } from 'react-icons/fa';

interface GenerateCredentialsProps {
  id: string;
  onCredentialGenerated: () => void;
}

const GenerateCredentials: React.FC<GenerateCredentialsProps> = ({
  id,
  onCredentialGenerated,
}) => {
  const [credentials, setCredentials] = React.useState<Record<string, string>>(
    {}
  );
  const credentialGenerator = useApiMutation(mutation, {
    onSuccess: onCredentialGenerated,
  });
  const generateCredentials = React.useCallback(async () => {
    const res: Mutation = await credentialGenerator.mutateAsync({ id });
    if (res.updateAccessRequest.credential !== 'NEW') {
      setCredentials(JSON.parse(res.updateAccessRequest.credential));
    }
  }, [credentialGenerator, id, setCredentials]);

  return (
    <>
      {!isEmpty(credentials) && (
        <Box my={8}>
          <ViewSecret credentials={credentials} />
          <Alert status="warning" mt={8} mb={5}>
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
            By clicking Generate Secrets we will generate your credentials once.
          </Text>
          <Center minH="250px">
            <Box>
              <Button
                isLoading={credentialGenerator.isLoading}
                onClick={generateCredentials}
              >
                {`${
                  credentialGenerator.isError ? 'Retry ' : ''
                }Generate Secrets`}
              </Button>
              {credentialGenerator.isError && (
                <Alert
                  status="error"
                  mt={5}
                  variant="outline"
                  borderRadius="md"
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
