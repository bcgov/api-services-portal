import * as React from 'react';
import { Text } from '@chakra-ui/react';

export interface ErrorProps {
  message: string;
  statusCode: number;
}

export const getInitialProps = ({ res, err }) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode, message: err?.message };
};

const Error: React.FC<ErrorProps> = ({ message, statusCode }) => {
  return (
    <>
      {' '}
      <Text>
        {statusCode
          ? `An error ${statusCode} occurred on server`
          : 'An error occurred on client'}
      </Text>
      {message && (
        <Text as="samp" color="red.700" mt={4}>
          {message}
        </Text>
      )}
    </>
  );
};

export default Error;
