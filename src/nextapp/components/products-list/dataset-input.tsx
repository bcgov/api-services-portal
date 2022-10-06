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

import { useApi } from '@/shared/services/api';
import { Dataset } from '@/shared/types/query.types';
import { gql } from 'graphql-request';

interface DatasetInputProps {
  dataset?: Dataset;
}

const DatasetInput: React.FC<DatasetInputProps> = ({ dataset }) => {
  const theme = useTheme();
  const [search, setSearch] = React.useState<string>('');
  const [selected, setSelected] = React.useState<Dataset | null>(dataset);
  const { data, isSuccess } = useApi(
    ['dataset-search', search],
    {
      query,
      variables: { search, first: 25 },
    },
    {
      enabled: Boolean(search),
    }
  );

  const onChange = React.useCallback(
    (selection: Dataset) => {
      if (selection) {
        setSelected(selection);
      } else {
        setSelected(null);
      }
    },
    [setSelected]
  );
  const onStateChange = React.useCallback(
    (changes: StateChangeOptions<Dataset>) => {
      if (changes.inputValue) {
        setSearch(changes.inputValue);
      }
    },
    [setSearch]
  );

  return (
    <>
      <FormControl id="dataset" position="relative">
        <Downshift
          initialInputValue={dataset?.title}
          itemToString={(item) => (item ? item.title : '')}
          onChange={onChange}
          onStateChange={onStateChange}
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
              <FormHelperText mb={2}>
                This value is the slug value of a corresponding BC Data
                Catalogue entry: https://catalogue.data.gov.bc.ca/dataset/
                <Text as="mark">{selected ? selected.name : '<not set>'}</Text>
              </FormHelperText>
              <Input
                {...getRootProps(
                  { refKey: 'innerRef' },
                  { suppressRefError: true }
                )}
                {...getInputProps()}
                defaultValue={dataset?.id}
                variant="bc-input"
              />
              <input
                type="hidden"
                name="dataset"
                defaultValue={dataset?.id}
                value={selected?.id}
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
                    .map((d, index, arr) => (
                      <Box
                        key={d.id}
                        px={4}
                        py={2}
                        borderBottomRightRadius={
                          index === arr.length - 1 ? 2 : 0
                        }
                        borderBottomLeftRadius={
                          index === arr.length - 1 ? 2 : 0
                        }
                        {...getItemProps({
                          key: d.id,
                          index,
                          item: d,
                          style: {
                            color:
                              highlightedIndex === index ? 'white' : 'inherit',
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
      </FormControl>
    </>
  );
};

export default DatasetInput;

const query = gql`
  query GetAllDatasets($search: String!, $first: Int) {
    allDatasets(search: $search, first: $first) {
      id
      name
      title
    }
  }
`;
