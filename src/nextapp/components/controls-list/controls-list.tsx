import * as React from 'react';
import {
  Box,
  Button,
  ButtonGroup,
  Divider,
  Grid,
  GridItem,
  Heading,
  Icon,
  IconButton,
  Text,
} from '@chakra-ui/react';
import { GatewayPlugin } from '@/shared/types/query.types';
import { FaDoorClosed, FaPen, FaTrafficLight, FaTrash } from 'react-icons/fa';

import ModelIcon from '../model-icon/model-icon';
import IpRestriction from '../controls/ip-restriction';
import RateLimiting from '../controls/rate-limiting';

interface ControlsListProps {
  data: GatewayPlugin[];
}

const ControlsList: React.FC<ControlsListProps> = ({ data }) => {
  const getIcon = React.useCallback((name: string) => {
    switch (name) {
      case 'rate-limiting':
        return FaTrafficLight;
      case 'ip-restriction':
        return FaDoorClosed;
      default:
        return null;
    }
  }, []);

  return (
    <>
      {data.map((d) => (
        <Box
          key={d.id}
          mb={4}
          bgColor="white"
          boxShadow="0 2px 5px rgba(0, 0, 0, 0.1)"
        >
          <Grid
            templateColumns="30px 1fr auto"
            gap={4}
            sx={{
              '& > div': {
                py: 2,
              },
            }}
          >
            <GridItem display="flex" alignItems="center" pl={2}>
              <Icon as={getIcon(d.name)} color="blue.700" boxSize="1.5rem" />
            </GridItem>
            <GridItem display="flex" alignItems="center">
              <Heading size="md">{d.name}</Heading>
            </GridItem>
          </Grid>
          <Divider />
          {d.service && (
            <Grid
              templateColumns="30px 1fr auto"
              gap={4}
              bgColor="blue.50"
              sx={{
                '& > div': {
                  py: 2,
                },
              }}
            >
              <GridItem pl={2}>
                <ModelIcon model="service" size="xs" />
              </GridItem>
              <GridItem>
                <Text>{d.service.name}</Text>
              </GridItem>
              <GridItem pr={2}>
                <ButtonGroup>
                  {d.name === 'ip-restriction' && (
                    <IpRestriction queryKey={['consumer', d.id]} mode="edit" />
                  )}
                  {d.name === 'rate-limiting' && (
                    <RateLimiting queryKey={['consumer', d.id]} mode="edit" />
                  )}
                  <IconButton
                    aria-label="remove control button"
                    icon={<Icon as={FaTrash} />}
                    variant="outline"
                    size="xs"
                    colorScheme="red"
                  />
                </ButtonGroup>
              </GridItem>
            </Grid>
          )}
          {d.route && (
            <Grid
              templateColumns="30px 1fr auto"
              gap={4}
              bgColor="blue.50"
              sx={{
                '& > div': {
                  py: 2,
                },
              }}
            >
              <GridItem pl={2}>
                <ModelIcon model="route" size="xs" />
              </GridItem>
              <GridItem>
                <Text>{d.route.name}</Text>
              </GridItem>
              <GridItem pr={2}>
                <ButtonGroup>
                  {d.name === 'ip-restriction' && (
                    <IpRestriction queryKey={['consumer', d.id]} mode="edit" />
                  )}
                  {d.name === 'rate-limiting' && (
                    <RateLimiting queryKey={['consumer', d.id]} mode="edit" />
                  )}
                  <IconButton
                    aria-label="remove control button"
                    icon={<Icon as={FaTrash} />}
                    variant="outline"
                    size="xs"
                    colorScheme="red"
                  />
                </ButtonGroup>
              </GridItem>
            </Grid>
          )}
        </Box>
      ))}
    </>
  );
};

export default ControlsList;
