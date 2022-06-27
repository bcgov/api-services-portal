import * as React from 'react';
import { Grid, GridItem, Tag, Text } from '@chakra-ui/react';
import { AccessRequest } from '@/shared/types/query.types';
import BusinessDetails from './business-details';
import { ErrorBoundary } from 'react-error-boundary';
import format from 'date-fns/format';

interface RequestDetailsProps {
  data: AccessRequest;
}

const RequestDetails: React.FC<RequestDetailsProps> = ({ data }) => {
  return (
    <Grid
      templateColumns="205px 1fr"
      rowGap={3}
      columnGap={2}
      sx={{
        '& dt:after': {
          content: '":"',
        },
      }}
      data-testid="ar-request-details"
    >
      <GridItem as="dt">Environment</GridItem>
      <GridItem as="dd">
        <Tag bgColor="#fed77680" variant="outline">
          {data.productEnvironment?.name}
        </Tag>
      </GridItem>
      <GridItem as="dt">Application</GridItem>
      <GridItem as="dd">{data.application.name}</GridItem>
      <GridItem as="dt">Request Date</GridItem>
      <GridItem as="dd">
        <time>{format(new Date(data.createdAt), 'MMM do, yyyy')}</time>
      </GridItem>
      <GridItem as="dt">Business Profile</GridItem>
      <GridItem as="dd">
        <ErrorBoundary
          fallback={
            <Text as="em" color="bc-component" role="alert">
              Unable to load business profile
            </Text>
          }
        >
          <React.Suspense fallback="Loading...">
            <BusinessDetails id={data.id} />
          </React.Suspense>
        </ErrorBoundary>
      </GridItem>
      <GridItem as="dt">Instructions from the API Provider</GridItem>
      <GridItem as="dd">
        {data.productEnvironment?.additionalDetailsToRequest}
      </GridItem>
      <GridItem as="dt">Requester Comments</GridItem>
      <GridItem as="dd">{data.additionalDetails}</GridItem>
    </Grid>
  );
};

export default RequestDetails;
