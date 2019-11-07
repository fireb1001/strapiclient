import { gql } from "apollo-boost";

export const CREATE_KEYWORD = gql`
  mutation($site: ID, $keyword: String, $volume: Int) {
    createKeywords(
      input: { data: { keyword: $keyword, volume: $volume, sites: [$site] } }
    ) {
      keyword {
        id
      }
    }
  }
`;
export const DELETE_KEYWORD = gql`
  mutation deleteKeywords($id: ID!) {
    deleteKeywords(input: { where: { id: $id } }) {
      keyword {
        id
      }
    }
  }
`;
