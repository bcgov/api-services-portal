export const ignoredRedirects = ['/signout', '/login'];

export const makeRedirectUrl = (path: string, identity?: string): string => {
  const isExactIgnoredPath = ignoredRedirects.includes(path);
  const isFuzzyIgnoredPath = ignoredRedirects.some((p) => path.startsWith(p));

  if (isExactIgnoredPath || isFuzzyIgnoredPath) {
    if (identity === 'provider') {
      return '/manager/gateways';
    }
    return '/auth_callback';
  }

  return path;
};
