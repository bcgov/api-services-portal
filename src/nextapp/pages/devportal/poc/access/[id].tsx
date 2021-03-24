import * as React from 'react';
import {
    Alert,
    AlertTitle,
    AlertDescription,
    AlertIcon,
    Button,
    Box,
    Container,
    Stack,
    VStack,
    Skeleton,
    CloseButton,
  } from '@chakra-ui/react';
import Head from 'next/head';
import PageHeader from '@/components/page-header';

import {
    useDisclosure
  } from "@chakra-ui/react"

import { GET_LIST, GET_REQUEST, GEN_CREDENTIAL } from './queries'

import { useAppContext } from '@/pages/context'

const { useEffect, useState } = React

import { styles } from '@/shared/styles/devportal.css'

import ReactMarkdownWithHtml from 'react-markdown/with-html';
import gfm from 'remark-gfm';

import graphql from '@/shared/services/graphql'

import tmpstyles from '../../docs/docs.module.css';

import List from './list'

import EnvironmentBadge from '@/components/environment-badge';

const customStyles = {
    content : {
      top                   : '30%',
      left                  : '20%',
      right                 : '20%',
      bottom                : 'auto',
      transformx             : 'translate(-50%, -50%)'
    },
    overlay: {
    }
};

function ViewSecret({cred, defaultShow, instruction}) {
    const [show, setShow] = React.useState(defaultShow)
    const handleClick = () => setShow(!show)
  
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

const MyApplicationsPage = () => {
    const context = useAppContext()

    const [request, setRequest] = useState(null)

    const [{ state, data}, setState] = useState({ state: 'loading', data: null });


    const fetch = () => {
        const { router: { pathname, query: { id } } } = context
        console.log("ID="+id)
        graphql(GET_LIST, {})
        .then(({ data }) => {
            setState({ state: 'loaded', data });            
            if (context['router'] != null && id) {
                console.log("ID="+id)
                setRequest(data.allAccessRequests.filter(r => r.id == id))
                generateCredential(id)
            }
        })
        .catch((err) => {
            setState({ state: 'error', data: null });
        });
        // if (context['router'] != null && id) {

        //     graphql(GET_REQUEST, { id: id }).then(data => {
        //         setRequestDetails(data)
        //     });
        // }
    
    };
    
    const [{cred,reqId}, setCred] = useState({cred:null, reqId:null});

    const generateCredential = (reqId) => {
        graphql(GEN_CREDENTIAL, { id: reqId }).then(data => {
            if (data.data.updateAccessRequest.credential != "NEW") {
                setCred({cred: JSON.parse(data.data.updateAccessRequest.credential), reqId: reqId})
            }
        });
    }

    useEffect(fetch, [context]);

    const cancelRequest = (id) => {}

    const { isOpen, onOpen, onClose } = useDisclosure()

    const actions = [
    ]
    return (
        <>
        <Head>
          <title>API Program Services | API Access</title>
        </Head>
        <Container maxW="6xl">
            <Stack spacing={10} className="m-5">
                <Alert status="info">
                    <AlertIcon />
                    List of the BC Government Service APIs that you have access to.
                </Alert>
            </Stack>

  
          <PageHeader title="API Access" actions={actions}>
          </PageHeader>
  
          <Box mt={5}>
            { request != null && cred != null && ( 
                <Box m={4}>
                    <article className={tmpstyles.markdownBody}>
                        <ViewSecret cred={cred} defaultShow={true} instruction={request[0].productEnvironment?.credentialIssuer?.instruction}/> 
                    </article>
                </Box>
            )}

            <List data={data} state={state} refetch={fetch} />

          </Box>
        </Container>
        </>

    )
}

export default MyApplicationsPage;

