import * as React from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Grid,
  GridItem,
  Icon,
  Input,
  Select,
  useDisclosure,
} from '@chakra-ui/react';
import { FaPlusCircle, FaTimesCircle } from 'react-icons/fa';

interface EnvironmentFormProps {
  open?: boolean;
  onSubmit: (payload: FormData) => void;
}

const EnvironmentForm: React.FC<EnvironmentFormProps> = ({
  open = false,
  onSubmit,
}) => {
  const { isOpen, onToggle, onClose } = useDisclosure({
    defaultIsOpen: open,
  });
  const [method, setMethod] = React.useState<string>('anonymous');
  const ButtonIcon = isOpen ? FaTimesCircle : FaPlusCircle;
  const buttonText = isOpen ? 'Cancel' : 'Add Environment';

  // Events
  const handleRegistrationChange = React.useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>) => {
      setMethod(event.target.value);
    },
    []
  );
  const handleSubmit = React.useCallback(
    (event) => {
      event.preventDefault();
      const formData = new FormData(event.currentTarget);
      onSubmit(formData);
      onClose();
    },
    [onClose, onSubmit]
  );

  return (
    <>
      <Button
        onClick={onToggle}
        leftIcon={<Icon as={ButtonIcon} />}
        size="sm"
        variant="flat"
      >
        {buttonText}
      </Button>
      {isOpen && (
        <Box as="form" px={3} mt={5} onSubmit={handleSubmit}>
          <Grid templateColumns="repeat(3, 1fr)" gap={4}>
            <FormControl isRequired as={GridItem}>
              <FormLabel>Environment</FormLabel>
              <Select defaultValue="dev" name="environment">
                <option value="dev">Development</option>
                <option value="sandbox">Sandbox</option>
                <option value="test">Test</option>
                <option value="prod">Production</option>
                <option value="other">Other</option>
              </Select>
            </FormControl>
            <FormControl isRequired as={GridItem} colSpan={2}>
              <FormLabel>IdP Issuer URL</FormLabel>
              <Input
                type="url"
                name="issuerUrl"
                placeholder="Enter IdP Issuer URL"
              />
            </FormControl>
            <FormControl isRequired as={GridItem} gridRowStart="row-start">
              <FormLabel>Client Registration</FormLabel>
              <Select
                name="clientRegistration"
                onChange={handleRegistrationChange}
                value={method}
              >
                <option value="anonymous">Anonymous</option>
                <option value="iat">Initial Access Token</option>
                <option value="managed">Managed</option>
              </Select>
            </FormControl>
            {method === 'iat' && (
              <FormControl isRequired as={GridItem} colSpan={2}>
                <FormLabel>Initial Acccess Token</FormLabel>
                <Input
                  placeholder="Enter Initial Access Token"
                  name="initialAccessToken"
                />
              </FormControl>
            )}
            {method === 'managed' && (
              <>
                <FormControl isRequired as={GridItem}>
                  <FormLabel>Client ID</FormLabel>
                  <Input name="clientId" placeholder="Enter Client ID" />
                </FormControl>
                <FormControl isRequired as={GridItem}>
                  <FormLabel>Client Secret</FormLabel>
                  <Input
                    name="clientSecret"
                    placeholder="Enter Client Secret"
                  />
                </FormControl>
              </>
            )}
          </Grid>
          <Box mt={5} d="flex">
            <Button type="submit">Add Environment</Button>
          </Box>
        </Box>
      )}
    </>
  );
};

export default EnvironmentForm;