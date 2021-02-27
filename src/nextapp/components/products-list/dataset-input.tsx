import * as React from 'react';
import {
  Box,
  FormControl,
  FormHelperText,
  FormLabel,
  Input,
  Text,
  useTheme,
} from '@chakra-ui/react';
import Downshift, { StateChangeOptions } from 'downshift';

import { SEARCH_DATASETS } from '@/shared/queries/dataset-queries';
import { useApi } from '@/shared/services/api';
import { Dataset } from '@/shared/types/query.types';

interface DatasetInputProps {
  value: string | undefined;
}

const DatasetInput: React.FC<DatasetInputProps> = ({ value }) => {
  const theme = useTheme();
  const [search, setSearch] = React.useState<string>('');
  const { data, isLoading, isSuccess } = useApi(['dataset-search', search], {
    query: SEARCH_DATASETS,
    variables: { search },
  });
  console.log(search);
  const onStateChange = (changes: StateChangeOptions<Dataset>) => {
    console.log(changes);
    if (changes.selectedItem && !changes.selectedItem) {
      setSearch(changes.inputValue);
    }
  };

  return (
    <>
      <FormControl id="dataset" position="relative">
        <Downshift
          onStateChange={onStateChange}
          itemToString={(item) => (item ? item.name : '')}
        >
          {({
            getInputProps,
            getItemProps,
            getLabelProps,
            getMenuProps,
            isOpen,
            inputValue,
            highlightedIndex,
            selectedItem,
            getRootProps,
          }) => (
            <>
              <FormLabel {...getLabelProps()}>
                Link to BC Data Catalogue
              </FormLabel>
              <Input
                isDisabled={isLoading}
                {...getRootProps(
                  { refKey: 'innerRef' },
                  { suppressRefError: true }
                )}
                {...getInputProps()}
                name="dataset"
                defaultValue={value}
                variant="bc-input"
              />
              <Box
                {...getMenuProps()}
                border="2px solid"
                borderColor="bc-border-focus"
                borderTop="none"
                borderBottomRightRadius={4}
                borderBottomLeftRadius={4}
                position="absolute"
                zIndex={2}
                width="100%"
                minHeight="5px"
                marginTop="-5px"
                display={isOpen ? 'block' : 'none'}
              >
                {isOpen &&
                  isSuccess &&
                  data.allDatasets
                    .filter((d) => !inputValue || d.title.includes(inputValue))
                    .map((d, index) => (
                      <Box
                        key={d.id}
                        px={4}
                        py={2}
                        {...getItemProps({
                          key: d.id,
                          index,
                          item: d,
                          style: {
                            backgroundColor:
                              highlightedIndex === index
                                ? theme.colors['bc-link']
                                : 'white',
                            fontWeight: selectedItem === d ? 'bold' : 'normal',
                          },
                        })}
                      >
                        <Text fontSize="md">{d.title}</Text>
                      </Box>
                    ))}
              </Box>
            </>
          )}
        </Downshift>
        <FormHelperText>
          This value is the slug value of a corresponding BC Data Catalogue
          entry, i.e.{' '}
          <Text as="em">
            https://catalogue.data.gov.bc.ca/dataset/
            <Text as="mark">property-transfer-tax-data-2021</Text>
          </Text>
        </FormHelperText>
      </FormControl>
    </>
  );
};

export default DatasetInput;
