import { Keystone } from '@keystonejs/keystone';
import { injectable } from 'tsyringe';
import { scopes, scopesToRoles } from '../../auth/scope-role-utils';
import { Logger } from '../../logger';

const logger = Logger('controller');

const resolveName = function (user: any) {
  for (const nm of ['name', 'clientId']) {
    if (nm in user) {
      return user[nm];
    }
  }
  return null;
};

const resolveUsername = function (user: any) {
  for (const nm of ['preferred_username', 'clientId']) {
    if (nm in user) {
      return user[nm];
    }
  }
  return null;
};

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

  public createContext(request: any, skipAccessControl: boolean = false): any {
    const _scopes = scopes(request.user.scope);

    const identityProvider = request.user.identity_provider;

    const identity = {
      id: null,
      name: resolveName(request.user),
      username: resolveUsername(request.user),
      namespace: request.params.ns || request.params.gatewayId,
      roles: JSON.stringify(scopesToRoles(identityProvider, _scopes)),
      scopes: _scopes,
      userId: null,
    } as any;
    logger.debug('identity %j', identity);
    const ctx = this.keystone.createContext({
      skipAccessControl,
      authentication: { item: identity },
    });
    ctx.req = request;
    return ctx;
  }

  public executeGraphQL({ context, query, variables }: any) {
    return this.keystone.executeGraphQL({ context, query, variables });
  }
}
