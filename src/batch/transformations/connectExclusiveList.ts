export function connectExclusiveList(
  keystone: any,
  transformInfo: any,
  currentData: any,
  inputData: any,
  fieldKey: string
) {
  if (
    fieldKey in currentData &&
    currentData[fieldKey] != null &&
    currentData[fieldKey]
      .map((d: any) => d.id)
      .sort()
      .join(' ') === inputData[fieldKey + '_ids'].sort().join(' ')
  ) {
    return null;
  }
  return {
    disconnectAll: true,
    connect: inputData[fieldKey + '_ids'].map((id: string) => {
      return { id: id };
    }),
  };
}
