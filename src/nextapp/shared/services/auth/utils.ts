export const ignoredRedirects = ['/signout', '/login'];

export const makeRedirectUrl = (path: string, identity?: string): string => {
  const isExactIgnoredPath = ignoredRedirects.includes(path);
  const isFuzzyIgnoredPath = ignoredRedirects.some((p) => path.startsWith(p));
  const isRoot = path === '/';

  if (isExactIgnoredPath || isFuzzyIgnoredPath || isRoot) {
    if (identity === 'provider') {
      return '/auth_callback?identity=provider';
    }
    return '/auth_callback';
  }

  return path;
};
