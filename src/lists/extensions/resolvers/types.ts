export enum SchemaType {
    ListQuery, ItemQuery, Mutation
}

export interface AliasConfig {
    gqlName: string,
    list: string,
    type: SchemaType
}