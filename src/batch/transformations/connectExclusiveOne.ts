export function connectExclusiveOne(
  keystone: any,
  transformInfo: any,
  currentData: any,
  inputData: any,
  fieldKey: string
) {
  if (
    currentData != null &&
    currentData[fieldKey] &&
    'id' in currentData[fieldKey] &&
    currentData[fieldKey]['id'] == inputData[fieldKey + '_ids'][0]
  ) {
    return null;
  }
  return {
    // assuming there will be just one id
    connect: { id: inputData[fieldKey + '_ids'][0] },
  };
}
