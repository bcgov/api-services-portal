import * as React from 'react';
import { Tag, TagCloseButton, Wrap, WrapItem } from '@chakra-ui/react';

interface InlinePermissionsListProps {
  data: {
    id: string;
    scopeName: string;
  }[];
  enableRevoke: boolean;
  onRevoke: (id: string) => void;
}

const InlinePermissionsList: React.FC<InlinePermissionsListProps> = ({
  data,
  enableRevoke,
  onRevoke,
}) => {
  const handleRevoke = React.useCallback(
    (id: string) => () => {
      onRevoke(id);
    },
    [onRevoke]
  );

  return (
    <Wrap spacing={2}>
      {data.map((p) => (
        <WrapItem key={p.id}>
          <Tag variant="solid" colorScheme="cyan" whiteSpace="nowrap">
            {p.scopeName}
            {enableRevoke && <TagCloseButton onClick={handleRevoke(p.id)} />}
          </Tag>
        </WrapItem>
      ))}
    </Wrap>
  );
};

export default InlinePermissionsList;
