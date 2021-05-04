import * as React from 'react';
import {
    Alert,
    AlertTitle,
    AlertDescription,
    AlertIcon,
    Box,
    CloseButton,
} from '@chakra-ui/react';

import ReactMarkdownWithHtml from 'react-markdown/with-html';
import gfm from 'remark-gfm';

const { useEffect, useState } = React

function ViewSecret({cred, defaultShow, instruction, onClose}) {
    const [show, setShow] = React.useState(defaultShow)
    const handleClick = () => { setShow(!show); onClose() }
  
    useEffect (() => setShow(true), [cred])

    return show ? (
        <Alert
        status="warning" p={4}
        >
            <AlertIcon/>
            <Box flex="1">
                <AlertTitle>
                    Your new credentials:
                </AlertTitle>
                <AlertDescription>
                    Take note of these credentials, you will only see them once.
                    { instruction != null && (
                            <ReactMarkdownWithHtml allowDangerousHtml plugins={[gfm]}>{instruction}</ReactMarkdownWithHtml>
                    )}
                    {[
                        {name:'apiKey', label:'API Key'}, 
                        {name:'clientId', label:'Client ID'}, 
                        {name:'clientSecret', label:'Client Secret'},
                        {name:'privateKey', label:'Signing Key'},
                        {name:'certificate', label:'Signing Certificate'},
                        {name:'tokenEndpoint', label:'Token Endpoint'}
                    ].filter(c => c.name in cred).map(c => (
                        <Box><strong>{c.label} :</strong> {cred[c.name]}</Box>
                    ))}
                </AlertDescription>
            </Box>
            <CloseButton position="absolute" right="8px" top="8px" onClick={handleClick}/>
        </Alert>

    ) : ( <></> )
}

export default ViewSecret
