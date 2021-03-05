import * as React from 'react';
import {
  FormControl,
  FormLabel,
  FormHelperText,
  Select,
} from '@chakra-ui/react';
import type { Product } from '@/shared/types/query.types';

import { useApi } from '@/shared/services/api';
import {
  ORGANIZATIONS_LIST,
  ORGANIZATION_UNITS_LIST,
} from '@/shared/queries/organization-queries';

interface OrganizationSelectProps {
  data: Product;
}

const OrganizationSelect: React.FC<OrganizationSelectProps> = ({ data }) => {
  const [organization, setOrganization] = React.useState<string>(
    data.organization?.id ?? ''
  );
  const onOrganizationChange = React.useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>) => {
      setOrganization(event.target.value);
    },
    [setOrganization]
  );
  const organizationsQuery = useApi(
    'organizations',
    {
      query: ORGANIZATIONS_LIST,
    },
    { suspense: false }
  );
  const organizationUnitsQuery = useApi(
    ['organizationUnits', organization],
    {
      query: ORGANIZATION_UNITS_LIST,
      variables: {
        search:
          organizationsQuery.data?.allOrganizations.find(
            (org) => org.id === organization
          )?.id ?? '',
      },
    },
    { suspense: false, enabled: !!organization }
  );

  return (
    <>
      <FormControl id="product-organization">
        <FormLabel>Organization</FormLabel>
        <Select
          defaultValue={data.organization ? data.organization[0] : ''}
          isLoading={organizationsQuery.isLoading}
          onChange={onOrganizationChange}
          name="organization"
          variant="bc-input"
          value={organization}
        >
          {organizationsQuery.data?.allOrganizations.map((org) => (
            <option key={org.id} value={org.id}>
              {org.name}
            </option>
          ))}
        </Select>
        <FormHelperText>
          Which organization does this product belong to?
        </FormHelperText>
      </FormControl>
      <FormControl id="product-organization-unit">
        <FormLabel>Organization Unit</FormLabel>
        <Select
          defaultValue={data.organizationUnit?.name}
          name="organizationUnit"
          variant="bc-input"
          isDisabled={!organization}
        >
          <option value="">Select an Organization Unit</option>
          {organizationUnitsQuery.data?.allOrganizationUnits.map((unit) => (
            <option key={unit.id} value={unit.id}>
              {unit.name}
            </option>
          ))}
        </Select>
      </FormControl>
    </>
  );
};

export default OrganizationSelect;
