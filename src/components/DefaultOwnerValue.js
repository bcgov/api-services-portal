
const DefaultOwnerValue = ({ context }) => {
    if (context) {
        console.log(JSON.stringify(context.authedItem, null, 5))
        console.log(JSON.stringify(context.user, null, 5))
    }
    return context.authedItem ? { connect: { id: context.user.userId } } : undefined
}

module.exports = { DefaultOwnerValue }