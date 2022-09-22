import {
  FaKey,
  FaLock,
  FaLockOpen,
  // FaUserSecret,
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
    // case 'private':
    //   return FaUserSecret;
    case 'public':
    default:
      return FaLockOpen;
  }
};

export const getProviderText = (provider: string): string => {
  switch (provider) {
    case 'bscs':
      return 'BC Services Card';
    case 'idir':
      return 'IDIR';
    case 'bceid':
      return 'Business BCeID';
    case 'github':
      return 'Github';
    default:
      return '';
  }
};

export const delay = async (timeout = 100): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(resolve, timeout);
  });
};
