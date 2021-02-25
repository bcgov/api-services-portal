import { gql } from 'graphql-request';

export const GET_LIST = gql`
  query GetServices {
    allGatewayServices(first:200) {
        id
        name
        environment {
            id
            name
            active
            authMethod
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
            hosts
        }
    }
  }
`;

export const GET_METRICS = gql`
    query GetMetrics($service: String!, $days: [String!]) {
        allGatewayMetrics(sortBy: day_ASC, where: { 
                query: "kong_http_status", 
                day_in: $days, 
                service: { name_contains: $service 
        }}) {
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