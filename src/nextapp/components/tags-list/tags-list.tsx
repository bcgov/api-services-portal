import * as React from 'react';
import { BadgeProps, Tag, Wrap, WrapItem } from '@chakra-ui/react';

interface TagsListProps {
  colorScheme?: string & Pick<BadgeProps, 'colorScheme'>;
  data: string;
  size?: string;
  variant?: string & Pick<BadgeProps, 'variant'>;
}

const TagsList: React.FC<TagsListProps> = ({
  colorScheme,
  data,
  size,
  variant,
}) => {
  const tags = data == null || data == '' ? [] : (JSON.parse(data) as string[]);

  return (
    <Wrap spacing={2.5}>
      {tags.map((t) => (
        <WrapItem key={t}>
          <Tag colorScheme={colorScheme} fontSize={size} variant={variant}>
            {t}
          </Tag>
        </WrapItem>
      ))}
    </Wrap>
  );
};

export default TagsList;
