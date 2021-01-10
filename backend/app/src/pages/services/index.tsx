import * as React from 'react';
import Head from 'next/head';

import { gql } from 'graphql-request';
import api from '../../shared/services/api';

import Card from '../../components/card';

const ServicesPage = ({ services }) => {
  return (
    <>
      <Head>
        <title>API Program Services | Services</title>
      </Head>
      <div>Services

          { services.map (service => (
            <Card>
                {service.name}
            </Card>
          ))}
      </div>
    </>
  );
};

export default ServicesPage;

export async function getServerSideProps(context) {
    const query = gql`
      {
        allServiceRoutes(where: {  }) {
          id
          name
          host
        }
      }
    `;
    const results = await api(query);
  
    return {
      props: {
        services: results.allServiceRoutes,
      },
    };
}

const ADD_TODO = `
    mutation AddServiceRoute($name: String!) {
        createServiceRoute(data: { name: $name }) {
            name
            id
        }
    }
`;