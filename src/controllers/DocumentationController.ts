import { Controller, OperationId, Get, Path, Route } from 'tsoa';
import { KeystoneService } from './ioc/keystoneInjector';
import { inject, injectable } from 'tsyringe';
import { gql } from 'graphql-request';
import { Content } from '@/services/keystone/types';
import { strict as assert } from 'assert';

@injectable()
@Route('/documentation')
export class DocumentationController extends Controller {
  private keystone: KeystoneService;
  constructor(@inject('KeystoneService') private _keystone: KeystoneService) {
    super();
    this.keystone = _keystone;
  }

  @Get()
  @OperationId('document-list')
  public async list(): Promise<any> {
    const result: Content[] = (
      await this.keystone.executeGraphQL({
        context: this.keystone.sudo(),
        query: list,
      })
    ).data.allDiscoverableContents;
    result.map((content) => {
      content.tags = JSON.parse(content.tags);
    });
    return result;
  }

  @Get('{slug}')
  @OperationId('document-item')
  public async get(@Path() slug: string): Promise<any> {
    const content: Content = (
      await this.keystone.executeGraphQL({
        context: this.keystone.sudo(),
        query: item,
        variables: { slug },
      })
    ).data.allDiscoverableContents[0];
    assert.strictEqual(content != null, true, `Document '${slug}' Not Found`);
    content.tags = JSON.parse(content.tags);
    return content;
  }
}

const list = gql`
  {
    allDiscoverableContents(where: { isComplete: true }) {
      slug
      title
      description
      tags
    }
  }
`;

const item = gql`
  query Content($slug: String!) {
    allDiscoverableContents(
      where: { slug: $slug, isPublic: true, isComplete: true }
    ) {
      slug
      tags
      title
      content
      readme
      githubRepository
      publishDate
    }
  }
`;
