import { Keystone } from '@keystonejs/keystone';
import { injectable } from 'tsyringe';
import { scopes, scopesToRoles } from '../../auth/scopes-to-roles';

@injectable()
export class KeystoneService {
  private keystone: any;
  constructor(private _keystone: any) {
    this.keystone = _keystone;
  }

  public context(): Keystone {
    return this.keystone;
  }

  public sudo(): any {
    return this.keystone.createContext({ skipAccessControl: true });
  }

  public createContext(request: any): any {
    const _scopes = scopes(request.user.scope);
    const identity = {
      id: null,
      username: request.user['preferred_username'],
      namespace: request.user['namespace'],
      roles: scopesToRoles(_scopes),
      scopes: _scopes,
      userId: null,
    } as any;
    return this.keystone.createContext({
      skipAccessControl: true,
      authentication: { item: identity },
    });
  }

  public executeGraphQL({ context, query, variables }: any) {
    return this.keystone.executeGraphQL({ context, query, variables });
  }
}
