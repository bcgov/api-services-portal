import * as React from 'react';
import {
  Box,
  Button,
  IconButton,
  FormControl,
  FormLabel,
  Icon,
  Input,
  InputGroup,
  InputRightElement,
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
}

const ListInput: React.FC<ListInputProps> = ({
  buttonText = 'Add Value',
  label,
  name,
  placeholder,
  required,
  value = '',
}) => {
  const fieldsetRef = React.useRef<HTMLDivElement>(null);
  const [values, setValues] = React.useState<string[]>(value.split('\n'));
  const computedValue = React.useMemo(() => {
    return values.filter((v) => !isEmpty(v)).join('\n');
  }, [values]);

  const handleAdd = React.useCallback(() => {
    setValues((state) => [...state, '']);
    setTimeout(() => {
      const lastInput: HTMLInputElement = fieldsetRef.current?.querySelector(
        '.list-input-item:last-of-type input'
      );

      if (lastInput) {
        lastInput.focus();
      }
    }, 50);
  }, [setValues]);
  const handleChange = React.useCallback(
    (index: number) => (event: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = event.target.value;
      setValues((state) =>
        state.map((v, i) => {
          if (i === index) {
            return newValue;
          }
          return v;
        })
      );
    },
    [setValues]
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
        {values.map((v, index) => (
          <InputGroup
            key={uid(index)}
            mb={2}
            id={uid(index)}
            className="list-input-item"
          >
            <Input
              onChange={handleChange(index)}
              placeholder={placeholder}
              type="text"
              variant="bc-input"
              value={v}
            />
            {values.length > 1 && (
              <InputRightElement width="3rem">
                <IconButton
                  aria-label="delete item"
                  colorScheme="red"
                  h="1.75rem"
                  icon={<Icon as={FaTimes} />}
                  size="sm"
                  onClick={handleRemove(index)}
                  variant="link"
                />
              </InputRightElement>
            )}
          </InputGroup>
        ))}
        <input type="hidden" name={name} value={computedValue} />
      </FormControl>
      <Box mt={2}>
        <Button
          colorScheme="green"
          leftIcon={<Icon as={FaPlus} />}
          size="sm"
          onClick={handleAdd}
        >
          {buttonText}
        </Button>
      </Box>
    </>
  );
};

export default ListInput;
