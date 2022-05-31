const { distDir } = require('../config');

module.exports = {
  distDir: `../${distDir}/www`,
  env: {
    USER_HAS_PORTFOLIO: !!process.env.IFRAMELY_API_KEY,
  },
  publicRuntimeConfig: {
    appCluster: process.env.NEXT_PUBLIC_KUBE_CLUSTER,
    appRevision: process.env.NEXT_PUBLIC_APP_REVISION,
    appVersion: process.env.NEXT_PUBLIC_APP_VERSION,
    helpDeskUrl: process.env.NEXT_PUBLIC_HELP_DESK_URL,
    helpChatUrl: process.env.NEXT_PUBLIC_HELP_CHAT_URL,
    helpIssueUrl: process.env.NEXT_PUBLIC_HELP_ISSUE_URL,
    helpApiDocsUrl: process.env.NEXT_PUBLIC_HELP_API_DOCS_URL,
    helpSupportUrl: process.env.NEXT_PUBLIC_HELP_SUPPORT_URL,
    helpReleaseUrl: process.env.NEXT_PUBLIC_HELP_RELEASE_URL,
    helpStatusUrl: process.env.NEXT_PUBLIC_HELP_STATUS_URL,
  },
};
