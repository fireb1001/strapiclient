import { gql } from "apollo-boost";

export const GET_ARTICLES = gql`
  query getArticles($where: JSON) {
    articles(where: $where) {
      id
      title
      content
      rawcontent
      createdAt
      updatedAt
    }
  }
`;

export const GET_ARTICLE = gql`
  query getArticle($id: ID!) {
    article(id: $id) {
      id
      title
      content
      rawcontent
      createdAt
      updatedAt
    }
  }
`;
export const UPDATE_ARTICLE = gql`
  mutation updateArticle($id: ID!, $data: editArticleInput) {
    updateArticle(input: { where: { id: $id }, data: $data }) {
      article {
        id
        title
        content
        rawcontent
        createdAt
        updatedAt
      }
    }
  }
`;
