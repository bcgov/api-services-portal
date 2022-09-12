import * as React from 'react';
import { Grid, Input, Select } from '@chakra-ui/react';

interface ActivityFiltersProps {
  value?: string;
}

const ActivityFilters: React.FC<ActivityFiltersProps> = ({ value }) => {
  const placeholderText = React.useMemo(() => {
    switch (value) {
      case 'serviceAccounts':
        return 'Enter a service account ID';
      case 'consumers':
        return 'Enter a consumer name';
      case 'users':
        return 'Enter a user name';
      default:
        return 'Enter Value';
    }
  }, [value]);
  const max = new Date().toJSON().split('T')[0];

  return (
    <Grid templateColumns="1fr" gap={4}>
      {value === 'activityDate' && (
        <Input isRequired type="date" name="value" max={max} />
      )}
      {value !== 'activityDate' && (
        <Input
          isRequired
          name="value"
          data-testid={`activity-filters-${value}-input`}
          placeholder={placeholderText}
        />
      )}
    </Grid>
  );
};

export default ActivityFilters;
