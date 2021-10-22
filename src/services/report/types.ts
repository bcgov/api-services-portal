import { IssuerEnvironmentConfig } from '../workflow/types';

export interface ReportContext {
  data: any;
  issuerConfig: IssuerEnvironmentConfig;
}

enum SubjectType {
  Client,
  User,
}

export interface ReportNamespaceAccess {
  subject: string;
  subjectType: SubjectType;
  scope: string;
}
