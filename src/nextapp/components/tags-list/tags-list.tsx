import * as React from 'react';
import { Badge, Wrap, WrapItem } from '@chakra-ui/react';

interface TagsListProps {
  data: string;
}

const TagsList: React.FC<TagsListProps> = ({ data }) => {
  const tags = JSON.parse(data) as string[];

  return (
    <Wrap spacing={2}>
      {tags.map((t) => (
        <WrapItem key={t}>
          <Badge>{t}</Badge>
        </WrapItem>
      ))}
    </Wrap>
  );
};

export default TagsList;
