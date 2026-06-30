export async function lookupSubsystemNameById(
  context: any,
  subsystemId: string
): Promise<string | undefined> {
  const result = await context.executeGraphQL({
    query: `query SubsystemNameById($id: ID!) {
      allSubsystems(where: { id: $id }, first: 1) { name }
    }`,
    variables: { id: subsystemId },
  });
  return result.data?.allSubsystems?.[0]?.name;
}
