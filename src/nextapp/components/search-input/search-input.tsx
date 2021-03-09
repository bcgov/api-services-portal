import * as React from 'react';
import {
  Input,
  InputGroup,
  Icon,
  InputLeftElement,
  InputRightElement,
  IconButton,
} from '@chakra-ui/react';
import { FaRegTimesCircle, FaSearch } from 'react-icons/fa';

interface SearchInputProps {
  onChange: (value: string) => void;
  placeholder?: string;
  value: string;
}

const SearchInput: React.FC<SearchInputProps> = ({
  onChange,
  placeholder = 'Search',
  value,
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
      <InputLeftElement pointerEvents="none">
        <Icon as={FaSearch} color="gray.300" />
      </InputLeftElement>
      <Input
        ref={ref}
        placeholder={placeholder}
        type="search"
        variant="bc-input"
        value={value}
        onChange={handleChange}
      />
      <InputRightElement>
        <IconButton
          aria-label="Clear search button"
          h="1.75rem"
          size="sm"
          mt={-0.5}
          variant="unstyled"
          color="gray.600"
          onClick={handleReset}
          opacity={value ? 1 : 0}
        >
          <Icon as={FaRegTimesCircle} boxSize="1rem" />
        </IconButton>
      </InputRightElement>
    </InputGroup>
  );
};

export default SearchInput;
