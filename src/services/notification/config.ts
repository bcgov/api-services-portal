export interface NotificationConfig {
  enabled: boolean;
  secure: boolean;
  from: string;
  host: string;
  port: number;
  user: string;
  pass: string;
  /** Inbox for new Common SSO onboarding tasks. Unset skips that email. */
  apsOnboardingEmail: string;
  /**
   * Tech Lead invite link. `{id}` is replaced with the integration id.
   * Empty uses `${sdxUiUrl}/onboarding/invite?integrationId={id}`.
   */
  sdxOnboardingInviteUrl: string;
  /** SDX UI origin used when `sdxOnboardingInviteUrl` is unset. */
  sdxUiUrl: string;
}

export interface EmailNotification {
  template: string;
  subject: string;
  context?: Record<string, string | number | boolean>;
}

export interface User {
  email: string;
  username: string;
  name: string;
}
