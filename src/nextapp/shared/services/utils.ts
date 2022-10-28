import {
  FaKey,
  FaLock,
  FaLockOpen,
  // FaUserSecret,
} from 'react-icons/fa';
import { IconType } from 'react-icons/lib';
import fs from 'fs';
import { join } from 'path';


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

export const getFlowText = (key: string): string => {
  const dict = {
    public: 'Public',
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


const postsDirectory = join(process.cwd(), 'nextapp', '_content')

export function getDocSlugs() {
  return fs.readdirSync(postsDirectory)
}

export function getAllDocs() {
  const slugs = getDocSlugs()
  const docs = slugs.map((slug) => getDocBySlug(slug))
  return docs
}

interface DocProps {
  slug: string
  content: string
}

export function getDocBySlug(slug: string) : DocProps {
  
  const realSlug = slug.replace(/\.md$/, '')
  const fullPath = join(postsDirectory, `${realSlug}.md`)
  const fileContents = fs.readFileSync(fullPath, 'utf8')

  return {slug: realSlug, content: fileContents}
}
