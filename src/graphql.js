import { gql } from "apollo-boost";

export const QUERY_INITS = {
  getSproviders: { where: {} },
  createArticle: { title: " " }
};

export const UPDATE_MEDIAITEMS = gql`
  mutation($where: InputID, $data: editMediaitemsInput) {
    updateMediaitems(input: { where: $where, data: $data }) {
      mediaitem {
        id
      }
    }
  }
`;
