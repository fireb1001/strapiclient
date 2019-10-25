import { gql } from "apollo-boost";

export const GET_SPROVIDERS = gql`
  query getSproviders($where: JSON!) {
    sproviders(where: $where, sort: "_id:desc") {
      id
      name
      description
      archived
      website
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

export const QUERY_INITS = { getSproviders: { where: {} } };

export const UPDATE_MEDIAITEMS = gql`
  mutation($where: InputID, $data: editMediaitemsInput) {
    updateMediaitems(input: { where: $where, data: $data }) {
      mediaitem {
        id
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
