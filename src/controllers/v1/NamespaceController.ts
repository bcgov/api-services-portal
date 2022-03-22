import {
  Controller,
  OperationId,
  Request,
  Get,
  Path,
  Route,
  Security,
} from 'tsoa';
import { KeystoneService } from '../ioc/keystoneInjector';
import { inject, injectable } from 'tsyringe';
import { gql } from 'graphql-request';
import { WorkbookService } from '../../services/report/workbook.service';
import { Namespace } from '@/services/keystone/types';
import { Logger } from '../../logger';

import { Readable } from 'stream';

/**
 * @param binary Buffer
 * returns readableInstanceStream Readable
 */
function bufferToStream(binary: any) {
  const readableInstanceStream = new Readable({
    read() {
      this.push(binary);
      this.push(null);
    },
  });

  return readableInstanceStream;
}

const logger = Logger('controllers.Namespace');

@injectable()
@Route('/namespaces')
@Security('jwt')
export class NamespaceController extends Controller {
  private keystone: KeystoneService;
  constructor(@inject('KeystoneService') private _keystone: KeystoneService) {
    super();
    this.keystone = _keystone;
  }

  @Get('/report')
  @OperationId('report')
  public async report(@Request() req: any): Promise<any> {
    const workbookService = new WorkbookService(
      this.keystone.createContext(req, true)
    );
    const workbook = await workbookService.buildWorkbook();
    const buffer = await workbook.xlsx.writeBuffer();

    req.res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    req.res.setHeader(
      'Content-Disposition',
      'attachment; filename="bcgov_app_namespaces.xlsx"'
    );

    const mystream = bufferToStream(buffer);
    mystream.pipe(req.res);
    await new Promise((resolve, reject) => {
      mystream.on('end', () => {
        req.res.end();
        resolve(null);
      });
    });

    return null;
  }

  @Get()
  @OperationId('namespace-list')
  public async list(@Request() request: any): Promise<string[]> {
    const result = await this.keystone.executeGraphQL({
      context: this.keystone.createContext(request),
      query: list,
    });
    logger.debug('Result %j', result);
    return result.data.allNamespaces.map((ns: Namespace) => ns.name);
  }
}

const list = gql`
  query Namespaces {
    allNamespaces {
      name
    }
  }
`;
