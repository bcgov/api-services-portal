const { distDir } = require('../config');

module.exports = {
  distDir: `../${distDir}/www`,
  env: {
    USER_HAS_PORTFOLIO: !!process.env.IFRAMELY_API_KEY,
    GHI: '123',
    JKL: process.env.JKL,
    NEXT_PUBLIC_KUBE_CLUSTER: process.env.NEXT_PUBLIC_KUBE_CLUSTER,
  },
  publicRuntimeConfig: {
    ABC: '123',
    DEF: process.env.DEF,
    P: process.env.NEXT_PUBLIC_KUBE_CLUSTER,
    NEXT_PUBLIC_KUBE_CLUSTER: process.env.NEXT_PUBLIC_KUBE_CLUSTER,
    mix: {
      helpLinks: [],
    },
  },
};
