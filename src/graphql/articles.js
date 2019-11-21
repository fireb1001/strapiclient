import { gql } from "apollo-boost";

export const GET_ARTICLES = gql`
  query getArticles($where: JSON) {
    articles(where: $where) {
      id
      title
      content
      description
      extras
      rawcontent
      createdAt
      updatedAt
      published
    }
  }
`;

export const GET_ARTICLE = gql`
  query getArticle($id: ID!) {
    article(id: $id) {
      id
      title
      content
      description
      extras
      rawcontent
      createdAt
      updatedAt
      published
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
        description
        extras
        rawcontent
        createdAt
        updatedAt
        published
      }
    }
  }
`;

export const CREATE_ARTICLE = gql`
  mutation createArticle($title: String!, $site: ID!) {
    createArticle(input: { data: { title: $title, site: $site } }) {
      article {
        id
      }
    }
  }
`;

export const DELETE_ARTICLE = gql`
  mutation deleteArticle($id: ID!) {
    deleteArticle(input: { where: { id: $id } }) {
      article {
        id
      }
    }
  }
`;
