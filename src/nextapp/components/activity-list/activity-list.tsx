import * as React from 'react';
import { 
    Avatar, 
    Badge,
    Box,
    Flex, 
    Grid,
    Text,
    VStack 
} from '@chakra-ui/react';
import { Activity } from '@/shared/types/query.types'
import NameValue from '../name-value'
import formatDistanceToNow from 'date-fns/formatDistanceToNow';

interface ActivityListProps {
    data: Activity[];
}
  
function getContext(jsonString: string) : any {
    if (jsonString) {
        const data = JSON.parse(jsonString)
        const result = []
        Object.keys(data).map((r:string) => {
            result.push({name: r, value: JSON.stringify(data[r])})
        })
        return result
    }
    return []
}


const ActivityList: React.FC<ActivityListProps> = ({ data }) => {
    const total = data?.length ?? 0;
  
    return (
        <Grid gap={2}>
            {data.map((item, index) => (
                
                <Flex align="center" alignItems="top" p={2}>
                    <Avatar name={item.actor?.name} size="sm" mr={2} />
                    <VStack align="left" m={1}>
                        <Flex align="center">
                            <Text
                            color="#4183c4"
                            fontWeight={600}
                            fontSize="sm"
                            whiteSpace="nowrap"
                            textOverflow="ellipsis"
                            overflow="hidden"
                            >
                            {item.actor?.name}
                            </Text>
                            <Text pl={1} fontSize="sm" fontWeight={600}>
                            {item.message ? item.message : `${item.action} ${item.type}`}
                            </Text>
                            <Text pl={2} fontSize="0.8em" color="rgba(0,0,0,.4)">{`${formatDistanceToNow(new Date(item.createdAt))} ago`}</Text>
                        </Flex>
                        <Box fontSize="sm">
                            <VStack align="left" p={2} bg="">
                            { getContext(item.context).map((ctx:any) => (
                                <NameValue name={ctx.name} value={ctx.value} width="150px"/>
                            ))}
                            </VStack>
                            <ul>
                                <li ><Text fontSize="0.8em" color="rgba(0,0,0,.4)">{item.name}</Text></li>
                                <li ><Text fontSize="0.8em" color="rgba(0,0,0,.4)">{item.type} / {item.refId}</Text></li>
                                <li ><Text fontSize="0.8em" color="rgba(0,0,0,.4)">EXT REF ID: {item.extRefId}</Text></li>
                            </ul>
                            { item.result == 'failed' && (
                                <Badge colorScheme="red" fontSize="sm" variant="solid">{item.result}</Badge>
                            )}
                        </Box>
                    </VStack>
                </Flex>
            ))}
        </Grid>
    )
}

export default ActivityList
