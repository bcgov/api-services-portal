import * as React from 'react';
import AppError from '@/components/app-error';
import { ErrorBoundary } from 'react-error-boundary';

interface ClientRequestProps {
  children: React.ReactNode;
  fallback: React.ReactNode;
}

const ClientRequest: React.FC<ClientRequestProps> = ({
  children,
  fallback,
}) => {
  const isServer = typeof window === 'undefined';

  if (isServer) {
    return <div />;
  }

  return (
    <ErrorBoundary fallback={<AppError />}>
      <React.Suspense fallback={fallback}>{children}</React.Suspense>
    </ErrorBoundary>
  );
};

export default ClientRequest;
