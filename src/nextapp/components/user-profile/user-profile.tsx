import * as React from 'react';
import {
  Avatar,
  Box,
  Flex,
  Heading,
  Skeleton,
  SkeletonCircle,
  Text,
} from '@chakra-ui/react';
import { UserData } from '@/shared/types/app.types';

interface UserProfileProps {
  data?: UserData;
  isLoading?: boolean;
}

const UserProfile: React.FC<UserProfileProps> = ({
  data = {},
  isLoading = false,
}) => {
  return (
    <Box>
      <Heading size="sm" mb={3.5}>
        Administrator:
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
              <Text lineHeight="1">
                <Text as="span" fontWeight="bold">
                  {data.name}
                </Text>
                <Text as="span" color="bc-component">
                  <Text as="span" mx={1}>
                    &bull;
                  </Text>
                  {data.username}
                </Text>
              </Text>
              <Text color="bc-component">{data.email}</Text>
            </>
          )}
        </Flex>
      </Flex>
    </Box>
  );
};

export default UserProfile;
