import * as React from 'react';
import {
  Alert,
  AlertIcon,
  Button,
  Box,
  Container,
  FormLabel,
  FormControl,
  Input,
  Icon,
  VStack,
  Text,
  Flex,
  ButtonGroup,
  Link,
  Textarea,
  Checkbox,
  HStack,
  Heading,
  Avatar,
  Select,
  StackDivider,
  useToast,
  Center,
  useDisclosure,
  Tooltip,
} from '@chakra-ui/react';
import { useApi } from '@/shared/services/api';
import { gql } from 'graphql-request';

const query = gql`
  query GET($environmentId: ID!) {
    getAccountLinking(id: $environmentId) {
      linkingUrl
      linkedIdentities
      environmentName
      productName
      brokerAlias
      issuerUrl
    }
  }
`;

interface LinkIdentitySelectProps {
  environmentId: string;
  value?: string;
}

const LinkIdentitySelect: React.FC<LinkIdentitySelectProps> = ({
  environmentId,
  value,
}) => {
  const variables = { environmentId };
  const { data, isLoading, isSuccess } = useApi(
    ['link-identity', environmentId],
    {
      query,
      variables,
    },
    {
      suspense: false,
    }
  );

  if (isLoading) {
    return <></>;
  }

  const details = data.getAccountLinking;

  return (
    <p>
      <VStack spacing={4} align="left">
        {details.linkedIdentities.length > 0 && (
          <Box>
            <VStack align="left">
              <Box>
                Username: <strong>{details.linkedIdentities[0]}</strong>
              </Box>
              <Box sx={{ fontSize: '80%' }}>Issued by {details.issuerUrl}</Box>
            </VStack>
          </Box>
        )}
        {details.linkedIdentities.length == 0 && (
          <Box flex={1}>
            <Link href={details.linkingUrl}>
              <Button size="sm" variant="ghost">
                Confirm Identity
              </Button>
            </Link>
          </Box>
        )}
      </VStack>
    </p>
  );
};

export default LinkIdentitySelect;
