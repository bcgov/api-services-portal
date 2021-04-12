import * as React from 'react';
import { Badge, BadgeProps, Wrap, WrapItem } from '@chakra-ui/react';

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
    <Wrap spacing={2}>
      {tags.map((t) => (
        <WrapItem key={t}>
          <Badge colorScheme={colorScheme} fontSize={size} variant={variant}>
            {t}
          </Badge>
        </WrapItem>
      ))}
    </Wrap>
  );
};

export default TagsList;
