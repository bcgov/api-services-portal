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
  ORGANIZATIONS_OWN_UNITS_LIST,
} from '@/shared/queries/organization-queries';

interface OrganizationSelectProps {
  data: Product;
}

const OrganizationSelect: React.FC<OrganizationSelectProps> = ({ data }) => {
  const [organization, setOrganization] = React.useState<string>(
    data.organization?.id ?? ''
  );
  const [organizationUnit, setOrganizationUnit] = React.useState<string>(
    data.organizationUnit?.id ?? ''
  );
  // Events
  const onOrganizationChange = React.useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>) => {
      setOrganization(event.target.value);
    },
    [setOrganization]
  );
  const onOrganizationUnitChange = React.useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>) => {
      setOrganizationUnit(event.target.value);
    },
    [setOrganizationUnit]
  );

  // Queries
  const organizationsQuery = useApi(
    'organizations',
    {
      query: ORGANIZATIONS_LIST,
    },
    { suspense: false }
  );
  // Org unit grab the org and loop child org units
  const organizationUnitsQuery = useApi(
    ['organizationUnits', organization],
    {
      query: ORGANIZATIONS_OWN_UNITS_LIST,
      variables: {
        id: organization,
      },
    },
    { suspense: false, enabled: !!organization }
  );

  return (
    <>
      <FormControl id="product-organization">
        <FormLabel>Organization</FormLabel>
        <Select
          isLoading={organizationsQuery.isLoading}
          onChange={onOrganizationChange}
          name="organization"
          variant="bc-input"
          value={organization}
          data-testid="prd-edit-org-dd"
        >
          <option value="">Select an Organization</option>
          {organizationsQuery.data?.allOrganizations.map((org) => (
            <option key={org.id} value={org.id}>
              {org.title}
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
          name="organizationUnit"
          variant="bc-input"
          isDisabled={!organization}
          onChange={onOrganizationUnitChange}
          value={organizationUnit}
          data-testid="prd-edit-org-unit-dd"
        >
          <option value="">Select an Organization Unit</option>
          {organizationUnitsQuery.data?.Organization?.orgUnits.map((unit) => (
            <option key={unit.id} value={unit.id}>
              {unit.title}
            </option>
          ))}
        </Select>
      </FormControl>
    </>
  );
};

export default OrganizationSelect;
