export function connectExclusiveList(
  keystone: any,
  transformInfo: any,
  currentData: any,
  inputData: any,
  fieldKey: string
) {
  if (
    currentData != null &&
    fieldKey in currentData &&
    currentData[fieldKey] &&
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
