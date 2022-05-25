import * as React from 'react';
import { Text, Tooltip } from '@chakra-ui/react';
import { useRestApi } from '@/shared/services/api';

type Result = {
  version: string;
  revision: string;
  cluster: string;
};
const AppVersion: React.FC = () => {
  const { data, isLoading, isSuccess } = useRestApi<Result>(
    'version',
    '/about',
    {
      suspense: false,
    }
  );
  const label = React.useMemo(() => {
    if (isSuccess) {
      return (
        <>
          <div>{`Cluster: ${data.cluster}`}</div>
          <div>{`Revision: ${data.revision}`}</div>
        </>
      );
    }
    return '';
  }, [data, isSuccess]);
  return (
    <Tooltip
      aria-label="Version tooltip"
      label={label}
      isDisabled={!isSuccess}
      placement="left-start"
    >
      <Text fontSize="xs" lineHeight={7} cursor="help">
        {isLoading && '...'}
        {isSuccess && `Version ${data.version.replace('v', '')}`}
      </Text>
    </Tooltip>
  );
};

export default AppVersion;
