import * as React from 'react';
import {
  Box,
  ButtonGroup,
  Divider,
  Grid,
  GridItem,
  Heading,
  Icon,
  IconButton,
  Text,
} from '@chakra-ui/react';
import groupBy from 'lodash/groupBy';
import { GatewayPlugin } from '@/shared/types/query.types';
import { FaDoorClosed, FaTrafficLight, FaTrash } from 'react-icons/fa';

import ModelIcon from '../model-icon/model-icon';
import IpRestriction from '../controls/ip-restriction';
import RateLimiting from '../controls/rate-limiting';
import DeleteControl from './delete-control';

interface ControlsListProps {
  consumerId: string;
  data: GatewayPlugin[];
}

const ControlsList: React.FC<ControlsListProps> = ({ consumerId, data }) => {
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
  const dataByPlugin = groupBy(data, 'name');
  const plugins = Object.keys(dataByPlugin);

  return (
    <>
      {plugins.map((p) => (
        <Box
          key={p}
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
              <Icon as={getIcon(p)} color="blue.700" boxSize="1.5rem" />
            </GridItem>
            <GridItem display="flex" alignItems="center">
              <Heading size="md">{p}</Heading>
            </GridItem>
          </Grid>
          <Divider />
          {dataByPlugin[p].map((d) => (
            <React.Fragment key={d.id}>
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
                        <IpRestriction
                          data={d}
                          id={d.id}
                          queryKey={['consumer', d.id]}
                          mode="edit"
                        />
                      )}
                      {d.name === 'rate-limiting' && (
                        <RateLimiting
                          data={d}
                          id={d.id}
                          queryKey={['consumer', d.id]}
                          mode="edit"
                        />
                      )}
                      <DeleteControl consumerId={consumerId} id={d.id} />
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
                        <IpRestriction
                          id={d.id}
                          queryKey={['consumer', d.id]}
                          mode="edit"
                          data={d}
                        />
                      )}
                      {d.name === 'rate-limiting' && (
                        <RateLimiting
                          id={d.id}
                          queryKey={['consumer', d.id]}
                          mode="edit"
                          data={d}
                        />
                      )}
                      <DeleteControl consumerId={consumerId} id={d.id} />
                    </ButtonGroup>
                  </GridItem>
                </Grid>
              )}
            </React.Fragment>
          ))}
        </Box>
      ))}
    </>
  );
};

export default ControlsList;
