
export function toStringDefaultArray (keystone: any, transformInfo: any, currentData: any, inputData: any, key: string) {
    return inputData[key] ==  null || (currentData != null && currentData[key] === JSON.stringify(inputData[key])) ? null:JSON.stringify(inputData[key])
}
