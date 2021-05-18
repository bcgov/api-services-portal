/* tslint:disable */
/* eslint-disable */
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { Controller, ValidationService, FieldErrors, ValidateError, TsoaRoute, HttpStatusCodeLiteral, TsoaResponse } from '@tsoa/runtime';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { HelloController } from './HelloController';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { ProductsController } from './ProductController';
import * as express from 'express';

// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

const models: TsoaRoute.Models = {
    "TheUser": {
        "dataType": "refObject",
        "properties": {
            "id": {"dataType":"double"},
            "email": {"dataType":"string"},
            "name": {"dataType":"string"},
            "status": {"dataType":"union","subSchemas":[{"dataType":"enum","enums":["Happy"]},{"dataType":"enum","enums":["Sad"]}]},
            "phoneNumbers": {"dataType":"array","array":{"dataType":"string"}},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Maybe_Scalars-at-String_": {
        "dataType": "refAlias",
        "type": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Maybe_Scalars-at-Boolean_": {
        "dataType": "refAlias",
        "type": {"dataType":"union","subSchemas":[{"dataType":"boolean"},{"dataType":"enum","enums":[null]}],"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "OrganizationUnit": {
        "dataType": "refAlias",
        "type": {"dataType":"nestedObjectLiteral","nestedProperties":{"extRecordHash":{"ref":"Maybe_Scalars-at-String_"},"extForeignKey":{"ref":"Maybe_Scalars-at-String_"},"extSource":{"ref":"Maybe_Scalars-at-String_"},"description":{"ref":"Maybe_Scalars-at-String_"},"tags":{"ref":"Maybe_Scalars-at-String_"},"title":{"ref":"Maybe_Scalars-at-String_"},"sector":{"ref":"Maybe_Scalars-at-String_"},"name":{"ref":"Maybe_Scalars-at-String_"},"id":{"dataType":"string","required":true},"_label_":{"ref":"Maybe_Scalars-at-String_"},"__typename":{"dataType":"enum","enums":["OrganizationUnit"]}},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Maybe_Scalars-at-Int_": {
        "dataType": "refAlias",
        "type": {"dataType":"union","subSchemas":[{"dataType":"double"},{"dataType":"enum","enums":[null]}],"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "_QueryMeta": {
        "dataType": "refAlias",
        "type": {"dataType":"nestedObjectLiteral","nestedProperties":{"count":{"ref":"Maybe_Scalars-at-Int_"},"__typename":{"dataType":"enum","enums":["_QueryMeta"]}},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Maybe__QueryMeta_": {
        "dataType": "refAlias",
        "type": {"dataType":"union","subSchemas":[{"ref":"_QueryMeta"},{"dataType":"enum","enums":[null]}],"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Organization": {
        "dataType": "refAlias",
        "type": {"dataType":"nestedObjectLiteral","nestedProperties":{"extRecordHash":{"ref":"Maybe_Scalars-at-String_"},"extForeignKey":{"ref":"Maybe_Scalars-at-String_"},"extSource":{"ref":"Maybe_Scalars-at-String_"},"_orgUnitsMeta":{"ref":"Maybe__QueryMeta_"},"orgUnits":{"dataType":"array","array":{"dataType":"refAlias","ref":"OrganizationUnit"},"required":true},"description":{"ref":"Maybe_Scalars-at-String_"},"tags":{"ref":"Maybe_Scalars-at-String_"},"title":{"ref":"Maybe_Scalars-at-String_"},"sector":{"ref":"Maybe_Scalars-at-String_"},"name":{"ref":"Maybe_Scalars-at-String_"},"id":{"dataType":"string","required":true},"_label_":{"ref":"Maybe_Scalars-at-String_"},"__typename":{"dataType":"enum","enums":["Organization"]}},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Maybe_Organization_": {
        "dataType": "refAlias",
        "type": {"dataType":"union","subSchemas":[{"ref":"Organization"},{"dataType":"enum","enums":[null]}],"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Maybe_OrganizationUnit_": {
        "dataType": "refAlias",
        "type": {"dataType":"union","subSchemas":[{"ref":"OrganizationUnit"},{"dataType":"enum","enums":[null]}],"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Dataset": {
        "dataType": "refAlias",
        "type": {"dataType":"nestedObjectLiteral","nestedProperties":{"extRecordHash":{"ref":"Maybe_Scalars-at-String_"},"extForeignKey":{"ref":"Maybe_Scalars-at-String_"},"extSource":{"ref":"Maybe_Scalars-at-String_"},"isInCatalog":{"ref":"Maybe_Scalars-at-Boolean_"},"catalogContent":{"ref":"Maybe_Scalars-at-String_"},"title":{"ref":"Maybe_Scalars-at-String_"},"notes":{"ref":"Maybe_Scalars-at-String_"},"organizationUnit":{"ref":"Maybe_OrganizationUnit_"},"organization":{"ref":"Maybe_Organization_"},"contacts":{"ref":"Maybe_Scalars-at-String_"},"tags":{"ref":"Maybe_Scalars-at-String_"},"private":{"ref":"Maybe_Scalars-at-Boolean_"},"security_class":{"ref":"Maybe_Scalars-at-String_"},"record_publish_date":{"ref":"Maybe_Scalars-at-String_"},"download_audience":{"ref":"Maybe_Scalars-at-String_"},"view_audience":{"ref":"Maybe_Scalars-at-String_"},"license_title":{"ref":"Maybe_Scalars-at-String_"},"sector":{"ref":"Maybe_Scalars-at-String_"},"name":{"ref":"Maybe_Scalars-at-String_"},"id":{"dataType":"string","required":true},"_label_":{"ref":"Maybe_Scalars-at-String_"},"__typename":{"dataType":"enum","enums":["Dataset"]}},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Maybe_Dataset_": {
        "dataType": "refAlias",
        "type": {"dataType":"union","subSchemas":[{"ref":"Dataset"},{"dataType":"enum","enums":[null]}],"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "User": {
        "dataType": "refAlias",
        "type": {"dataType":"nestedObjectLiteral","nestedProperties":{"legalsAgreed":{"ref":"Maybe_Scalars-at-String_"},"password_is_set":{"ref":"Maybe_Scalars-at-Boolean_"},"isAdmin":{"ref":"Maybe_Scalars-at-Boolean_"},"email":{"ref":"Maybe_Scalars-at-String_"},"username":{"ref":"Maybe_Scalars-at-String_"},"name":{"ref":"Maybe_Scalars-at-String_"},"id":{"dataType":"string","required":true},"_label_":{"ref":"Maybe_Scalars-at-String_"},"__typename":{"dataType":"enum","enums":["User"]}},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Maybe_User_": {
        "dataType": "refAlias",
        "type": {"dataType":"union","subSchemas":[{"ref":"User"},{"dataType":"enum","enums":[null]}],"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Maybe_Scalars-at-DateTime_": {
        "dataType": "refAlias",
        "type": {"dataType":"union","subSchemas":[{"dataType":"any"},{"dataType":"enum","enums":[null]}],"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Legal": {
        "dataType": "refAlias",
        "type": {"dataType":"nestedObjectLiteral","nestedProperties":{"createdAt":{"ref":"Maybe_Scalars-at-DateTime_"},"updatedAt":{"ref":"Maybe_Scalars-at-DateTime_"},"createdBy":{"ref":"Maybe_User_"},"updatedBy":{"ref":"Maybe_User_"},"isActive":{"ref":"Maybe_Scalars-at-Boolean_"},"version":{"ref":"Maybe_Scalars-at-Int_"},"reference":{"ref":"Maybe_Scalars-at-String_"},"document":{"ref":"Maybe_Scalars-at-String_"},"link":{"ref":"Maybe_Scalars-at-String_"},"description":{"ref":"Maybe_Scalars-at-String_"},"title":{"ref":"Maybe_Scalars-at-String_"},"id":{"dataType":"string","required":true},"_label_":{"ref":"Maybe_Scalars-at-String_"},"__typename":{"dataType":"enum","enums":["Legal"]}},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Maybe_Legal_": {
        "dataType": "refAlias",
        "type": {"dataType":"union","subSchemas":[{"ref":"Legal"},{"dataType":"enum","enums":[null]}],"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Environment": {
        "dataType": "refAlias",
        "type": {"dataType":"nestedObjectLiteral","nestedProperties":{"product":{"ref":"Maybe_Product_"},"_servicesMeta":{"ref":"Maybe__QueryMeta_"},"services":{"dataType":"array","array":{"dataType":"refAlias","ref":"GatewayService"},"required":true},"additionalDetailsToRequest":{"ref":"Maybe_Scalars-at-String_"},"credentialIssuer":{"ref":"Maybe_CredentialIssuer_"},"legal":{"ref":"Maybe_Legal_"},"flow":{"ref":"Maybe_Scalars-at-String_"},"approval":{"ref":"Maybe_Scalars-at-Boolean_"},"active":{"ref":"Maybe_Scalars-at-Boolean_"},"name":{"ref":"Maybe_Scalars-at-String_"},"appId":{"ref":"Maybe_Scalars-at-String_"},"id":{"dataType":"string","required":true},"_label_":{"ref":"Maybe_Scalars-at-String_"},"__typename":{"dataType":"enum","enums":["Environment"]}},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "CredentialIssuer": {
        "dataType": "refAlias",
        "type": {"dataType":"nestedObjectLiteral","nestedProperties":{"createdAt":{"ref":"Maybe_Scalars-at-DateTime_"},"updatedAt":{"ref":"Maybe_Scalars-at-DateTime_"},"createdBy":{"ref":"Maybe_User_"},"updatedBy":{"ref":"Maybe_User_"},"_environmentsMeta":{"ref":"Maybe__QueryMeta_"},"environments":{"dataType":"array","array":{"dataType":"refAlias","ref":"Environment"},"required":true},"owner":{"ref":"Maybe_User_"},"apiKeyName":{"ref":"Maybe_Scalars-at-String_"},"resourceAccessScope":{"ref":"Maybe_Scalars-at-String_"},"resourceType":{"ref":"Maybe_Scalars-at-String_"},"resourceScopes":{"ref":"Maybe_Scalars-at-String_"},"clientRoles":{"ref":"Maybe_Scalars-at-String_"},"availableScopes":{"ref":"Maybe_Scalars-at-String_"},"clientSecret":{"ref":"Maybe_Scalars-at-String_"},"clientId":{"ref":"Maybe_Scalars-at-String_"},"initialAccessToken":{"ref":"Maybe_Scalars-at-String_"},"oidcDiscoveryUrl":{"ref":"Maybe_Scalars-at-String_"},"environmentDetails":{"ref":"Maybe_Scalars-at-String_"},"instruction":{"ref":"Maybe_Scalars-at-String_"},"authPlugin":{"ref":"Maybe_Scalars-at-String_"},"clientAuthenticator":{"ref":"Maybe_Scalars-at-String_"},"mode":{"ref":"Maybe_Scalars-at-String_"},"clientRegistration":{"ref":"Maybe_Scalars-at-String_"},"flow":{"ref":"Maybe_Scalars-at-String_"},"description":{"ref":"Maybe_Scalars-at-String_"},"namespace":{"ref":"Maybe_Scalars-at-String_"},"name":{"ref":"Maybe_Scalars-at-String_"},"id":{"dataType":"string","required":true},"_label_":{"ref":"Maybe_Scalars-at-String_"},"__typename":{"dataType":"enum","enums":["CredentialIssuer"]}},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Maybe_CredentialIssuer_": {
        "dataType": "refAlias",
        "type": {"dataType":"union","subSchemas":[{"ref":"CredentialIssuer"},{"dataType":"enum","enums":[null]}],"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "GatewayService": {
        "dataType": "refAlias",
        "type": {"dataType":"nestedObjectLiteral","nestedProperties":{"createdAt":{"ref":"Maybe_Scalars-at-DateTime_"},"updatedAt":{"ref":"Maybe_Scalars-at-DateTime_"},"extRecordHash":{"ref":"Maybe_Scalars-at-String_"},"extForeignKey":{"ref":"Maybe_Scalars-at-String_"},"extSource":{"ref":"Maybe_Scalars-at-String_"},"environment":{"ref":"Maybe_Environment_"},"_pluginsMeta":{"ref":"Maybe__QueryMeta_"},"plugins":{"dataType":"array","array":{"dataType":"refAlias","ref":"GatewayPlugin"},"required":true},"_routesMeta":{"ref":"Maybe__QueryMeta_"},"routes":{"dataType":"array","array":{"dataType":"refAlias","ref":"GatewayRoute"},"required":true},"tags":{"ref":"Maybe_Scalars-at-String_"},"host":{"ref":"Maybe_Scalars-at-String_"},"namespace":{"ref":"Maybe_Scalars-at-String_"},"name":{"ref":"Maybe_Scalars-at-String_"},"id":{"dataType":"string","required":true},"_label_":{"ref":"Maybe_Scalars-at-String_"},"__typename":{"dataType":"enum","enums":["GatewayService"]}},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Maybe_GatewayService_": {
        "dataType": "refAlias",
        "type": {"dataType":"union","subSchemas":[{"ref":"GatewayService"},{"dataType":"enum","enums":[null]}],"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "GatewayRoute": {
        "dataType": "refAlias",
        "type": {"dataType":"nestedObjectLiteral","nestedProperties":{"createdAt":{"ref":"Maybe_Scalars-at-DateTime_"},"updatedAt":{"ref":"Maybe_Scalars-at-DateTime_"},"extRecordHash":{"ref":"Maybe_Scalars-at-String_"},"extForeignKey":{"ref":"Maybe_Scalars-at-String_"},"extSource":{"ref":"Maybe_Scalars-at-String_"},"_pluginsMeta":{"ref":"Maybe__QueryMeta_"},"plugins":{"dataType":"array","array":{"dataType":"refAlias","ref":"GatewayPlugin"},"required":true},"service":{"ref":"Maybe_GatewayService_"},"tags":{"ref":"Maybe_Scalars-at-String_"},"hosts":{"ref":"Maybe_Scalars-at-String_"},"paths":{"ref":"Maybe_Scalars-at-String_"},"methods":{"ref":"Maybe_Scalars-at-String_"},"namespace":{"ref":"Maybe_Scalars-at-String_"},"name":{"ref":"Maybe_Scalars-at-String_"},"id":{"dataType":"string","required":true},"_label_":{"ref":"Maybe_Scalars-at-String_"},"__typename":{"dataType":"enum","enums":["GatewayRoute"]}},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Maybe_GatewayRoute_": {
        "dataType": "refAlias",
        "type": {"dataType":"union","subSchemas":[{"ref":"GatewayRoute"},{"dataType":"enum","enums":[null]}],"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "GatewayPlugin": {
        "dataType": "refAlias",
        "type": {"dataType":"nestedObjectLiteral","nestedProperties":{"createdAt":{"ref":"Maybe_Scalars-at-DateTime_"},"updatedAt":{"ref":"Maybe_Scalars-at-DateTime_"},"extRecordHash":{"ref":"Maybe_Scalars-at-String_"},"extForeignKey":{"ref":"Maybe_Scalars-at-String_"},"extSource":{"ref":"Maybe_Scalars-at-String_"},"route":{"ref":"Maybe_GatewayRoute_"},"service":{"ref":"Maybe_GatewayService_"},"config":{"ref":"Maybe_Scalars-at-String_"},"tags":{"ref":"Maybe_Scalars-at-String_"},"namespace":{"ref":"Maybe_Scalars-at-String_"},"name":{"ref":"Maybe_Scalars-at-String_"},"id":{"dataType":"string","required":true},"_label_":{"ref":"Maybe_Scalars-at-String_"},"__typename":{"dataType":"enum","enums":["GatewayPlugin"]}},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Maybe_Environment_": {
        "dataType": "refAlias",
        "type": {"dataType":"union","subSchemas":[{"ref":"Environment"},{"dataType":"enum","enums":[null]}],"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Product": {
        "dataType": "refAlias",
        "type": {"dataType":"nestedObjectLiteral","nestedProperties":{"_environmentsMeta":{"ref":"Maybe__QueryMeta_"},"environments":{"dataType":"array","array":{"dataType":"refAlias","ref":"Environment"},"required":true},"organizationUnit":{"ref":"Maybe_OrganizationUnit_"},"organization":{"ref":"Maybe_Organization_"},"dataset":{"ref":"Maybe_Dataset_"},"description":{"ref":"Maybe_Scalars-at-String_"},"namespace":{"ref":"Maybe_Scalars-at-String_"},"name":{"ref":"Maybe_Scalars-at-String_"},"appId":{"ref":"Maybe_Scalars-at-String_"},"id":{"dataType":"string","required":true},"_label_":{"ref":"Maybe_Scalars-at-String_"},"__typename":{"dataType":"enum","enums":["Product"]}},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Maybe_Product_": {
        "dataType": "refAlias",
        "type": {"dataType":"union","subSchemas":[{"ref":"Product"},{"dataType":"enum","enums":[null]}],"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
};
const validationService = new ValidationService(models);

// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

export function RegisterRoutes(app: express.Router) {
    // ###########################################################################################################
    //  NOTE: If you do not see routes for all of your controllers in this file, then you might not have informed tsoa of where to look
    //      Please look into the "controllerPathGlobs" config option described in the readme: https://github.com/lukeautry/tsoa
    // ###########################################################################################################
        app.get('/ds/api/users/:userId',
            function HelloController_getUser(request: any, response: any, next: any) {
            const args = {
                    userId: {"in":"path","name":"userId","required":true,"dataType":"double"},
                    name: {"in":"query","name":"name","dataType":"string"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);
            } catch (err) {
                return next(err);
            }

            const controller = new HelloController();


            const promise = controller.getUser.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, undefined, next);
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.get('/ds/api/products/:productId',
            function ProductsController_getProduct(request: any, response: any, next: any) {
            const args = {
                    productId: {"in":"path","name":"productId","required":true,"dataType":"string"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);
            } catch (err) {
                return next(err);
            }

            const controller = new ProductsController();


            const promise = controller.getProduct.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, undefined, next);
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa


    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

    function isController(object: any): object is Controller {
        return 'getHeaders' in object && 'getStatus' in object && 'setStatus' in object;
    }

    function promiseHandler(controllerObj: any, promise: any, response: any, successStatus: any, next: any) {
        return Promise.resolve(promise)
            .then((data: any) => {
                let statusCode = successStatus;
                let headers;
                if (isController(controllerObj)) {
                    headers = controllerObj.getHeaders();
                    statusCode = controllerObj.getStatus() || statusCode;
                }

                // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

                returnHandler(response, statusCode, data, headers)
            })
            .catch((error: any) => next(error));
    }

    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

    function returnHandler(response: any, statusCode?: number, data?: any, headers: any = {}) {
        if (response.headersSent) {
            return;
        }
        Object.keys(headers).forEach((name: string) => {
            response.set(name, headers[name]);
        });
        if (data && typeof data.pipe === 'function' && data.readable && typeof data._read === 'function') {
            data.pipe(response);
        } else if (data !== null && data !== undefined) {
            response.status(statusCode || 200).json(data);
        } else {
            response.status(statusCode || 204).end();
        }
    }

    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

    function responder(response: any): TsoaResponse<HttpStatusCodeLiteral, unknown>  {
        return function(status, data, headers) {
            returnHandler(response, status, data, headers);
        };
    };

    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

    function getValidatedArgs(args: any, request: any, response: any): any[] {
        const fieldErrors: FieldErrors  = {};
        const values = Object.keys(args).map((key) => {
            const name = args[key].name;
            switch (args[key].in) {
                case 'request':
                    return request;
                case 'query':
                    return validationService.ValidateParam(args[key], request.query[name], name, fieldErrors, undefined, {"noImplicitAdditionalProperties":"throw-on-extras"});
                case 'path':
                    return validationService.ValidateParam(args[key], request.params[name], name, fieldErrors, undefined, {"noImplicitAdditionalProperties":"throw-on-extras"});
                case 'header':
                    return validationService.ValidateParam(args[key], request.header(name), name, fieldErrors, undefined, {"noImplicitAdditionalProperties":"throw-on-extras"});
                case 'body':
                    return validationService.ValidateParam(args[key], request.body, name, fieldErrors, undefined, {"noImplicitAdditionalProperties":"throw-on-extras"});
                case 'body-prop':
                    return validationService.ValidateParam(args[key], request.body[name], name, fieldErrors, 'body.', {"noImplicitAdditionalProperties":"throw-on-extras"});
                case 'formData':
                    if (args[key].dataType === 'file') {
                        return validationService.ValidateParam(args[key], request.file, name, fieldErrors, undefined, {"noImplicitAdditionalProperties":"throw-on-extras"});
                    } else if (args[key].dataType === 'array' && args[key].array.dataType === 'file') {
                        return validationService.ValidateParam(args[key], request.files, name, fieldErrors, undefined, {"noImplicitAdditionalProperties":"throw-on-extras"});
                    } else {
                        return validationService.ValidateParam(args[key], request.body[name], name, fieldErrors, undefined, {"noImplicitAdditionalProperties":"throw-on-extras"});
                    }
                case 'res':
                    return responder(response);
            }
        });

        if (Object.keys(fieldErrors).length > 0) {
            throw new ValidateError(fieldErrors, '');
        }
        return values;
    }

    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
}

// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
