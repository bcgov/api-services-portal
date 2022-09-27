import * as React from 'react';
import {
  Box,
  Center,
  Heading,
  Tag,
  TagCloseButton,
  TagLabel,
  TagRightIcon,
  Text,
  Wrap,
  WrapItem,
} from '@chakra-ui/react';
import { useApi } from '@/shared/services/api';
import { gql } from 'graphql-request';
import { useAuth } from '@/shared/services/auth';
import { FaGripVertical } from 'react-icons/fa';
import { Environment, GatewayService } from '@/shared/types/query.types';

const dataTransferType = 'application/service';

interface ConfigureEnvironmentProps {
  environment: Environment;
}

const ConfigureEnvironment: React.FC<ConfigureEnvironmentProps> = ({
  environment,
}) => {
  const dragRef = React.useRef<string>(null);
  const [hasDragTarget, setDragTarget] = React.useState<boolean>(false);
  const [activeServices, setActiveServices] = React.useState(() => {
    try {
      return environment.services;
    } catch {
      return [];
    }
  });
  const auth = useAuth();
  const { data, isSuccess, isLoading } = useApi(
    ['allGatewayServices'],
    {
      query,
      variables: { ns: auth.user.namespace },
    },
    { suspense: false, enabled: Boolean(auth?.user.namespace) }
  );

  const handleDragStart = (d: GatewayService) => (
    event: React.DragEvent<HTMLDivElement>
  ) => {
    const data = JSON.stringify(d);
    dragRef.current = data;
    event.dataTransfer.setData(dataTransferType, data);
    event.dataTransfer.effectAllowed = 'move';
  };
  const handleDragEnd = () => {
    setActiveServices((state) => [...state, JSON.parse(dragRef.current)]);
    setDragTarget(true);
  };
  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    setDragTarget(true);
  };
  const handleDragExit = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragTarget(false);
  };
  const handleRemoveService = (id: string) => () => {
    setActiveServices((state) => state.filter((s) => s.id !== id));
  };

  return (
    <div>
      <Heading size="sm" mb={8}>
        {`Active Services (${activeServices.length ?? 0})`}
      </Heading>
      <Box
        border="1px dashed"
        borderColor={hasDragTarget ? 'bc-blue' : 'bc-component'}
        bgColor="bc-gray"
        borderRadius="4px"
        p={8}
        mb={8}
        minHeight="130px"
        onDragOver={handleDragOver}
        onDragExit={handleDragExit}
      >
        {activeServices.length <= 0 && (
          <Center height="calc(130px - 60px)">
            <Box textAlign="center">
              <Heading size="sm">Drag and Drop</Heading>
              <Text>available services here to activate them</Text>
            </Box>
          </Center>
        )}
        {activeServices.length > 0 && (
          <Wrap>
            {activeServices.map((s) => (
              <WrapItem key={s.id}>
                <Tag variant="solid" colorScheme="green">
                  <TagLabel>{s.name}</TagLabel>
                  <TagCloseButton onClick={handleRemoveService(s.id)} />
                </Tag>
              </WrapItem>
            ))}
          </Wrap>
        )}
      </Box>
      {isSuccess && (
        <>
          <Heading size="sm" mb={8}>
            {`Available Services (${data.allGatewayServices.length ?? 0})`}
          </Heading>
          <Box>
            <Wrap>
              {data.allGatewayServices
                .filter((s) => !activeServices.map((a) => a.id).includes(s.id))
                .map((s) => (
                  <WrapItem key={s.id}>
                    <Tag
                      draggable
                      cursor="move"
                      onDragEnd={handleDragEnd}
                      onDragStart={handleDragStart(s)}
                      variant="drag"
                    >
                      <TagLabel>{s.name}</TagLabel>
                      <TagRightIcon as={FaGripVertical} />
                    </Tag>
                  </WrapItem>
                ))}
            </Wrap>
          </Box>
        </>
      )}
    </div>
  );
};

export default ConfigureEnvironment;

const query = gql`
  query GetAllGatewayServices($ns: String!) {
    allGatewayServices(where: { namespace: $ns }) {
      id
      name
      environment {
        id
      }
    }
  }
`;
