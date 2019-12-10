import { gql } from "apollo-boost";

const FULL_QUERY = `{
  id
  name
  description
  published
  extras
  createdAt
  updatedAt
  content
  rawcontent
  sites {
    id
    name
  }
  mediaitems {
    id
    alt
    media {
      url
    }
  }
}
`;

export const GET_SPROVIDERS = gql`
  query getSproviders($where: JSON!) {
    sproviders(where: $where, sort: "_id:desc") ${FULL_QUERY}
  }
`;

export const GET_SPROVIDER = gql`
  query getSprovider($id: ID!) {
    sprovider(id: $id) ${FULL_QUERY}
  }
`;

export const CREATE_SPROVIDER = gql`
  mutation($name: String!) {
    createSprovider(input: { data: { name: $name } }) {
      sprovider ${FULL_QUERY}
    }
  }
`;

export const UPDATE_SPROVIDER = gql`
  mutation updateSprovider($id: ID!, $data: editSproviderInput) {
    updateSprovider(input: { where: { id: $id }, data: $data }) {
      sprovider ${FULL_QUERY}
    }
  }
`;

export const DELETE_SPROVIDER = gql`
  mutation deleteSprovider($id: ID!) {
    deleteSprovider(input: { where: { id: $id } }) {
      sprovider ${FULL_QUERY}
    }
  }
`;
