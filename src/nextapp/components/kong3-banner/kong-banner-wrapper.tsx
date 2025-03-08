import * as React from 'react';
import { useAuth } from '@/shared/services/auth';

import KongBanner from './kong-banner';

interface KongBannerWrapperProps {
  text?: string;
  title?: string;
}

const KongBannerWrapper: React.FC<KongBannerWrapperProps> = (
  props
) => {
  const { maintenance } = useAuth();

  if (maintenance) {
    return null;
  }

  return <KongBanner {...props} />;
};

export default KongBannerWrapper;
