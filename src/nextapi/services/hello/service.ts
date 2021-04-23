import api from '@/shared/services/api'
import { Service, ServiceContext } from '@/services/context'

import Hello from './hello'

export class HelloService extends Service {
    constructor(context: ServiceContext) {
        super(context)
    }

    public async getHello(userName: string): Promise<Hello> {
        const data = await api(query, { }, { ...{headers : this.context.headers}, ...{ssr: false} }).catch (err => {
            console.log("Caught err " + JSON.stringify(err, null, 5))
            return { error: 'Failed to call API'}
        })

        return { name : "Hello again " + userName, accessRequestIds: data.allAccessRequests}
    }
}


const query = `
    query a {
        allAccessRequests {
            id
        }
    }`
