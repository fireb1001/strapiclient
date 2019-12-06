import { gql } from "apollo-boost";

export const GET_SPROVIDERS = gql`
  query getSproviders($where: JSON!) {
    sproviders(where: $where, sort: "_id:desc") {
      id
      name
      description
      archived
      website
      createdAt
      updatedAt
      mediaitems {
        id
        alt
        media {
          url
        }
      }
    }
  }
`;

export const CREATE_SPROVIDER = gql`
  mutation($name: String!) {
    createSprovider(input: { data: { name: $name } }) {
      sprovider {
        id
      }
    }
  }
`;

export const UPDATE_SPROVIDER = gql`
  mutation updateSprovider($id: ID!, $data: editSproviderInput) {
    updateSprovider(input: { where: { id: $id }, data: $data }) {
      sprovider {
        id
        name
        description
        archived
        website
        createdAt
        updatedAt
        mediaitems {
          id
          alt
          media {
            url
          }
        }
      }
    }
  }
`;

export const DELETE_SPROVIDER = gql`
  mutation deleteSprovider($id: ID!) {
    deleteSprovider(input: { where: { id: $id } }) {
      sprovider {
        id
      }
    }
  }
`;
