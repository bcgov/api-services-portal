import * as React from 'react';
import Head from 'next/head';

import { gql } from 'graphql-request';
import api from '../../shared/services/api';

import Card from '../../components/card';

interface ServicesPageProps {
  services: any[];
}

const ServicesPage: React.FC<ServicesPageProps> = ({ services }) => {
  return (
    <>
      <Head>
        <title>API Program Services | Services</title>
      </Head>
      <div>
        Services
        {services.map((service) => (
          <Card key={service.id}>{service.name}</Card>
        ))}
      </div>
    </>
  );
};

export default ServicesPage;

export async function getServerSideProps(context) {
  const query = gql`
    {
      allGatewayServices(where: {}) {
        id
        name
        host
      }
    }
  `;
  const results: { allGatewayServices: any[] } = await api(query);

  return {
    props: {
      services: results.allGatewayServices,
    },
  };
}
