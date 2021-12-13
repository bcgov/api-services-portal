import * as React from 'react';
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

const SearchInput: React.FC<SearchInputProps> = ({
  onChange,
  placeholder = 'Search',
  value,
  ...rest
}) => {
  const ref = React.useRef<HTMLInputElement>(null);
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
      ref.current.focus();
    },
    [onChange]
  );

  return (
    <InputGroup>
      <Input
        ref={ref}
        placeholder={placeholder}
        variant="bc-input"
        border="1px solid"
        borderColor="#e1e1e5"
        {...rest}
        onChange={handleChange}
        type="search"
        value={value}
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
};

export default SearchInput;
