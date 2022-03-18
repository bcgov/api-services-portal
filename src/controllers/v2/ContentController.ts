import {
  Controller,
  Request,
  Delete,
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
  deleteRecord,
  getRecord,
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
import { strict as assert } from 'assert';
import { isServiceMissingAllPluginsHandler } from '@/services/workflow';

@injectable()
@Route('/namespaces/{ns}/contents')
@Tags('Documentation')
export class ContentController extends Controller {
  private keystone: KeystoneService;
  constructor(@inject('KeystoneService') private _keystone: KeystoneService) {
    super();
    this.keystone = _keystone;
  }

  /**
   * Get documentation for the namespace
   * > `Required Scope:` Content.Publish
   *
   * @summary Update Documentation
   *
   * @param ns
   * @param body
   * @param request
   * @returns
   */
  @Put()
  @OperationId('put-content')
  @Security('jwt', ['Content.Publish'])
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
  @OperationId('get-contents')
  @Security('jwt', ['Namespace.View'])
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

  /**
   * Delete Documention that was created for this namespace
   * > `Required Scope:` Content.Publish
   *
   * @summary Delete Documentation
   */
  @Delete('/{externalLink}')
  @OperationId('delete-content')
  @Security('jwt', ['Content.Publish'])
  public async delete(
    @Path() ns: string,
    @Path() externalLink: string,
    @Request() request: any
  ): Promise<BatchResult> {
    const context = this.keystone.createContext(request);

    const current = await getRecord(context, 'Content', externalLink);
    assert.strictEqual(current === null, false, 'Content not found');
    assert.strictEqual(current.namespace === ns, true, 'Content invalid');

    return await deleteRecord(context, 'Content', externalLink);
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
