import { styles } from '@/shared/styles/devportal.css';

import graphql from '@/shared/services/graphql'

import { REMOVE, APPROVE, REJECT } from './queries'

import { HStack, Button } from "@chakra-ui/react"

import NameValue from '@/components/name-value';

import { Tr, Th, Td, Tag, TagLabel } from "@chakra-ui/react"

const goto = (url) => { window.location.href = url; return false; }

const Item = ({refetch, accessRequest}) => (
    <>
    { accessRequest ? (
        <Tr>
            <Td>{accessRequest.createdAt}</Td>
            <Td>{accessRequest.requestor.name}</Td>
            <Td>{accessRequest.application?.name}</Td>
            <Td>{accessRequest.productEnvironment?.product?.name}</Td>
            <Td>{accessRequest.productEnvironment?.name}</Td>
            <Td>
                { accessRequest.isApproved === null || accessRequest.isApproved === false ? (
                    <HStack spacing={4}>
                        <Button colorScheme="blue" onClick={(e) => goto(`/manager/poc/requests/issue/${accessRequest.id}`)}>Approve</Button>
                        {/* <Button colorScheme="blue" onClick={() => {
                            graphql(APPROVE, { id: props.accessRequest.id }).then(props.refetch);
                        }}>Approve</Button> */}
                        <Button colorScheme="red" onClick={() => {
                            graphql(REJECT, { id: accessRequest.id }).then(refetch);
                        }}>Reject</Button>
                    </HStack>
                ) : false }
                { accessRequest.isApproved && accessRequest.isIssued == null ? (
                    <HStack spacing={4}>
                        <Button colorScheme="blue" onClick={(e) => goto(`/manager/poc/requests/issue/${accessRequest.id}`)}>Send Credentials</Button>
                        <Button colorScheme="red" onClick={() => {
                            graphql(REJECT, { id: accessRequest.id }).then(refetch);
                        }}>Reject</Button>
                    </HStack>

                ) : false}
                { accessRequest.isComplete && !accessRequest.isApproved ? (
                        <p style={styles.message}>Request Rejected</p>
                ): false }
                { accessRequest.isIssued && accessRequest.isComplete == null ? (
                        <p style={styles.message}>Credentials Sent to Requestor</p>
                ): false }
                { accessRequest.isComplete == true ? (
                    <p>CLOSED</p>
                ): false }
                { accessRequest.serviceAccess?.id}
          </Td>
        </Tr>

  ):false }
  </>
)

export default Item