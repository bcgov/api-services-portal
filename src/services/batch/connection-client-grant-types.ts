export type ConnectionClientGrantStatus = 'pending' | 'approved' | 'rejected';

export interface ConnectionClientGrantInput {
  integrationId: string;
  oauthClientId: string;
  submissionId?: string;
  requesterDetails?: any;
  scopes: string[];
}

export interface ConnectionClientGrantApprovalInput {
  status: Exclude<ConnectionClientGrantStatus, 'pending'>;
}
