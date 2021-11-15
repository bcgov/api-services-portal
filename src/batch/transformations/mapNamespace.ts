export function mapNamespace(
  keystone: any,
  transformInfo: any,
  currentData: any,
  inputData: any,
  key: string
) {
  if (inputData['tags'] != null) {
    const val = inputData['tags']
      .filter(
        (tag: string) => tag.startsWith('ns.') && tag.indexOf('.', 3) == -1
      )
      .map((tag: string) => tag.substring(3))[0];
    // if (
    //   currentData != null &&
    //   currentData[key] != val &&
    //   transformInfo.update === false
    // ) {
    //   throw Error('Namespace can not be updated.');
    // }
    return currentData != null && currentData[key] === val ? null : val;
  } else {
    return null;
  }
}
