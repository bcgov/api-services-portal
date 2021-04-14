
import { HStack, Tag, TagCloseButton, TagLabel } from "@chakra-ui/react"

const Scopes = ({scopes, color, revokeAccess}) => {
    return (
        <HStack spacing={1}>{scopes?.sort((a,b) => a.name.localeCompare(b.name)).map(tag => (
            <Tag key={tag.id} size="md" colorScheme={color} borderRadius="full">
                <TagLabel>{tag.name}</TagLabel>
                { revokeAccess != null && (
                    <TagCloseButton onClick={() => revokeAccess([tag.ticketId])}/>
                )}
            </Tag>
    ))}</HStack>)
}
export default Scopes