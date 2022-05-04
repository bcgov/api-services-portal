import * as React from 'react';
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalOverlay,
  ModalHeader,
  Box,
  Text,
  Flex,
  Divider,
  Center,
  Heading,
  ModalCloseButton,
  Checkbox,
} from '@chakra-ui/react';
import type { NamespaceData } from '@/shared/types/app.types';

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

  const handleClose = () => {
    setSelectAll(false);
    setSelected([]);
    onClose();
  };
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
  const handleClear = () => {
    setSelectAll(false);
    setSelected([]);
  };
  const handleSubmit = React.useCallback(() => {
    if (selected.length === 0) {
      setInvalid(true);
      return false;
    }
    setInvalid(false);
    return true;
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
        onClose={handleClose}
        scrollBehavior="inside"
        size="2xl"
      >
        <ModalOverlay />
        <ModalContent>
          <ModalCloseButton />
          <ModalHeader pb={0}>
            <Heading size="inherit">Export Namespace Report</Heading>
            <Box fontSize="md" fontWeight="normal" width="100%" mt={4}>
              <Text color="bc-component" mb={2.5}>
                Export a detailed report of your namespace metrics and
                activities
              </Text>
              <Flex
                align="center"
                justify="space-between"
                height={14}
                borderBottom="2px solid"
                borderColor="bc-yellow"
              >
                <Checkbox
                  isChecked={selectAll}
                  isIndeterminate={
                    selected.length > 0 && selected.length < data.length
                  }
                  isInvalid={isInvalid}
                  onChange={handleToggleSelectAll}
                  size="md"
                  data-testid="export-report-select-all-check"
                >
                  {selected.length === data.length
                    ? 'Select None'
                    : 'Select All'}
                </Checkbox>
                <Box>
                  {selected.length > 0 && (
                    <Flex>
                      <Text color="bc-component">{`${selected.length} selected`}</Text>
                      <Text
                        role="button"
                        color="bc-componet"
                        textDecor="underline"
                        size="sm"
                        ml={2}
                        onClick={handleClear}
                      >
                        Clear
                      </Text>
                    </Flex>
                  )}
                </Box>
              </Flex>
            </Box>
          </ModalHeader>
          <ModalBody px={0} maxH={300}>
            {data.length <= 0 && (
              <Center>
                <Box my={8}>
                  <Heading
                    mb={2}
                    size="sm"
                    data-testid="export-report-empty-text"
                  >
                    You have no namespaces
                  </Heading>
                  <Text fontSize="sm">Create a namespace to manage.</Text>
                </Box>
              </Center>
            )}
            {data.map((n) => (
              <Flex
                key={n.id}
                as="label"
                cursor="pointer"
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
                  size="md"
                  data-testid={`export-report-${n.id}`}
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
                <Text color="bc-error" data-testid="export-report-select-error">
                  *Please select a namespace
                </Text>
              )}
            </Box>
            <ExportReport
              onComplete={handleClose}
              onSubmit={handleSubmit}
              selected={selected}
            />
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default NamespaceManager;
