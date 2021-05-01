export enum SchemaType {
    ListQuery, ItemQuery, Mutation
}

export interface AliasConfig {
    gqlName: string,
    list: string,
    type: SchemaType
    filter: Function
}

export interface AliasType {
    name: string,
    list: string
}