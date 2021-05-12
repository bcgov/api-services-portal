import { IConfig } from "./config";

export class ConfigService {
  getConfig(): IConfig {
    return {
      auth: {
        url: process.env.KEYCLOAK_AUTH_URL,
        realm: process.env.KEYCLOAK_REALM,
        openIdConfigurationUrl: this.getOpenIdConfigurationUrl(),
        externalSiteMinderLogoutUrl: process.env.SITE_MINDER_LOGOUT_URL,
      },
      bceid: {
        wsdlEndpoint: process.env.BCeID_WEB_SERVICE_WSDL,
        onlineServiceId: process.env.BCeID_WEB_SERVICE_ONLINE_SERVICE_ID,
        requesterUserGuid: process.env.BCeID_WEB_SERVICE_REQUESTER_USER_GUID,
        credential: {
          userName: process.env.BCeID_WEB_SERVICE_AUTH_USER_NAME,
          password: process.env.BCeID_WEB_SERVICE_AUTH_USER_PASSWORD,
        },
      },
      workflow: {
        ruleEngineUrl: process.env.RULE_ENGINE_URL,
        serviceAccountCredential: {
          userName: process.env.WORKFLOW_SA_USER_NAME,
          password: process.env.WORKFLOW_SA_PASSWORD,
        },
      },
      forms: {
        formsUrl: process.env.FORMS_URL,
        serviceAccountCredential: {
          userName: process.env.FORMS_SA_USER_NAME,
          password: process.env.FORMS_SA_PASSWORD,
        },
      },
      notification: {
        enabled: ['true','TRUE'].includes(process.env.EMAIL_ENABLED || 'false'),
        secure: ['true','TRUE'].includes(process.env.EMAIL_SECURE || 'false'),
        from: process.env.EMAIL_FROM || '',
        host: process.env.EMAIL_HOST || '',
        port: Number(process.env.EMAIL_PORT || 25),
        user: process.env.EMAIL_USER || '',
        pass: process.env.EMAIL_PASS || ''
      }
    };
  }

  private getOpenIdConfigurationUrl(): string {
    return new URL(
      `realms/${process.env.KEYCLOAK_REALM}/.well-known/openid-configuration`,
      process.env.KEYCLOAK_AUTH_URL,
    ).href;
  }
}