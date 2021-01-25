
import * as React from 'react';

const { useEffect, useState } = React;

import { Switch, Box, HStack, Input, SimpleGrid } from "@chakra-ui/react"

const GenericControl = ({meta = { name: "", config: []}}) => {
    let [active, setActive] = useState(false);

    return (
        <Box maxW="sm" borderWidth="0px" borderRadius="lg" overflow="hidden">
            <HStack spacing={3}>
                <Switch size="sm" onChange={(e) => setActive(!active)} isChecked={active}/>
                <span>{meta.name}</span>
            </HStack>
            { active && (
                <Box maxW="sm" borderWidth="0px" borderRadius="lg" overflow="hidden">
                    <SimpleGrid columns={2} spacing={0}>
                    { meta.config.map (c => (
                        <>
                        <Box
                            mt="1"
                            fontWeight="semibold"
                            as="span"
                            lineHeight="tight"
                            isTruncated
                            >
                            {c.label}
                        </Box>
                        <Box
                            mt="1"
                            as="span"
                            lineHeight="tight"
                            isTruncated
                            >
                            <Input placeholder={c.placeholder} value={c.value}/>
                        </Box>
                        </>
                    ))}
                    </SimpleGrid>
                </Box>
            )}
        </Box>
    )
}


export default GenericControl;
