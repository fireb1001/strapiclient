import { gql } from "apollo-boost";

export const GET_SITES = gql`
  query getSites {
    sites {
      id
      name
      handle
      draft_description
      settings
      keywords {
        id
        keyword
        volume
      }
    }
  }
`;

export const GET_SITE = gql`
  query getSite($id: ID!) {
    site(id: $id) {
      id
      name
      handle
      draft_description
      settings
    }
  }
`;

export const UPDATE_SITE = gql`
  mutation updateSite($id: ID!, $data: editSiteInput) {
    updateSite(input: { where: { id: $id }, data: $data }) {
      site {
        id
      }
    }
  }
`;
