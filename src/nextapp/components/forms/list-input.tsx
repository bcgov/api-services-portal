import * as React from 'react';
import {
  Box,
  Button,
  Divider,
  Editable,
  EditableInput,
  EditablePreview,
  Flex,
  FormControl,
  FormLabel,
  Icon,
  IconButton,
  Input,
  InputGroup,
  InputRightElement,
  Text,
} from '@chakra-ui/react';
import { FaPlus, FaTimes } from 'react-icons/fa';
import isEmpty from 'lodash/isEmpty';
import { uid } from 'react-uid';

interface ListInputProps {
  buttonText?: string;
  label: string;
  name: string;
  placeholder?: string;
  required?: boolean;
  value: string;
  buttonTestId?: string;
}

const ListInput: React.FC<ListInputProps> = ({
  buttonText = 'Add Value',
  label,
  name,
  placeholder = 'Press enter to add',
  required,
  value = '',
  buttonTestId,
}) => {
  const fieldsetRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [isAdding, setIsAdding] = React.useState<boolean>(false);
  const [values, setValues] = React.useState<string[]>(() => {
    try {
      if (value) {
        return JSON.parse(value);
      } else {
        throw '';
      }
    } catch {
      return [];
    }
  });
  const computedValue = React.useMemo(() => {
    let validValues = [];
    if (values) {
      validValues = values.filter((v) => !isEmpty(v));
    }
    return JSON.stringify(validValues);
  }, [values]);

  const handleAddToggle = React.useCallback(() => {
    setIsAdding((state) => !state);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 50);
  }, [setIsAdding]);
  const handleAdd = React.useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        const valueToAdd = inputRef.current?.value?.trim();

        if (valueToAdd) {
          setValues((state) => [...state, valueToAdd]);
        }

        inputRef.current.value = '';
      }

      if (event.key === 'Escape') {
        setIsAdding(false);
      }

      return false;
    },
    [setIsAdding, setValues]
  );
  const handleRemove = React.useCallback(
    (index: number) => () => {
      setValues((state) => state.filter((_, i) => i !== index));
    },
    [setValues]
  );

  return (
    <>
      <FormControl isRequired={required} ref={fieldsetRef}>
        <FormLabel>{label}</FormLabel>
        <Divider />
        {values.map((v, index) => (
          <React.Fragment key={uid(v)}>
            <Flex my={2}>
              <Text flex={1}>{v}</Text>
              <IconButton
                aria-label="delete item"
                colorScheme="red"
                h="1.75rem"
                icon={<Icon as={FaTimes} />}
                size="sm"
                onClick={handleRemove(index)}
                variant="link"
                data-testid={buttonTestId}
              />
            </Flex>
            <Divider />
          </React.Fragment>
        ))}
        {isAdding && (
          <Box my={4}>
            <Input
              ref={inputRef}
              placeholder={placeholder}
              onKeyDown={handleAdd}
            />
          </Box>
        )}
        <input type="hidden" name={name} value={computedValue} />
      </FormControl>
      {!isAdding && (
        <Box mt={2}>
          <Button
            colorScheme="green"
            leftIcon={<Icon as={FaPlus} />}
            size="sm"
            onClick={handleAddToggle}
          >
            {buttonText}
          </Button>
        </Box>
      )}
    </>
  );
};

export default ListInput;
