import { UserData } from '@/types';
import {
  FaKey,
  FaLock,
  FaLockOpen
} from 'react-icons/fa';
import { IconType } from 'react-icons/lib';

export const serializeFormData = (formData: FormData): unknown => {
  const response: unknown = {};

  for (const key of formData.keys()) {
    response[key] = formData.get(key);
  }

  return response;
};

export const getAuthToken = (method: string): IconType => {
  switch (method) {
    case 'kong-acl-only':
      return FaLock;
    case 'kong-api-key-only':
      return FaKey;
    case 'kong-api-key-acl':
      return FaKey;
    case 'authorization-code':
      return FaLock;
    case 'client-credentials':
      return FaLock;
    case 'protected-externally':
      return FaLock;
    // case 'private':
    //   return FaUserSecret;
    case 'public':
    default:
      return FaLockOpen;
  }
};

export const getFlowText = (key: string): string => {
  const dict = {
    public: 'Public',
    'protected-externally': 'Protected Externally',
    'authorization-code': 'OAuth2 Authorization Code Flow',
    'client-credentials': 'OAuth2 Client Credentials Flow',
    'kong-acl-only': 'Kong ACL Only',
    'kong-api-key-only': 'Kong API Key Only',
    'kong-api-key-acl': 'Kong API Key with ACL Flow',
  };
  return dict[key] ?? 'Unknown';
};

export const getProviderText = (provider: string): string => {
  switch (provider) {
    case 'bcsc':
      return 'BC Services Card';
    case 'idir':
      return 'IDIR';
    case 'bceid-business':
      return 'Business BCeID';
    case 'github':
      return 'GitHub';
    default:
      return '';
  }
};

export const delay = async (timeout = 100): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(resolve, timeout);
  });
};

export const updateRecentlyViewedNamespaces = (namespacesRecentlyViewed: any[], user: UserData) => {
  const existingEntryIndex = namespacesRecentlyViewed.findIndex((entry: any) => entry.userId === user.userId && entry.namespace === user.namespace);

  if (existingEntryIndex !== -1) {
    // Update existing entry
    namespacesRecentlyViewed[existingEntryIndex].updatedAt = user.updatedAt;
  } else {
    // Add new entry
    namespacesRecentlyViewed.push({
      userId: user.userId,
      namespace: user.namespace,
      updatedAt: user.updatedAt
    });
  }

  // Update localStorage
  localStorage.setItem('namespacesRecentlyViewed', JSON.stringify(namespacesRecentlyViewed));
};
