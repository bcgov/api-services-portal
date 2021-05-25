
export function connectExclusiveList (keystone: any, transformInfo: any, currentData: any, inputData: any, fieldKey: string) {
    return {
        disconnectAll: true,
        connect: inputData[fieldKey + "_ids"].map((id:string) => { return { id: id}})
    }
}