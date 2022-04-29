import * as React from 'react';
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalOverlay,
  ModalHeader,
  Icon,
  Box,
  Text,
  Flex,
  Link,
  Divider,
  Center,
  Heading,
  ModalCloseButton,
  Checkbox,
} from '@chakra-ui/react';
import type { NamespaceData } from '@/shared/types/app.types';
import { FaDownload } from 'react-icons/fa';

import NamespaceDelete from '../namespace-delete';
import ExportReport from './export-report';

interface NamespaceManagerProps {
  data: NamespaceData[];
  isOpen: boolean;
  onClose: () => void;
}

const NamespaceManager: React.FC<NamespaceManagerProps> = ({
  data,
  isOpen,
  onClose,
}) => {
  const [selectAll, setSelectAll] = React.useState(false);
  const [selected, setSelected] = React.useState<string[]>([]);
  const [isInvalid, setInvalid] = React.useState(false);

  const handleChecked = React.useCallback(
    (id: string) => () => {
      setInvalid(false);
      setSelected((state) => {
        if (state.includes(id)) {
          return state.filter((d) => d !== id);
        }
        return [...state, id];
      });
    },
    []
  );
  const handleToggleSelectAll = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setSelectAll(event.target.checked);
    setInvalid(false);
  };
  const handleSubmit = React.useCallback(() => {
    if (selected.length === 0) {
      setInvalid(true);
    } else {
      setInvalid(false);
    }
  }, [selected]);

  React.useEffect(() => {
    if (selectAll) {
      setSelected(data.map((n) => n.id));
    } else {
      setSelected([]);
    }
  }, [data, selectAll]);

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        scrollBehavior="inside"
        size="xl"
      >
        <ModalOverlay />
        <ModalContent>
          <ModalCloseButton />
          <ModalHeader>Export Namespace Report</ModalHeader>
          <ModalBody px={0} maxH={300}>
            <Box px={8} pb={4}>
              <Text>
                Export a detailed report of your namespace metrics and
                activities
              </Text>
            </Box>
            {data.length <= 0 && (
              <Center>
                <Box my={8}>
                  <Heading mb={2} size="sm">
                    You have no namespaces
                  </Heading>
                  <Text fontSize="sm">Create a namespace to manage.</Text>
                </Box>
              </Center>
            )}
            <Flex
              align="center"
              justify="space-between"
              height={14}
              mx={8}
              borderBottom="2px solid"
              borderColor="bc-yellow"
            >
              <Checkbox checked={selectAll} onChange={handleToggleSelectAll} />
              {selected.length > 0 && (
                <Text color="bc-component">{`${selected.length} selected`}</Text>
              )}
            </Flex>
            {data.map((n) => (
              <Flex
                key={n.id}
                height={14}
                mx={8}
                align="center"
                borderBottom="1px solid"
                borderColor="bc-gray"
              >
                <Checkbox
                  isChecked={selected.includes(n.id)}
                  isInvalid={isInvalid}
                  value={n.id}
                  onChange={handleChecked(n.id)}
                >
                  {n.name}
                </Checkbox>
              </Flex>
            ))}
          </ModalBody>
          <Divider />
          <ModalFooter justifyContent="space-between">
            <Box>
              {isInvalid && (
                <Text color="bc-error">*Please select a namespace</Text>
              )}
            </Box>
            <Button leftIcon={<Icon as={FaDownload} />} onClick={handleSubmit}>
              <Link href="/int/api/namespaces/report" download>
                Export to Excel
              </Link>
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default NamespaceManager;
