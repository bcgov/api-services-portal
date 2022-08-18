import * as React from 'react';
import { Avatar, Flex, FlexProps, Text } from '@chakra-ui/react';
import { User } from '@/shared/types/query.types';
import { UserData } from '@/shared/types/app.types';

interface ProfileCardProps extends FlexProps {
  data: User | UserData;
  variant?: 'flat' | 'raised';
}

const ProfileCard: React.FC<ProfileCardProps> = ({
  data,
  variant,
  ...rest
}) => {
  const isRaised = variant === 'raised';

  return (
    <Flex
      align="stretch"
      boxShadow={isRaised ? 'md' : 'none'}
      p={isRaised ? 4 : 0}
      borderRadius={4}
      {...rest}
    >
      <Avatar name={data.name} />
      <Flex
        flex={1}
        ml={2}
        lineHeight="4"
        direction="column"
        justify="space-between"
        py={1}
      >
        <Text isTruncated fontWeight="bold" lineHeight={5}>
          {data.name}
          {data.providerUsername && (
            <Text isTruncated as="span" fontWeight="normal" color="gray.400">
              {` • ${data.providerUsername}`}
            </Text>
          )}
        </Text>
        <Text fontWeight="normal" color="bc-component">
          {data.email}
        </Text>
      </Flex>
    </Flex>
  );
};

export default ProfileCard;
