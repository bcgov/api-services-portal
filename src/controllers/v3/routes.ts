/* tslint:disable */
/* eslint-disable */
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { Controller, ValidationService, FieldErrors, ValidateError, TsoaRoute, HttpStatusCodeLiteral, TsoaResponse } from '@tsoa/runtime';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { OrgDatasetController } from './OrgDatasetController';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { DirectoryController } from './DirectoryController';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { DatasetController } from './DatasetController';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { EndpointsController } from './EndpointsController';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { NamespaceController } from './GatewayController';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { NamespaceDirectoryController } from './GatewayDirectoryController';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { GatewayController } from './GatewayServicesController';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { IdentifiersController } from './IdentifierController';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { IssuerController } from './IssuerController';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { OrganizationController } from './OrganizationController';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { OrgRoleController } from './OrgRoleController';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { ProductController } from './ProductController';
import { expressAuthentication } from './../../auth/auth-tsoa';
// @ts-ignore - no great way to install types from subpackage
const promiseAny = require('promise.any');
import { iocContainer } from './../ioc';
import { IocContainer, IocContainerFactory } from '@tsoa/runtime';
import * as express from 'express';
const multer = require('multer');
const upload = multer();

// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

const models: TsoaRoute.Models = {
    "OrganizationRefID": {
        "dataType": "refAlias",
        "type": {"dataType":"string","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "OrganizationUnitRefID": {
        "dataType": "refAlias",
        "type": {"dataType":"string","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Dataset": {
        "dataType": "refObject",
        "properties": {
            "extForeignKey": {"dataType":"string"},
            "name": {"dataType":"string"},
            "license_title": {"dataType":"string"},
            "security_class": {"dataType":"string"},
            "view_audience": {"dataType":"string"},
            "download_audience": {"dataType":"string"},
            "record_publish_date": {"dataType":"string"},
            "notes": {"dataType":"string"},
            "title": {"dataType":"string"},
            "isInCatalog": {"dataType":"string"},
            "isDraft": {"dataType":"string"},
            "contacts": {"dataType":"string"},
            "extSource": {"dataType":"string"},
            "extRecordHash": {"dataType":"string"},
            "tags": {"dataType":"array","array":{"dataType":"string"}},
            "resources": {"dataType":"any"},
            "organization": {"ref":"OrganizationRefID"},
            "organizationUnit": {"ref":"OrganizationUnitRefID"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "BatchResult": {
        "dataType": "refObject",
        "properties": {
            "status": {"dataType":"double","required":true},
            "result": {"dataType":"string","required":true},
            "reason": {"dataType":"string"},
            "id": {"dataType":"string"},
            "ownedBy": {"dataType":"string"},
            "childResults": {"dataType":"array","array":{"dataType":"refObject","ref":"BatchResult"}},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "DraftDataset": {
        "dataType": "refObject",
        "properties": {
            "name": {"dataType":"string"},
            "license_title": {"dataType":"string"},
            "security_class": {"dataType":"union","subSchemas":[{"dataType":"enum","enums":["HIGH-CABINET"]},{"dataType":"enum","enums":["HIGH-CONFIDENTIAL"]},{"dataType":"enum","enums":["HIGH-SENSITIVITY"]},{"dataType":"enum","enums":["MEDIUM-SENSITIVITY"]},{"dataType":"enum","enums":["MEDIUM-PERSONAL"]},{"dataType":"enum","enums":["LOW-SENSITIVITY"]},{"dataType":"enum","enums":["LOW-PUBLIC"]},{"dataType":"enum","enums":["PUBLIC"]},{"dataType":"enum","enums":["PROTECTED A"]},{"dataType":"enum","enums":["PROTECTED B"]},{"dataType":"enum","enums":["PROTECTED C"]}]},
            "view_audience": {"dataType":"union","subSchemas":[{"dataType":"enum","enums":["Public"]},{"dataType":"enum","enums":["Government"]},{"dataType":"enum","enums":["Named users"]},{"dataType":"enum","enums":["Government and Business BCeID"]}]},
            "download_audience": {"dataType":"union","subSchemas":[{"dataType":"enum","enums":["Public"]},{"dataType":"enum","enums":["Government"]},{"dataType":"enum","enums":["Named users"]},{"dataType":"enum","enums":["Government and Business BCeID"]}]},
            "record_publish_date": {"dataType":"string"},
            "notes": {"dataType":"string"},
            "title": {"dataType":"string"},
            "isInCatalog": {"dataType":"boolean"},
            "isDraft": {"dataType":"boolean"},
            "contacts": {"dataType":"string"},
            "resources": {"dataType":"string"},
            "tags": {"dataType":"array","array":{"dataType":"string"}},
            "organization": {"ref":"OrganizationRefID"},
            "organizationUnit": {"ref":"OrganizationUnitRefID"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Gateway": {
        "dataType": "refObject",
        "properties": {
            "gatewayId": {"dataType":"string"},
            "displayName": {"dataType":"string"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ActivityDetail": {
        "dataType": "refObject",
        "properties": {
            "id": {"dataType":"string"},
            "message": {"dataType":"string","required":true},
            "params": {"dataType":"nestedObjectLiteral","nestedProperties":{},"additionalProperties":{"dataType":"string"},"required":true},
            "activityAt": {"dataType":"any","required":true},
            "blob": {"dataType":"any"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "PublishResult": {
        "dataType": "refObject",
        "properties": {
            "message": {"dataType":"string"},
            "results": {"dataType":"string"},
            "error": {"dataType":"string"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "GatewayServiceRefID": {
        "dataType": "refAlias",
        "type": {"dataType":"string","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "GatewayRouteRefID": {
        "dataType": "refAlias",
        "type": {"dataType":"string","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "GatewayPlugin": {
        "dataType": "refObject",
        "properties": {
            "extForeignKey": {"dataType":"string"},
            "name": {"dataType":"string"},
            "extSource": {"dataType":"string"},
            "extRecordHash": {"dataType":"string"},
            "tags": {"dataType":"array","array":{"dataType":"string"}},
            "config": {"dataType":"any"},
            "service": {"ref":"GatewayServiceRefID"},
            "route": {"ref":"GatewayRouteRefID"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "GatewayRoute": {
        "dataType": "refObject",
        "properties": {
            "extForeignKey": {"dataType":"string"},
            "name": {"dataType":"string"},
            "gatewayId": {"dataType":"string"},
            "extSource": {"dataType":"string"},
            "extRecordHash": {"dataType":"string"},
            "tags": {"dataType":"array","array":{"dataType":"string"}},
            "methods": {"dataType":"array","array":{"dataType":"string"}},
            "paths": {"dataType":"array","array":{"dataType":"string"}},
            "hosts": {"dataType":"array","array":{"dataType":"string"}},
            "service": {"ref":"GatewayServiceRefID"},
            "plugins": {"dataType":"array","array":{"dataType":"refObject","ref":"GatewayPlugin"}},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "IssuerEnvironmentConfig": {
        "dataType": "refObject",
        "properties": {
            "environment": {"dataType":"string"},
            "exists": {"dataType":"boolean"},
            "issuerUrl": {"dataType":"string"},
            "clientRegistration": {"dataType":"union","subSchemas":[{"dataType":"enum","enums":["anonymous"]},{"dataType":"enum","enums":["managed"]},{"dataType":"enum","enums":["iat"]}]},
            "clientId": {"dataType":"string"},
            "clientSecret": {"dataType":"string"},
            "initialAccessToken": {"dataType":"string"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "undefinedRefID": {
        "dataType": "refAlias",
        "type": {"dataType":"string","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "CredentialIssuer": {
        "dataType": "refObject",
        "properties": {
            "name": {"dataType":"string"},
            "gatewayId": {"dataType":"string"},
            "description": {"dataType":"string"},
            "flow": {"dataType":"enum","enums":["client-credentials"]},
            "mode": {"dataType":"enum","enums":["auto"]},
            "authPlugin": {"dataType":"string"},
            "clientAuthenticator": {"dataType":"union","subSchemas":[{"dataType":"enum","enums":["client-secret"]},{"dataType":"enum","enums":["client-jwt"]},{"dataType":"enum","enums":["client-jwt-jwks-url"]}]},
            "instruction": {"dataType":"string"},
            "environmentDetails": {"dataType":"array","array":{"dataType":"refObject","ref":"IssuerEnvironmentConfig"}},
            "resourceType": {"dataType":"string"},
            "resourceAccessScope": {"dataType":"string"},
            "isShared": {"dataType":"boolean"},
            "apiKeyName": {"dataType":"string"},
            "availableScopes": {"dataType":"array","array":{"dataType":"string"}},
            "resourceScopes": {"dataType":"array","array":{"dataType":"string"}},
            "clientRoles": {"dataType":"array","array":{"dataType":"string"}},
            "clientMappers": {"dataType":"array","array":{"dataType":"string"}},
            "inheritFrom": {"ref":"undefinedRefID"},
            "owner": {"ref":"undefinedRefID"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "OrganizationUnit": {
        "dataType": "refObject",
        "properties": {
            "extForeignKey": {"dataType":"string"},
            "name": {"dataType":"string"},
            "sector": {"dataType":"string"},
            "title": {"dataType":"string"},
            "description": {"dataType":"string"},
            "extSource": {"dataType":"string"},
            "extRecordHash": {"dataType":"string"},
            "tags": {"dataType":"array","array":{"dataType":"string"}},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Organization": {
        "dataType": "refObject",
        "properties": {
            "extForeignKey": {"dataType":"string"},
            "name": {"dataType":"string"},
            "sector": {"dataType":"string"},
            "title": {"dataType":"string"},
            "description": {"dataType":"string"},
            "extSource": {"dataType":"string"},
            "extRecordHash": {"dataType":"string"},
            "tags": {"dataType":"array","array":{"dataType":"string"}},
            "orgUnits": {"dataType":"array","array":{"dataType":"refObject","ref":"OrganizationUnit"}},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "GroupPermission": {
        "dataType": "refObject",
        "properties": {
            "resource": {"dataType":"string"},
            "scopes": {"dataType":"array","array":{"dataType":"string"},"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "GroupRole": {
        "dataType": "refObject",
        "properties": {
            "name": {"dataType":"string","required":true},
            "permissions": {"dataType":"array","array":{"dataType":"refObject","ref":"GroupPermission"},"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "GroupAccess": {
        "dataType": "refObject",
        "properties": {
            "name": {"dataType":"string"},
            "parent": {"dataType":"string"},
            "roles": {"dataType":"array","array":{"dataType":"refObject","ref":"GroupRole"},"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "UserReference": {
        "dataType": "refObject",
        "properties": {
            "id": {"dataType":"string"},
            "email": {"dataType":"string"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "GroupMember": {
        "dataType": "refObject",
        "properties": {
            "member": {"ref":"UserReference","required":true},
            "roles": {"dataType":"array","array":{"dataType":"string"},"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "GroupMembership": {
        "dataType": "refObject",
        "properties": {
            "name": {"dataType":"string"},
            "parent": {"dataType":"string"},
            "members": {"dataType":"array","array":{"dataType":"refObject","ref":"GroupMember"}},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "OrgNamespace": {
        "dataType": "refObject",
        "properties": {
            "name": {"dataType":"string","required":true},
            "orgUnit": {"dataType":"string","required":true},
            "enabled": {"dataType":"boolean","required":true},
            "updatedAt": {"dataType":"double","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "DraftDatasetRefID": {
        "dataType": "refAlias",
        "type": {"dataType":"string","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "LegalRefID": {
        "dataType": "refAlias",
        "type": {"dataType":"string","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "CredentialIssuerRefID": {
        "dataType": "refAlias",
        "type": {"dataType":"string","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Environment": {
        "dataType": "refObject",
        "properties": {
            "appId": {"dataType":"string"},
            "name": {"dataType":"union","subSchemas":[{"dataType":"enum","enums":["dev"]},{"dataType":"enum","enums":["test"]},{"dataType":"enum","enums":["prod"]},{"dataType":"enum","enums":["sandbox"]},{"dataType":"enum","enums":["other"]}]},
            "active": {"dataType":"boolean"},
            "approval": {"dataType":"boolean"},
            "flow": {"dataType":"union","subSchemas":[{"dataType":"enum","enums":["public"]},{"dataType":"enum","enums":["protected-externally"]},{"dataType":"enum","enums":["authorization-code"]},{"dataType":"enum","enums":["client-credentials"]},{"dataType":"enum","enums":["kong-acl-only"]},{"dataType":"enum","enums":["kong-api-key-only"]},{"dataType":"enum","enums":["kong-api-key-acl"]}]},
            "additionalDetailsToRequest": {"dataType":"string"},
            "services": {"dataType":"array","array":{"dataType":"refAlias","ref":"GatewayServiceRefID"}},
            "legal": {"ref":"LegalRefID"},
            "credentialIssuer": {"ref":"CredentialIssuerRefID"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Product": {
        "dataType": "refObject",
        "properties": {
            "appId": {"dataType":"string"},
            "name": {"dataType":"string"},
            "description": {"dataType":"string"},
            "gatewayId": {"dataType":"string"},
            "dataset": {"ref":"DraftDatasetRefID"},
            "environments": {"dataType":"array","array":{"dataType":"refObject","ref":"Environment"}},
        },
        "additionalProperties": false,
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
        app.get('/ds/api/v3/organizations/:org/datasets',
            authenticateMiddleware([{"jwt":["Dataset.Manage"]}]),

            async function OrgDatasetController_getDatasets(request: any, response: any, next: any) {
            const args = {
                    org: {"in":"path","name":"org","required":true,"dataType":"string"},
                    request: {"in":"request","name":"request","required":true,"dataType":"object"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const container: IocContainer = typeof iocContainer === 'function' ? (iocContainer as IocContainerFactory)(request) : iocContainer;

                const controller: any = await container.get<OrgDatasetController>(OrgDatasetController);
                if (typeof controller['setStatus'] === 'function') {
                controller.setStatus(undefined);
                }


              const promise = controller.getDatasets.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.put('/ds/api/v3/organizations/:org/datasets',
            authenticateMiddleware([{"jwt":["Dataset.Manage"]}]),

            async function OrgDatasetController_putDataset(request: any, response: any, next: any) {
            const args = {
                    org: {"in":"path","name":"org","required":true,"dataType":"string"},
                    body: {"in":"body","name":"body","required":true,"ref":"DraftDataset"},
                    request: {"in":"request","name":"request","required":true,"dataType":"object"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const container: IocContainer = typeof iocContainer === 'function' ? (iocContainer as IocContainerFactory)(request) : iocContainer;

                const controller: any = await container.get<OrgDatasetController>(OrgDatasetController);
                if (typeof controller['setStatus'] === 'function') {
                controller.setStatus(undefined);
                }


              const promise = controller.putDataset.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.delete('/ds/api/v3/organizations/:org/datasets/:name',
            authenticateMiddleware([{"jwt":["Dataset.Manage"]}]),

            async function OrgDatasetController_delete(request: any, response: any, next: any) {
            const args = {
                    org: {"in":"path","name":"org","required":true,"dataType":"string"},
                    name: {"in":"path","name":"name","required":true,"dataType":"string"},
                    request: {"in":"request","name":"request","required":true,"dataType":"object"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const container: IocContainer = typeof iocContainer === 'function' ? (iocContainer as IocContainerFactory)(request) : iocContainer;

                const controller: any = await container.get<OrgDatasetController>(OrgDatasetController);
                if (typeof controller['setStatus'] === 'function') {
                controller.setStatus(undefined);
                }


              const promise = controller.delete.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.get('/ds/api/v3/organizations/:org/datasets/:name',
            authenticateMiddleware([{"jwt":["Dataset.Manage"]}]),

            async function OrgDatasetController_getDataset(request: any, response: any, next: any) {
            const args = {
                    org: {"in":"path","name":"org","required":true,"dataType":"string"},
                    name: {"in":"path","name":"name","required":true,"dataType":"string"},
                    request: {"in":"request","name":"request","required":true,"dataType":"object"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const container: IocContainer = typeof iocContainer === 'function' ? (iocContainer as IocContainerFactory)(request) : iocContainer;

                const controller: any = await container.get<OrgDatasetController>(OrgDatasetController);
                if (typeof controller['setStatus'] === 'function') {
                controller.setStatus(undefined);
                }


              const promise = controller.getDataset.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.get('/ds/api/v3/directory',

            async function DirectoryController_list(request: any, response: any, next: any) {
            const args = {
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const container: IocContainer = typeof iocContainer === 'function' ? (iocContainer as IocContainerFactory)(request) : iocContainer;

                const controller: any = await container.get<DirectoryController>(DirectoryController);
                if (typeof controller['setStatus'] === 'function') {
                controller.setStatus(undefined);
                }


              const promise = controller.list.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.get('/ds/api/v3/directory/:id',

            async function DirectoryController_get(request: any, response: any, next: any) {
            const args = {
                    id: {"in":"path","name":"id","required":true,"dataType":"string"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const container: IocContainer = typeof iocContainer === 'function' ? (iocContainer as IocContainerFactory)(request) : iocContainer;

                const controller: any = await container.get<DirectoryController>(DirectoryController);
                if (typeof controller['setStatus'] === 'function') {
                controller.setStatus(undefined);
                }


              const promise = controller.get.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.put('/ds/api/v3/gateways/:gatewayId/datasets',
            authenticateMiddleware([{"jwt":["Namespace.Manage"]}]),

            async function DatasetController_put(request: any, response: any, next: any) {
            const args = {
                    gatewayId: {"in":"path","name":"gatewayId","required":true,"dataType":"string"},
                    body: {"in":"body","name":"body","required":true,"ref":"DraftDataset"},
                    request: {"in":"request","name":"request","required":true,"dataType":"object"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const container: IocContainer = typeof iocContainer === 'function' ? (iocContainer as IocContainerFactory)(request) : iocContainer;

                const controller: any = await container.get<DatasetController>(DatasetController);
                if (typeof controller['setStatus'] === 'function') {
                controller.setStatus(undefined);
                }


              const promise = controller.put.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.get('/ds/api/v3/gateways/:gatewayId/datasets/:name',
            authenticateMiddleware([{"jwt":["Namespace.Manage"]}]),

            async function DatasetController_getDataset(request: any, response: any, next: any) {
            const args = {
                    gatewayId: {"in":"path","name":"gatewayId","required":true,"dataType":"string"},
                    name: {"in":"path","name":"name","required":true,"dataType":"string"},
                    request: {"in":"request","name":"request","required":true,"dataType":"object"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const container: IocContainer = typeof iocContainer === 'function' ? (iocContainer as IocContainerFactory)(request) : iocContainer;

                const controller: any = await container.get<DatasetController>(DatasetController);
                if (typeof controller['setStatus'] === 'function') {
                controller.setStatus(undefined);
                }


              const promise = controller.getDataset.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.get('/ds/api/v3/routes/availability',

            async function EndpointsController_check(request: any, response: any, next: any) {
            const args = {
                    serviceName: {"in":"query","name":"serviceName","required":true,"dataType":"string"},
                    request: {"in":"request","name":"request","required":true,"dataType":"object"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const container: IocContainer = typeof iocContainer === 'function' ? (iocContainer as IocContainerFactory)(request) : iocContainer;

                const controller: any = await container.get<EndpointsController>(EndpointsController);
                if (typeof controller['setStatus'] === 'function') {
                controller.setStatus(undefined);
                }


              const promise = controller.check.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.get('/ds/api/v3/gateways/report',
            authenticateMiddleware([{"jwt":[]}]),

            async function NamespaceController_report(request: any, response: any, next: any) {
            const args = {
                    req: {"in":"request","name":"req","required":true,"dataType":"object"},
                    ids: {"default":"[]","in":"query","name":"ids","dataType":"string"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const container: IocContainer = typeof iocContainer === 'function' ? (iocContainer as IocContainerFactory)(request) : iocContainer;

                const controller: any = await container.get<NamespaceController>(NamespaceController);
                if (typeof controller['setStatus'] === 'function') {
                controller.setStatus(undefined);
                }


              const promise = controller.report.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.get('/ds/api/v3/gateways',
            authenticateMiddleware([{"jwt":[]}]),

            async function NamespaceController_list(request: any, response: any, next: any) {
            const args = {
                    request: {"in":"request","name":"request","required":true,"dataType":"object"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const container: IocContainer = typeof iocContainer === 'function' ? (iocContainer as IocContainerFactory)(request) : iocContainer;

                const controller: any = await container.get<NamespaceController>(NamespaceController);
                if (typeof controller['setStatus'] === 'function') {
                controller.setStatus(undefined);
                }


              const promise = controller.list.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.get('/ds/api/v3/gateways/:gatewayId',
            authenticateMiddleware([{"jwt":["Namespace.Manage"]}]),

            async function NamespaceController_profile(request: any, response: any, next: any) {
            const args = {
                    gatewayId: {"in":"path","name":"gatewayId","required":true,"dataType":"string"},
                    request: {"in":"request","name":"request","required":true,"dataType":"object"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const container: IocContainer = typeof iocContainer === 'function' ? (iocContainer as IocContainerFactory)(request) : iocContainer;

                const controller: any = await container.get<NamespaceController>(NamespaceController);
                if (typeof controller['setStatus'] === 'function') {
                controller.setStatus(undefined);
                }


              const promise = controller.profile.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.post('/ds/api/v3/gateways',
            authenticateMiddleware([{"jwt":[]}]),

            async function NamespaceController_create(request: any, response: any, next: any) {
            const args = {
                    request: {"in":"request","name":"request","required":true,"dataType":"object"},
                    vars: {"in":"body","name":"vars","required":true,"ref":"Gateway"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const container: IocContainer = typeof iocContainer === 'function' ? (iocContainer as IocContainerFactory)(request) : iocContainer;

                const controller: any = await container.get<NamespaceController>(NamespaceController);
                if (typeof controller['setStatus'] === 'function') {
                controller.setStatus(undefined);
                }


              const promise = controller.create.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.delete('/ds/api/v3/gateways/:gatewayId',
            authenticateMiddleware([{"jwt":["Namespace.Manage"]}]),

            async function NamespaceController_delete(request: any, response: any, next: any) {
            const args = {
                    gatewayId: {"in":"path","name":"gatewayId","required":true,"dataType":"string"},
                    force: {"default":false,"in":"query","name":"force","dataType":"boolean"},
                    request: {"in":"request","name":"request","required":true,"dataType":"object"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const container: IocContainer = typeof iocContainer === 'function' ? (iocContainer as IocContainerFactory)(request) : iocContainer;

                const controller: any = await container.get<NamespaceController>(NamespaceController);
                if (typeof controller['setStatus'] === 'function') {
                controller.setStatus(undefined);
                }


              const promise = controller.delete.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.get('/ds/api/v3/gateways/:gatewayId/activity',
            authenticateMiddleware([{"jwt":["Namespace.View"]}]),

            async function NamespaceController_namespaceActivity(request: any, response: any, next: any) {
            const args = {
                    gatewayId: {"in":"path","name":"gatewayId","required":true,"dataType":"string"},
                    first: {"default":20,"in":"query","name":"first","dataType":"double"},
                    skip: {"default":0,"in":"query","name":"skip","dataType":"double"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const container: IocContainer = typeof iocContainer === 'function' ? (iocContainer as IocContainerFactory)(request) : iocContainer;

                const controller: any = await container.get<NamespaceController>(NamespaceController);
                if (typeof controller['setStatus'] === 'function') {
                controller.setStatus(undefined);
                }


              const promise = controller.namespaceActivity.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.get('/ds/api/v3/gateways/:gatewayId/directory/:id',
            authenticateMiddleware([{"jwt":["Namespace.Manage"]}]),

            async function NamespaceDirectoryController_getDataset(request: any, response: any, next: any) {
            const args = {
                    gatewayId: {"in":"path","name":"gatewayId","required":true,"dataType":"string"},
                    id: {"in":"path","name":"id","required":true,"dataType":"string"},
                    request: {"in":"request","name":"request","required":true,"dataType":"object"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const container: IocContainer = typeof iocContainer === 'function' ? (iocContainer as IocContainerFactory)(request) : iocContainer;

                const controller: any = await container.get<NamespaceDirectoryController>(NamespaceDirectoryController);
                if (typeof controller['setStatus'] === 'function') {
                controller.setStatus(undefined);
                }


              const promise = controller.getDataset.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.get('/ds/api/v3/gateways/:gatewayId/directory',
            authenticateMiddleware([{"jwt":["Namespace.Manage"]}]),

            async function NamespaceDirectoryController_getDatasets(request: any, response: any, next: any) {
            const args = {
                    gatewayId: {"in":"path","name":"gatewayId","required":true,"dataType":"string"},
                    request: {"in":"request","name":"request","required":true,"dataType":"object"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const container: IocContainer = typeof iocContainer === 'function' ? (iocContainer as IocContainerFactory)(request) : iocContainer;

                const controller: any = await container.get<NamespaceDirectoryController>(NamespaceDirectoryController);
                if (typeof controller['setStatus'] === 'function') {
                controller.setStatus(undefined);
                }


              const promise = controller.getDatasets.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.put('/ds/api/v3/gateways/:gatewayId/services',
            authenticateMiddleware([{"jwt":["Gateway.Config"]}]),
            upload.single('configFile'),

            async function GatewayController_put(request: any, response: any, next: any) {
            const args = {
                    dryRun: {"in":"formData","name":"dryRun","required":true,"dataType":"string"},
                    configFile: {"in":"formData","name":"configFile","required":true,"dataType":"file"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const container: IocContainer = typeof iocContainer === 'function' ? (iocContainer as IocContainerFactory)(request) : iocContainer;

                const controller: any = await container.get<GatewayController>(GatewayController);
                if (typeof controller['setStatus'] === 'function') {
                controller.setStatus(undefined);
                }


              const promise = controller.put.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.get('/ds/api/v3/gateways/:gatewayId/services',
            authenticateMiddleware([{"jwt":["Namespace.Manage"]}]),

            async function GatewayController_get(request: any, response: any, next: any) {
            const args = {
                    gatewayId: {"in":"path","name":"gatewayId","required":true,"dataType":"string"},
                    request: {"in":"request","name":"request","required":true,"dataType":"object"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const container: IocContainer = typeof iocContainer === 'function' ? (iocContainer as IocContainerFactory)(request) : iocContainer;

                const controller: any = await container.get<GatewayController>(GatewayController);
                if (typeof controller['setStatus'] === 'function') {
                controller.setStatus(undefined);
                }


              const promise = controller.get.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.get('/ds/api/v3/identifiers/:type',

            async function IdentifiersController_getNewID(request: any, response: any, next: any) {
            const args = {
                    type: {"in":"path","name":"type","required":true,"dataType":"union","subSchemas":[{"dataType":"enum","enums":["environment"]},{"dataType":"enum","enums":["product"]},{"dataType":"enum","enums":["application"]},{"dataType":"enum","enums":["gateway"]}]},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const container: IocContainer = typeof iocContainer === 'function' ? (iocContainer as IocContainerFactory)(request) : iocContainer;

                const controller: any = await container.get<IdentifiersController>(IdentifiersController);
                if (typeof controller['setStatus'] === 'function') {
                controller.setStatus(undefined);
                }


              const promise = controller.getNewID.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.put('/ds/api/v3/gateways/:gatewayId/issuers',
            authenticateMiddleware([{"jwt":["CredentialIssuer.Admin"]}]),

            async function IssuerController_put(request: any, response: any, next: any) {
            const args = {
                    gatewayId: {"in":"path","name":"gatewayId","required":true,"dataType":"string"},
                    body: {"in":"body","name":"body","required":true,"ref":"CredentialIssuer"},
                    request: {"in":"request","name":"request","required":true,"dataType":"object"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const container: IocContainer = typeof iocContainer === 'function' ? (iocContainer as IocContainerFactory)(request) : iocContainer;

                const controller: any = await container.get<IssuerController>(IssuerController);
                if (typeof controller['setStatus'] === 'function') {
                controller.setStatus(undefined);
                }


              const promise = controller.put.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.get('/ds/api/v3/gateways/:gatewayId/issuers',
            authenticateMiddleware([{"jwt":["Namespace.Manage"]}]),

            async function IssuerController_get(request: any, response: any, next: any) {
            const args = {
                    gatewayId: {"in":"path","name":"gatewayId","required":true,"dataType":"string"},
                    request: {"in":"request","name":"request","required":true,"dataType":"object"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const container: IocContainer = typeof iocContainer === 'function' ? (iocContainer as IocContainerFactory)(request) : iocContainer;

                const controller: any = await container.get<IssuerController>(IssuerController);
                if (typeof controller['setStatus'] === 'function') {
                controller.setStatus(undefined);
                }


              const promise = controller.get.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.delete('/ds/api/v3/gateways/:gatewayId/issuers/:name',
            authenticateMiddleware([{"jwt":["CredentialIssuer.Admin"]}]),

            async function IssuerController_delete(request: any, response: any, next: any) {
            const args = {
                    gatewayId: {"in":"path","name":"gatewayId","required":true,"dataType":"string"},
                    name: {"in":"path","name":"name","required":true,"dataType":"string"},
                    request: {"in":"request","name":"request","required":true,"dataType":"object"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const container: IocContainer = typeof iocContainer === 'function' ? (iocContainer as IocContainerFactory)(request) : iocContainer;

                const controller: any = await container.get<IssuerController>(IssuerController);
                if (typeof controller['setStatus'] === 'function') {
                controller.setStatus(undefined);
                }


              const promise = controller.delete.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.get('/ds/api/v3/organizations',

            async function OrganizationController_listOrganizations(request: any, response: any, next: any) {
            const args = {
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const container: IocContainer = typeof iocContainer === 'function' ? (iocContainer as IocContainerFactory)(request) : iocContainer;

                const controller: any = await container.get<OrganizationController>(OrganizationController);
                if (typeof controller['setStatus'] === 'function') {
                controller.setStatus(undefined);
                }


              const promise = controller.listOrganizations.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.put('/ds/api/v3/organizations/:org',
            authenticateMiddleware([{"jwt":["GroupAccess.Manage"]}]),

            async function OrganizationController_post(request: any, response: any, next: any) {
            const args = {
                    org: {"in":"path","name":"org","required":true,"dataType":"string"},
                    body: {"in":"body","name":"body","required":true,"ref":"Organization"},
                    request: {"in":"request","name":"request","required":true,"dataType":"object"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const container: IocContainer = typeof iocContainer === 'function' ? (iocContainer as IocContainerFactory)(request) : iocContainer;

                const controller: any = await container.get<OrganizationController>(OrganizationController);
                if (typeof controller['setStatus'] === 'function') {
                controller.setStatus(undefined);
                }


              const promise = controller.post.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.get('/ds/api/v3/organizations/:org',

            async function OrganizationController_listOrganizationUnits(request: any, response: any, next: any) {
            const args = {
                    org: {"in":"path","name":"org","required":true,"dataType":"string"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const container: IocContainer = typeof iocContainer === 'function' ? (iocContainer as IocContainerFactory)(request) : iocContainer;

                const controller: any = await container.get<OrganizationController>(OrganizationController);
                if (typeof controller['setStatus'] === 'function') {
                controller.setStatus(undefined);
                }


              const promise = controller.listOrganizationUnits.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.get('/ds/api/v3/organizations/:org/roles',
            authenticateMiddleware([{"jwt":["GroupAccess.Manage"]}]),

            async function OrganizationController_getPolicies(request: any, response: any, next: any) {
            const args = {
                    org: {"in":"path","name":"org","required":true,"dataType":"string"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const container: IocContainer = typeof iocContainer === 'function' ? (iocContainer as IocContainerFactory)(request) : iocContainer;

                const controller: any = await container.get<OrganizationController>(OrganizationController);
                if (typeof controller['setStatus'] === 'function') {
                controller.setStatus(undefined);
                }


              const promise = controller.getPolicies.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.get('/ds/api/v3/organizations/:org/access',
            authenticateMiddleware([{"jwt":["GroupAccess.Manage"]}]),

            async function OrganizationController_get(request: any, response: any, next: any) {
            const args = {
                    org: {"in":"path","name":"org","required":true,"dataType":"string"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const container: IocContainer = typeof iocContainer === 'function' ? (iocContainer as IocContainerFactory)(request) : iocContainer;

                const controller: any = await container.get<OrganizationController>(OrganizationController);
                if (typeof controller['setStatus'] === 'function') {
                controller.setStatus(undefined);
                }


              const promise = controller.get.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.put('/ds/api/v3/organizations/:org/access',
            authenticateMiddleware([{"jwt":["GroupAccess.Manage"]}]),

            async function OrganizationController_put(request: any, response: any, next: any) {
            const args = {
                    org: {"in":"path","name":"org","required":true,"dataType":"string"},
                    body: {"in":"body","name":"body","required":true,"ref":"GroupMembership"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const container: IocContainer = typeof iocContainer === 'function' ? (iocContainer as IocContainerFactory)(request) : iocContainer;

                const controller: any = await container.get<OrganizationController>(OrganizationController);
                if (typeof controller['setStatus'] === 'function') {
                controller.setStatus(undefined);
                }


              const promise = controller.put.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.get('/ds/api/v3/organizations/:org/gateways',
            authenticateMiddleware([{"jwt":["Namespace.Assign"]}]),

            async function OrganizationController_listNamespaces(request: any, response: any, next: any) {
            const args = {
                    org: {"in":"path","name":"org","required":true,"dataType":"string"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const container: IocContainer = typeof iocContainer === 'function' ? (iocContainer as IocContainerFactory)(request) : iocContainer;

                const controller: any = await container.get<OrganizationController>(OrganizationController);
                if (typeof controller['setStatus'] === 'function') {
                controller.setStatus(undefined);
                }


              const promise = controller.listNamespaces.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.put('/ds/api/v3/organizations/:org/:orgUnit/gateways/:gatewayId',
            authenticateMiddleware([{"jwt":["Namespace.Assign"]}]),

            async function OrganizationController_assignNamespace(request: any, response: any, next: any) {
            const args = {
                    org: {"in":"path","name":"org","required":true,"dataType":"string"},
                    orgUnit: {"in":"path","name":"orgUnit","required":true,"dataType":"string"},
                    gatewayId: {"in":"path","name":"gatewayId","required":true,"dataType":"string"},
                    enable: {"default":true,"in":"query","name":"enable","dataType":"boolean"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const container: IocContainer = typeof iocContainer === 'function' ? (iocContainer as IocContainerFactory)(request) : iocContainer;

                const controller: any = await container.get<OrganizationController>(OrganizationController);
                if (typeof controller['setStatus'] === 'function') {
                controller.setStatus(undefined);
                }


              const promise = controller.assignNamespace.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.delete('/ds/api/v3/organizations/:org/:orgUnit/gateways/:gatewayId',
            authenticateMiddleware([{"jwt":["Namespace.Assign"]}]),

            async function OrganizationController_unassignNamespace(request: any, response: any, next: any) {
            const args = {
                    org: {"in":"path","name":"org","required":true,"dataType":"string"},
                    orgUnit: {"in":"path","name":"orgUnit","required":true,"dataType":"string"},
                    gatewayId: {"in":"path","name":"gatewayId","required":true,"dataType":"string"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const container: IocContainer = typeof iocContainer === 'function' ? (iocContainer as IocContainerFactory)(request) : iocContainer;

                const controller: any = await container.get<OrganizationController>(OrganizationController);
                if (typeof controller['setStatus'] === 'function') {
                controller.setStatus(undefined);
                }


              const promise = controller.unassignNamespace.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.get('/ds/api/v3/organizations/:org/activity',
            authenticateMiddleware([{"jwt":["Namespace.Assign"]}]),

            async function OrganizationController_namespaceActivity(request: any, response: any, next: any) {
            const args = {
                    org: {"in":"path","name":"org","required":true,"dataType":"string"},
                    first: {"default":20,"in":"query","name":"first","dataType":"double"},
                    skip: {"default":0,"in":"query","name":"skip","dataType":"double"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const container: IocContainer = typeof iocContainer === 'function' ? (iocContainer as IocContainerFactory)(request) : iocContainer;

                const controller: any = await container.get<OrganizationController>(OrganizationController);
                if (typeof controller['setStatus'] === 'function') {
                controller.setStatus(undefined);
                }


              const promise = controller.namespaceActivity.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.get('/ds/api/v3/roles',

            async function OrgRoleController_getRoles(request: any, response: any, next: any) {
            const args = {
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const container: IocContainer = typeof iocContainer === 'function' ? (iocContainer as IocContainerFactory)(request) : iocContainer;

                const controller: any = await container.get<OrgRoleController>(OrgRoleController);
                if (typeof controller['setStatus'] === 'function') {
                controller.setStatus(undefined);
                }


              const promise = controller.getRoles.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.put('/ds/api/v3/gateways/:gatewayId/products',
            authenticateMiddleware([{"jwt":["Namespace.Manage"]}]),

            async function ProductController_put(request: any, response: any, next: any) {
            const args = {
                    gatewayId: {"in":"path","name":"gatewayId","required":true,"dataType":"string"},
                    body: {"in":"body","name":"body","required":true,"ref":"Product"},
                    request: {"in":"request","name":"request","required":true,"dataType":"object"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const container: IocContainer = typeof iocContainer === 'function' ? (iocContainer as IocContainerFactory)(request) : iocContainer;

                const controller: any = await container.get<ProductController>(ProductController);
                if (typeof controller['setStatus'] === 'function') {
                controller.setStatus(undefined);
                }


              const promise = controller.put.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.get('/ds/api/v3/gateways/:gatewayId/products',
            authenticateMiddleware([{"jwt":["Namespace.Manage"]}]),

            async function ProductController_get(request: any, response: any, next: any) {
            const args = {
                    request: {"in":"request","name":"request","required":true,"dataType":"object"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const container: IocContainer = typeof iocContainer === 'function' ? (iocContainer as IocContainerFactory)(request) : iocContainer;

                const controller: any = await container.get<ProductController>(ProductController);
                if (typeof controller['setStatus'] === 'function') {
                controller.setStatus(undefined);
                }


              const promise = controller.get.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.delete('/ds/api/v3/gateways/:gatewayId/products/:appId',
            authenticateMiddleware([{"jwt":["Namespace.Manage"]}]),

            async function ProductController_delete(request: any, response: any, next: any) {
            const args = {
                    gatewayId: {"in":"path","name":"gatewayId","required":true,"dataType":"string"},
                    appId: {"in":"path","name":"appId","required":true,"dataType":"string"},
                    request: {"in":"request","name":"request","required":true,"dataType":"object"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const container: IocContainer = typeof iocContainer === 'function' ? (iocContainer as IocContainerFactory)(request) : iocContainer;

                const controller: any = await container.get<ProductController>(ProductController);
                if (typeof controller['setStatus'] === 'function') {
                controller.setStatus(undefined);
                }


              const promise = controller.delete.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.delete('/ds/api/v3/gateways/:gatewayId/environments/:appId',
            authenticateMiddleware([{"jwt":["Namespace.Manage"]}]),

            async function ProductController_deleteEnvironment(request: any, response: any, next: any) {
            const args = {
                    gatewayId: {"in":"path","name":"gatewayId","required":true,"dataType":"string"},
                    appId: {"in":"path","name":"appId","required":true,"dataType":"string"},
                    force: {"default":false,"in":"query","name":"force","dataType":"boolean"},
                    request: {"in":"request","name":"request","required":true,"dataType":"object"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const container: IocContainer = typeof iocContainer === 'function' ? (iocContainer as IocContainerFactory)(request) : iocContainer;

                const controller: any = await container.get<ProductController>(ProductController);
                if (typeof controller['setStatus'] === 'function') {
                controller.setStatus(undefined);
                }


              const promise = controller.deleteEnvironment.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa


    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

    function authenticateMiddleware(security: TsoaRoute.Security[] = []) {
        return async function runAuthenticationMiddleware(request: any, _response: any, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            // keep track of failed auth attempts so we can hand back the most
            // recent one.  This behavior was previously existing so preserving it
            // here
            const failedAttempts: any[] = [];
            const pushAndRethrow = (error: any) => {
                failedAttempts.push(error);
                throw error;
            };

            const secMethodOrPromises: Promise<any>[] = [];
            for (const secMethod of security) {
                if (Object.keys(secMethod).length > 1) {
                    const secMethodAndPromises: Promise<any>[] = [];

                    for (const name in secMethod) {
                        secMethodAndPromises.push(
                            expressAuthentication(request, name, secMethod[name])
                                .catch(pushAndRethrow)
                        );
                    }

                    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

                    secMethodOrPromises.push(Promise.all(secMethodAndPromises)
                        .then(users => { return users[0]; }));
                } else {
                    for (const name in secMethod) {
                        secMethodOrPromises.push(
                            expressAuthentication(request, name, secMethod[name])
                                .catch(pushAndRethrow)
                        );
                    }
                }
            }

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            try {
                request['user'] = await promiseAny(secMethodOrPromises);
                next();
            }
            catch(err) {
                // Show most recent error as response
                const error = failedAttempts.pop();
                error.status = error.status || 401;
                next(error);
            }

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        }
    }

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
