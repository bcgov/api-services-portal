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
  /** SDX UI origin for onboarding notices. */
  sdxUiUrl: string;
  apsOnboardingTicketUrl?: string;
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
