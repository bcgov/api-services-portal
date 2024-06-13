import { Controller, Get, Path, Route, Tags } from 'tsoa';

import { PredefinedRolePermissions } from '../../services/org-groups';

@Route('roles')
@Tags('Organizations')
export class OrgRoleController extends Controller {
  @Get()
  public async getRoles(): Promise<any> {
    return PredefinedRolePermissions;
  }
}
