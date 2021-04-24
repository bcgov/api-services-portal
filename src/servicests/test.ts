

export interface Hello {
    name: string
}

export class HelloService {
    public async getHello(userName: string): Promise<Hello> {
        return { name : "Wah version 2! " + userName}
    }
}
