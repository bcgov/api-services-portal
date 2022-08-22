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
  error?: string;
  id?: string;
  name?: string;
  placeholder?: string;
  value?: string | string[];
}

// TODO: Look into custom reportValidity hook, so a input with value `[]` doesn't pass as valid when required
// (Should have a populated array if required)
const TagInput: React.FC<TagInputProps> = ({
  id,
  name,
  placeholder = 'Press enter to add',
  value = '',
  ...props
}) => {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const styles = useMultiStyleConfig('Input', {
    variant: 'bc-input',
  });
  const [isFocused, setIsFocused] = React.useState<boolean>(false);
  const [values, setValues] = React.useState<string[]>(() => {
    try {
      if (!value) {
        return [];
      }

      if (Array.isArray(value)) {
        return value;
      }
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
            if (inputRef.current) {
              inputRef.current.value = ' ';
            }
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
      setValues((state) => {
        if (state.length === 1) {
          inputRef.current.value = '';
        }
        return state.filter((_, i) => i !== index);
      });
    },
    []
  );
  const handleContainerClick = React.useCallback(() => {
    inputRef.current?.focus();
  }, []);
  const handleFocus = React.useCallback(() => setIsFocused(true), []);
  const handleBlur = React.useCallback(() => {
    if (inputRef.current.value.trim()) {
      setValues((state) => [...state, inputRef.current.value.trim()]);
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.value = '';
        }
      }, 1);
    }
    setIsFocused(false);
  }, []);
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

  React.useEffect(() => {
    const handleReset = () => setValues([]);
    const ref = inputRef?.current;
    ref.form?.addEventListener('reset', handleReset);

    return () => {
      ref.form?.removeEventListener('reset', handleReset);
    };
  }, []);

  return (
    <>
      <Box
        __css={fieldStyles}
        display="flex"
        alignItems="center"
        height="auto"
        minHeight="40px"
        pos="relative"
        py={1}
        onClick={handleContainerClick}
        cursor="text"
        data-testid={props['data-testid']}
        borderColor={props.isInvalid ? 'bc-error' : 'bc-component'}
      >
        <Wrap spacing={2}>
          {values.map((v, index) => (
            <WrapItem key={uid(v)}>
              <Tag
                fontSize="sm"
                variant="outline"
                data-testid={`${props['data-testid']}-item-${index}`}
              >
                <TagLabel>{v}</TagLabel>
                <TagCloseButton onClick={handleRemove(index)} />
              </Tag>
            </WrapItem>
          ))}
          <WrapItem>
            <Input
              {...props}
              isRequired={false}
              borderRadius={0}
              ref={inputRef}
              onBlur={handleBlur}
              onFocus={handleFocus}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              minWidth={placeholder.length * 10}
              variant="unstyled"
              data-testid={`${props['data-testid']}-input`}
            />
          </WrapItem>
        </Wrap>
      </Box>
      <input
        required={props.isRequired}
        id={id}
        name={name}
        value={JSON.stringify(values)}
        style={{ visibility: 'hidden', height: 0, position: 'absolute' }}
      />
    </>
  );
};

export default TagInput;
