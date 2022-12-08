export const ignoredRedirects = ['/signout', '/login'];

export const makeRedirectUrl = (path: string): string => {
  const isExactIgnoredPath = ignoredRedirects.includes(path);
  const isFuzzyIgnoredPath = ignoredRedirects.some((p) => path.startsWith(p));

  if (isExactIgnoredPath || isFuzzyIgnoredPath) {
    return '/';
  }

  return path;
};
