import * as React from 'react';
import { Grid, GridItem, Tag, Text } from '@chakra-ui/react';

const RequestDetails: React.FC = () => {
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
    >
      <GridItem as="dt">Environment</GridItem>
      <GridItem as="dd">
        <Tag bgColor="#fed77680" variant="outline">
          Dev
        </Tag>
      </GridItem>
      <GridItem as="dt">Application</GridItem>
      <GridItem as="dd">Easy Mart Store 122</GridItem>
      <GridItem as="dt">Request Date</GridItem>
      <GridItem as="dd">July 16th, 2021</GridItem>
      <GridItem as="dt">Business Profile</GridItem>
      <GridItem as="dd">
        Easy Drug Mart 51, W Broadway Vancouver BC V8T 1E7
      </GridItem>
      <GridItem as="dt">Instructions from the API Provider</GridItem>
      <GridItem as="dd">
        Access to this API requires a BCeID. Your request will be rejected if
        you did not log into the Portal with a valid Business BCeID. To
        continue, please provide your contact phone number below.
      </GridItem>
      <GridItem as="dt">Requester Comments</GridItem>
      <GridItem as="dd">Phone Number 204-896-6325 & 204-896-7700. </GridItem>
    </Grid>
  );
};

export default RequestDetails;
