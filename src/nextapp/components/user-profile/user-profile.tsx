import * as React from 'react';
import {
  Avatar,
  Box,
  BoxProps,
  Flex,
  Heading,
  Skeleton,
  SkeletonCircle,
  Text,
} from '@chakra-ui/react';
import { UserData } from '@/shared/types/app.types';
import { User } from '@/shared/types/query.types';

interface UserProfileProps extends BoxProps {
  data?: UserData | User;
  heading?: string;
  isLoading?: boolean;
}

const UserProfile: React.FC<UserProfileProps> = ({
  data = {},
  heading = 'Administrator',
  isLoading = false,
  ...props
}) => {
  const testId = props['data-testid'] ?? 'user-profile';
  return (
    <Box {...props}>
      <Heading size="sm" mb={3.5}>
        {heading}:
      </Heading>
      <Flex>
        <Avatar name={data.name} />
        <Flex ml={2.5} flex={1} direction="column" justify="space-between">
          {isLoading && (
            <>
              <Flex align="center">
                <Skeleton width="140px" height="20px" />
                <SkeletonCircle size="2" mx={2} />
                <Skeleton width="100px" height="20px" />
              </Flex>
              <Skeleton width="135px" height="20px" />
            </>
          )}
          {!isLoading && (
            <>
              <Text fontWeight="normal" lineHeight="1">
                <Text
                  as="span"
                  fontWeight="bold"
                  fontSize="md"
                  data-testid={`${testId}-name`}
                >
                  {data.provider === 'github'
                    ? data.providerUsername
                    : data.name}
                </Text>
                <Text
                  as="span"
                  color="bc-component"
                  fontSize="md"
                  data-testid={`${testId}-username`}
                >
                  <Text as="span" mx={1}>
                    &bull;
                  </Text>
                  {getProviderText(d.provider)}
                </Text>
              </Text>
              {data.provider !== 'bscs' && (
                <Text
                  color="bc-component"
                  data-testid={`${testId}-email`}
                  fontSize="md"
                  fontWeight="normal"
                >
                  {data.email}
                </Text>
              )}
            </>
          )}
        </Flex>
      </Flex>
    </Box>
  );
};

export default UserProfile;

function getProviderText(provider: string): string {
  switch (provider) {
    case 'bscs':
      return 'BC Services Card';
    case 'idir':
      return 'IDIR';
    case 'bceid':
      return 'Business BCeID';
    case 'github':
      return 'Github';
    default:
      return '';
  }
}
