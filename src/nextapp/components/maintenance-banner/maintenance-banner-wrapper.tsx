import * as React from 'react';
import { useAuth } from '@/shared/services/auth';

import MaintenanceBanner from './maintenance-banner';

interface MaintenanceBannerWrapperProps {
  text?: string;
  title?: string;
}

const MaintenanceBannerWrapper: React.FC<MaintenanceBannerWrapperProps> = (
  props
) => {
  const { maintenance } = useAuth();

  if (!maintenance) {
    return null;
  }

  return <MaintenanceBanner {...props} />;
};

export default MaintenanceBannerWrapper;
