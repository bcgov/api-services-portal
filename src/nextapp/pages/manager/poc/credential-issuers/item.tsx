import graphql from '@/shared/services/graphql'

import { HStack, Button } from "@chakra-ui/react"

import { Tr, Th, Td, Tag, TagLabel } from "@chakra-ui/react"

const goto = (url) => { window.location.href = url; return false; }

const Item = ({refetch, issuer}) => (
    <>
    { issuer ? (
        <Tr>
            <Td>{issuer.name}</Td>
            <Td>{issuer.owner?.username}</Td>
            <Td>{issuer.flow}</Td>
            <Td>{issuer.mode}</Td>
            <Td>{[...new Set(issuer.environments.map(g => g.product.name))]}</Td>
            <Td><Button variant="secondary" onClick={(e) => goto(`/manager/poc/credential-issuers/issuer/${issuer.id}`)}>View</Button></Td>
        </Tr>
  ):false }
  </>
)

export default Item