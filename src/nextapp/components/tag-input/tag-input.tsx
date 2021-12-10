import * as React from 'react';
import {
  Box,
  Input,
  InputProps,
  Tag,
  TagCloseButton,
  TagLabel,
  useMultiStyleConfig,
  Wrap,
  WrapItem,
} from '@chakra-ui/react';
import { uid } from 'react-uid';

interface TagInputProps extends InputProps {
  id?: string;
  name?: string;
  placeholder?: string;
  value?: string;
}

const TagInput: React.FC<TagInputProps> = ({
  id,
  name,
  placeholder = 'Press enter to add',
  value = '',
  ...rest
}) => {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const styles = useMultiStyleConfig('Input', { variant: 'bc-input' });
  const [isFocused, setIsFocused] = React.useState<boolean>(false);
  const [values, setValues] = React.useState<string[]>(() => {
    try {
      return JSON.parse(value);
    } catch {
      return [];
    }
  });

  // Events
  const handleKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (inputRef.current) {
        if (event.key === 'Enter') {
          event.stopPropagation();
          event.preventDefault();

          setValues((state) => [...state, inputRef.current.value]);
          setTimeout(() => {
            inputRef.current.value = '';
          }, 10);
        } else if (event.key === 'Escape') {
          inputRef.current.value = '';
          inputRef.current.blur();
        }
      }
    },
    []
  );
  const handleRemove = React.useCallback(
    (index: number) => () => {
      setValues((state) => state.filter((_, i) => i !== index));
    },
    []
  );
  const handleContainerClick = React.useCallback(() => {
    inputRef.current?.focus();
  }, []);
  const handleFocus = React.useCallback(() => setIsFocused(true), []);
  const handleBlur = React.useCallback(() => setIsFocused(false), []);
  const fieldStyles = React.useMemo(() => {
    if (isFocused) {
      return {
        ...styles.field,
        // @ts-ignore
        ...styles.field._focus,
      };
    }
    return styles.field;
  }, [isFocused, styles.field]);

  return (
    <>
      <Box
        __css={fieldStyles}
        display="flex"
        alignItems="center"
        height="auto"
        minHeight="40px"
        pos="relative"
        py={2}
        onClick={handleContainerClick}
      >
        <Wrap spacing={2}>
          {values.map((v, index) => (
            <WrapItem key={uid(v)}>
              <Tag fontSize="sm" variant="outline">
                <TagLabel>{v}</TagLabel>
                <TagCloseButton onClick={handleRemove(index)} />
              </Tag>
            </WrapItem>
          ))}
          <WrapItem>
            <Input
              {...rest}
              borderRadius={0}
              ref={inputRef}
              onBlur={handleBlur}
              onFocus={handleFocus}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              variant="unstyled"
            />
          </WrapItem>
        </Wrap>
      </Box>
      <input id={id} name={name} type="hidden" value={JSON.stringify(values)} />
    </>
  );
};

export default TagInput;
