import * as React from 'react';
import { Product, Environment } from '@/shared/types/query.types';
import { Box, Divider, Heading, Switch } from '@chakra-ui/react';

interface ConsumerACLProps {
  aclGroups: string[];
  products: Product[];
}

const ConsumerACL: React.FC<ConsumerACLProps> = ({ aclGroups, products }) => {
  const productGroups = [].concat
    .apply(
      [],
      products.map((product) => product.environments)
    )
    .map((env: Environment) => env.appId);
  const readonlyGroups = aclGroups.filter(
    (group: string) => !productGroups.includes(group)
  );
  return readonlyGroups.length > 0 ? (
    <>
      <Box as="header" bgColor="white" p={4} mt={3}>
        <Heading size="md">Legacy ACL Groups</Heading>
      </Box>
      <Divider />

      <Box bgColor="white" p={4} mb={4}>
        {readonlyGroups.map((group: string) => (
          <Box p={2}>
            <Switch name="acls" isDisabled={true} isChecked={true} /> {group}
          </Box>
        ))}
      </Box>
    </>
  ) : (
    <></>
  );
};

export default ConsumerACL;
