import { gql } from "apollo-boost";

const FULL_QUERY = `{
  id
  title
  type
  description
  published
  extras
  createdAt
  updatedAt
  content
  rawcontent
}
`;

export const GET_CUSTOMTYPES = gql`
  query getCustomtypes($where: JSON!) {
    customtypes(where: $where, sort: "_id:desc") ${FULL_QUERY}
  }
`;

export const GET_CUSTOMTYPE = gql`
  query getCustomtype($id: ID!) {
    customtype(id: $id) ${FULL_QUERY}
  }
`;

export const CREATE_CUSTOMTYPE = gql`
  mutation($title: String!, $type: ENUM_CUSTOMTYPE_TYPE) {
    createCustomtype(input: { data: { title: $title,type: $type } }) {
      customtype ${FULL_QUERY}
    }
  }
`;

export const UPDATE_CUSTOMTYPE = gql`
  mutation updateCustomtype($id: ID!, $data: editCustomtypeInput) {
    updateCustomtype(input: { where: { id: $id }, data: $data }) {
      customtype ${FULL_QUERY}
    }
  }
`;

export const DELETE_CUSTOMTYPE = gql`
  mutation deleteCustomtype($id: ID!) {
    deleteCustomtype(input: { where: { id: $id } }) {
      customtype ${FULL_QUERY}
    }
  }
`;
