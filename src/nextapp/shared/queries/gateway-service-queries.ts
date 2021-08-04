import { gql } from 'graphql-request';

export const LIST_GATEWAY_SERVICES = gql`
  query GetServices($days: [String!]) {
    allGatewayServicesByNamespace(first: 200) {
      id
      name
      updatedAt
      environment {
        id
        name
        active
        flow
        product {
          name
          organization {
            title
          }
          organizationUnit {
            title
          }
        }
      }
      routes {
        id
        name
      }
      plugins {
        id
        name
      }
    }
    allMetrics(
      sortBy: day_ASC
      where: { query: "kong_http_requests_daily_namespace", day_in: $days }
    ) {
      query
      day
      metric
      values
    }
  }
`;

export const GET_GATEWAY_SERVICE = gql`
  query GET($id: ID!, $days: [String!]) {
    GatewayService(where: { id: $id }) {
      id
      name
      namespace
      tags
      host
      environment {
        id
        name
        active
        flow
        product {
          name
          organization {
            title
          }
          organizationUnit {
            title
          }
        }
      }
      plugins {
        id
        name
      }
      routes {
        id
        name
        hosts
        paths
        methods
      }
      updatedAt
    }
    allMetrics(
      sortBy: day_ASC
      where: { query: "kong_http_requests_daily_namespace", day_in: $days }
    ) {
      query
      day
      metric
      values
    }
  }
`;

export const GET_METRICS = gql`
  query GetMetrics($service: String!, $days: [String!]) {
    allMetrics(
      sortBy: day_ASC
      where: {
        query: "kong_http_requests_hourly_service"
        day_in: $days
        service: { name_contains: $service }
      }
    ) {
      query
      day
      metric
      values
      service {
        name
      }
    }
  }
`;
