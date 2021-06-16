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
