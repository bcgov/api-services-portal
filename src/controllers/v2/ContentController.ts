import {
  Controller,
  Request,
  Get,
  Put,
  Path,
  Route,
  Security,
  Body,
  OperationId,
  Tags,
} from 'tsoa';
import { KeystoneService } from '../ioc/keystoneInjector';
import { inject, injectable } from 'tsyringe';
import {
  getRecords,
  parseJsonString,
  removeEmpty,
  removeKeys,
  syncRecords,
} from '../../batch/feed-worker';
import express from 'express';
import multer from 'multer';
import { DateTime, Markdown } from '@keystonejs/fields';
import { Content } from './types';
import { BatchResult } from '../../batch/types';

@injectable()
@Route('/namespaces/{ns}/contents')
@Security('jwt', ['Content.Publish'])
@Tags('Documentation')
export class ContentController extends Controller {
  private keystone: KeystoneService;
  constructor(@inject('KeystoneService') private _keystone: KeystoneService) {
    super();
    this.keystone = _keystone;
  }

  @Put()
  @OperationId('put-content')
  public async putContent(
    @Path() ns: string,
    @Body() body: Content,
    @Request() request: any
  ): Promise<BatchResult> {
    body['namespace'] = ns;
    return await syncRecords(
      this.keystone.createContext(request),
      'Content',
      body['externalLink'],
      body
    );
  }

  @Get()
  @OperationId('get-gateway-routes')
  @Security('jwt', ['Namespace.Manage'])
  public async get(
    @Path() ns: string,
    @Request() request: any
  ): Promise<any[]> {
    const ctx = this.keystone.createContext(request);
    const records = await getRecords(
      ctx,
      'Content',
      'allContentsByNamespace',
      []
    );

    return records
      .map((o) => removeEmpty(o))
      .map((o) => parseJsonString(o, ['tags']))
      .map((o) => removeKeys(o, ['id', 'namespace']));
  }

  // @Put('{contentId}/markdown')
  // public async putMarkdown(
  //   @Path() ns: string,
  //   @Path() contentId: string,
  //   @Request() request: any
  // ): Promise<any> {
  //   await this.handleFile(request);
  //   return await syncRecords(
  //     this.keystone.createContext(request),
  //     'ContentBySlug',
  //     contentId,
  //     { content: request.file.buffer.toString() }
  //   );
  // }

  // @Put('{contentId}/markdownv2')
  // public async putMarkdownV2(
  //   @Path() ns: string,
  //   @Path() contentId: string,
  //   @Body() body: any,
  //   @Request() request: any
  // ): Promise<any> {
  //   //await this.handleFile(request);
  //   console.log('B=' + body);
  //   console.log('BK=' + Object.keys(body));
  //   return await syncRecords(
  //     this.keystone.createContext(request),
  //     'ContentBySlug',
  //     contentId,
  //     { content: body.toString() }
  //   );
  // }

  // private handleFile(request: express.Request): Promise<any> {
  //   const multerSingle = multer().single('content');
  //   return new Promise((resolve, reject) => {
  //     multerSingle(request, undefined, async (error: any) => {
  //       if (error) {
  //         reject(error);
  //       }
  //       resolve(null);
  //     });
  //   });
  // }
}
