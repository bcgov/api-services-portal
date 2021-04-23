
export interface ServiceContext {
    headers: HeadersInit
}

export class Service {
    context: ServiceContext

    constructor(context: ServiceContext) {
        this.context = context
    }
}