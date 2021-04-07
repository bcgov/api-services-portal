import * as React from 'react';
import {
  Badge,
  Box,
  Button,
  Divider,
  Heading,
  Icon,
  Link,
  SimpleGrid,
  Stack,
  Tag,
  TagLabel,
  Text,
  Wrap,
  WrapItem,
} from '@chakra-ui/react';
import NextLink from 'next/link';
import { Product } from '@/shared/types/query.types';
import { FaBook } from 'react-icons/fa';

interface DiscoveryListItemProps {
  data: Product;
}

const DiscoveryListItem: React.FC<DiscoveryListItemProps> = ({ data }) => {
  return (
    <Box
      bg="white"
      borderRadius={4}
      border="2px solid"
      borderColor="gray.400"
      position="relative"
      overflow="hidden"
    >
      <Box
        as="header"
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        mb={2}
        p={4}
        pb={2}
      >
        <Box
          as="hgroup"
          display="flex"
          alignItems="center"
          justifyContent="center"
          overflow="hidden"
          mr={2}
          maxW="75%"
        >
          <Heading isTruncated size="md" lineHeight="1.5">
            <Icon as={FaBook} mr={2} color="bc-blue-alt" />
            {data.name}
          </Heading>
        </Box>
        <NextLink href={`/devportal/requests/new/${data.id}`}>
          <Button size="sm" variant="primary">
            Request Access
          </Button>
        </NextLink>
      </Box>
      <Divider />
      <Box p={4}>
        <Box
          as="dl"
          sx={{
            '& dd': {
              mb: 2,
            },
          }}
        >
          <Heading as="dt" size="sm">
            Organization
          </Heading>
          <Text as="dd">{data.organization?.title}</Text>
          <Heading as="dt" size="sm">
            Description
          </Heading>
          <Text as="dd">
            {data.description ?? <Text as="em">No description added</Text>}
            {data.dataset != null && (
                <>
                                                <div><b><a href={`https://catalogue.data.gov.bc.ca/dataset/${data.dataset.name}`} target="_blank" rel="noreferrer">{data.dataset.title} <Badge>BCDC</Badge></a></b></div>
                                                <div>
                                                    {data.dataset.notes.length > 175 ? data.dataset.notes.substring(0,175) + "..." : data.dataset.notes}
                                                </div>
                                                <SimpleGrid columns={2}>
                                                    {[{l:'Sector',f:'sector'},{l:'License',f:'license_title'},{l:'Who can Access?',f:'view_audience'},{l:'Security Class',f:'security_class'},{l:'First Published?',f:'record_publish_date'}].map(rec => (
                                                        <>
                                                            <div style={{textAlign:'right', paddingRight:'20px'}}><b>{rec.l}</b></div>
                                                            <div>{data.dataset[rec.f]}</div>
                                                        </>
                                                    ))}  
                
                                                </SimpleGrid>       
                                                <Stack direction="row" wrap="wrap" spacing={1} shouldWrapChildren={true}>{Array.isArray(JSON.parse(data.dataset.tags)) ? JSON.parse(data.dataset.tags).map(p => (
                                                    <Tag key={p} size="sm" colorScheme="orange" borderRadius="5px">
                                                        <TagLabel>{p}</TagLabel>
                                                    </Tag>
                                                )) : false}</Stack>
                    </>
            )}
          </Text>
        </Box>
      </Box>
      <Divider />
      <Wrap p={4} spacing={2} bgColor="gray.50">
        <WrapItem>
          <Text fontWeight="bold" textTransform="uppercase" color="gray.600">
            Environments
          </Text>
        </WrapItem>
        {data.environments.map((e) => (
          <WrapItem key={e.id}>
            <Badge colorScheme="green" fontSize="md">
              {e.name}
            </Badge>
          </WrapItem>
        ))}
      </Wrap>
    </Box>
  );
};

export default DiscoveryListItem;
