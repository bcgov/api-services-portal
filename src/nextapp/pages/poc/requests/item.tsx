import { styles } from '../../../shared/styles/devportal.css';

import graphql from '../../../shared/services/graphql'

import { REMOVE, APPROVE, REJECT } from './queries'

import { HStack, Button } from "@chakra-ui/react"

import NameValue from '../../../components/name-value';

import { Tr, Th, Td, Tag, TagLabel } from "@chakra-ui/react"

const goto = (url) => { window.location.href = url; return false; }

const Item = props => (
    <>
    { props && props.accessRequest ? (
        <Tr>
            <Td>{props.accessRequest.createdAt}</Td>
            <Td>{props.accessRequest.requestor.name}</Td>
            <Td>{ props.accessRequest.application && (
                <p>{props.accessRequest.application.name}</p>
                )}
            </Td>
            <Td>{ props.accessRequest.packageEnvironment && props.accessRequest.packageEnvironment.package && (
                <p>{props.accessRequest.packageEnvironment.package.name}</p>
                )}
            </Td>
            <Td>{ props.accessRequest.packageEnvironment && (
                <p>{props.accessRequest.packageEnvironment.name}</p>
                )}
            </Td>
            <Td>
                { props.accessRequest.isApproved === null ? (
                    <HStack spacing={4}>
                        <Button colorScheme="blue" onClick={() => {
                            graphql(APPROVE, { id: props.accessRequest.id }).then(props.refetch);
                        }}>Approve</Button>
                        <Button colorScheme="red" onClick={() => {
                            graphql(REJECT, { id: props.accessRequest.id }).then(props.refetch);
                        }}>Reject</Button>
                    </HStack>
                ) : false }
                { props.accessRequest.isApproved && props.accessRequest.isIssued == null ? (
                    <HStack spacing={4}>
                        <Button colorScheme="blue" onClick={(e) => goto(`/poc/requests/issue/${props.accessRequest.id}`)}>Send Credentials</Button>
                        <Button colorScheme="red" onClick={() => {
                            graphql(REJECT, { id: props.accessRequest.id }).then(props.refetch);
                        }}>Reject</Button>
                    </HStack>

                ) : false}
                { props.accessRequest.isComplete && !props.accessRequest.isApproved ? (
                        <p style={styles.message}>Request Rejected</p>
                ): false }
                { props.accessRequest.isIssued && props.accessRequest.isComplete == null ? (
                        <p style={styles.message}>Credentials Sent to Requestor</p>
                ): false }
                { props.accessRequest.isComplete == true ? (
                    <p>CLOSED</p>
                ): false }
          </Td>
        </Tr>

  ):false }
  </>
)

export default Item