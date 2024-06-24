import * as React from 'react';
import { forwardRef } from 'react';
import {
  Input,
  InputGroup,
  Icon,
  InputRightElement,
  IconButton,
  InputProps,
} from '@chakra-ui/react';
import { FaTimes, FaSearch } from 'react-icons/fa';

interface SearchInputProps extends Omit<InputProps, 'onChange'> {
  onChange: (value: string) => void;
  placeholder?: string;
  value: string;
}

const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  ({ onChange, placeholder = 'Search', value, ...props }, forwardedRef) => {
  const innerRef = React.useRef<HTMLInputElement>(null);
  const ref = forwardedRef || innerRef;
  const handleChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onChange(event.target.value);
    },
    [onChange]
  );
  const handleReset = React.useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      event.stopPropagation();
      event.preventDefault();
      onChange('');
      if (ref && 'current' in ref && ref.current) {
        ref.current.focus();
      }
    },
    [onChange, ref]
  );

  return (
    <InputGroup>
      <Input
        ref={ref}
        placeholder={placeholder}
        variant="bc-input"
        border="1px solid"
        borderColor="#e1e1e5"
        {...props}
        onChange={handleChange}
        type="search"
        value={value}
        sx={{
          '&::-webkit-search-cancel-button': {
            display: 'none',
          },
        }}
      />
      <InputRightElement>
        {!value && <Icon as={FaSearch} color="bc-component" />}
        {value && (
          <IconButton
            aria-label="Clear search button"
            h="1.75rem"
            size="sm"
            mt={-0.5}
            variant="unstyled"
            color="bc-component"
            onClick={handleReset}
            _focus={{ outline: 'none', boxShadow: 'none' }}
            _active={{ outline: 'none', boxShadow: 'none' }}
          >
            <Icon as={FaTimes} boxSize="1rem" />
          </IconButton>
        )}
      </InputRightElement>
    </InputGroup>
  );
}
);

SearchInput.displayName = 'SearchInput';

export default SearchInput;