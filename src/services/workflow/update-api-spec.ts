import { FieldErrors, ValidateError } from 'tsoa';
import { Logger } from '../../logger';
import YAML from 'js-yaml';
import {strict as assert} from 'assert';
import { id } from 'date-fns/locale';

const logger = Logger('wf.UpdAPISpec');

async function UpdateAPISpec(ctx: any, specUrl: string, productEnvAppId: string) {

  // Fetch the specUrl and parse YAML
    const response = await fetch(specUrl);
    if (!response.ok) {
      throw new ValidateError({}, `Failed to fetch spec from URL: ${specUrl}`);
    }
    const yamlText = await response.text();
    let parsedYaml: any;
    try {
      parsedYaml = YAML.load(yamlText);
    } catch (err) {
      logger.error('YAML parsing error: %j', err);
      throw new ValidateError({}, 'Invalid YAML format');
    }

    const blobRef = `${productEnvAppId}-APISPEC-${parsedYaml.info.version}`;

    const blobExists = await ctx.executeGraphQL({
      query: `query ($blobRef: String!) {
                allEnvironments (where: { appId: "${productEnvAppId}"}) {
                  id
                }
                
                allBlobs (where: { ref: $blobRef}) {
                  id
                }
             }`,
      variables: { appId: productEnvAppId, blobRef },
    });

    assert(!blobExists.errors, 'Unable to delete existing Blob');
    
    const variables = {
      id: blobExists.data.allEnvironments[0].id,
      blobRef,
      blobType: 'yaml',
      blob: YAML.dump(parsedYaml),
    };

    if (blobExists.data.allBlobs.length == 1) {
      const result = await ctx.executeGraphQL({
        query: `mutation ($id: String!) {
                deleteBlob (id: $id) {
                  id
                }
             }`,
        variables: { id: blobExists.data.allBlobs[0].id },
      });
      assert(!result.errors, 'Unable to delete existing Blob');
    }

    const result = await ctx.executeGraphQL({
      query: `mutation ($id: String, $oldBlobId: String, $blob: String, $blobType: String, $blobRef: String) {
                updateEnvironment (id: $id, data: {
                  spec: {
                    create: {
                      ref: $blobRef,
                      type: $blobType,
                      blob: $blob
                    }
                  }
                }) {
                  id
                  spec {
                    id
                  }
                }
             }`,
      variables,
    });

    if (result.errors) {
      const errors: FieldErrors = {};
      result.errors.forEach((err: any, ind: number) => {
        errors[`d${ind}`] = { message: err.message };
      });
      logger.error('%j', result);
      throw new ValidateError(errors, 'Unable to update API Specification');
    }
    return {
      id: result.data.updateEnvironment.id,
      spec: {
        id: result.data.updateEnvironment.spec.id,
      }
    };

}

export default UpdateAPISpec;