import * as React from 'react';
import {
  Avatar,
  Box,
  BoxProps,
  Flex,
  Heading,
  Icon,
  Skeleton,
  Text,
} from '@chakra-ui/react';
import { BusinessProfile } from '@/shared/types/query.types';
import compact from 'lodash/compact';
import { FaBuilding } from 'react-icons/fa';

interface BusinessProfileContentProps extends BoxProps {
  data?: BusinessProfile;
  isLoading?: boolean;
}

const BusinessProfileContent: React.FC<BusinessProfileContentProps> = ({
  data = {},
  isLoading,
  ...props
}) => {
  const testId = props['data-testid'] ?? 'business-profile';
  const { addressItems, legalName } = React.useMemo(() => {
    let legalName = '';
    let addressItems = '';

    if (data?.institution) {
      legalName = data.institution.legalName;
      addressItems = compact([
        data.institution.address.addressLine1,
        data.institution.address.addressLine2,
        data.institution.address.city,
        data.institution.address.postal,
      ]).join(' ');
    }

    return {
      addressItems,
      legalName,
    };
  }, [data]);

  return (
    <Box {...props}>
      <Heading size="sm" mb={3.5}>
        Business Profile:
      </Heading>
      {!data.institution && (
        <Text color="bc-component" fontStyle="italic" opacity={0.6}>
          A business profile has not been added
        </Text>
      )}
      {data.institution && (
        <Flex>
          <Avatar
            bgColor="bc-gray"
            icon={
              <Icon
                as={FaBuilding}
                color={
                  data.institution?.isSuspended ? 'bc-component' : 'bc-blue'
                }
              />
            }
          />
          <Flex
            ml={2.5}
            flex={1}
            direction="column"
            justify="space-between"
            color="bc-component"
          >
            {isLoading && (
              <>
                <Flex align="center">
                  <Skeleton width="170px" height="20px" />
                </Flex>
                <Skeleton width="235px" height="20px" />
              </>
            )}
            {!isLoading && (
              <>
                <Text lineHeight="5" data-testid={`${testId}-name`}>
                  {legalName}
                  {data.institution?.isSuspended && (
                    <Text as="em" ml={2} color="bc-divider">
                      (Suspended)
                    </Text>
                  )}
                </Text>
                <Text data-testid={`${testId}-address`}>{addressItems}</Text>
              </>
            )}
          </Flex>
        </Flex>
      )}
    </Box>
  );
};

export default BusinessProfileContent;
