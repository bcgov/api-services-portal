import { Keystone } from "@keystonejs/keystone";
import { injectable } from "tsyringe";
import { scopesToRoles } from '../../auth/scopes-to-roles'

@injectable()
export class KeystoneService {
  private keystone : any
  constructor(private _keystone: any) {
      this.keystone = _keystone
  }

  public context() : Keystone {
      return this.keystone
  }

  public createContext(request: any) : any {
      const identity = { 
          id: null,
          username: request.user['preferred_username'],
          namespace: request.user['namespace'],
          roles: scopesToRoles(request.user.scope),
          userId: null
      } as any
      return this.keystone.createContext({ skipAccessControl: false, authentication: { item: identity }})      
  }

  public executeGraphQL({ context, query, variables }: any) {
      return this.keystone.executeGraphQL({ context, query, variables })
  }
}
