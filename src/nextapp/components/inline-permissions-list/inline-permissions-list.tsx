import * as React from 'react';
import { HStack, Tag, TagCloseButton } from '@chakra-ui/react';

interface InlinePermissionsListProps {
  data: {
    id: string;
    scope: string;
    scopeName: string;
  }[];
  onRevoke: (id: string) => void;
}

const InlinePermissionsList: React.FC<InlinePermissionsListProps> = ({
  data,
  onRevoke,
}) => {
  const handleRevoke = React.useCallback(
    (id: string) => () => {
      onRevoke(id);
    },
    [onRevoke]
  );

  return (
    <HStack shouldWrapChildren spacing={2}>
      {data.map((p) => (
        <Tag key={p.id} variant="solid" colorScheme="cyan" whiteSpace="nowrap">
          {p.scopeName}
          <TagCloseButton onClick={handleRevoke(p.id)} />
        </Tag>
      ))}
    </HStack>
  );
};

export default InlinePermissionsList;
