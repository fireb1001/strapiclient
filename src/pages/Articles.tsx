import React, { useEffect } from "react";
import { AppCtxt } from "../ctx";
import { QUERY_INITS } from "../graphql";
import { useQuery } from "@apollo/react-hooks";
import { Article } from "../common/types";
import { Link } from "react-router-dom";
import { readableTime } from "../common/functions";
import { GET_ARTICLES } from "../graphql/articles";

interface SingleArticleProps {
  article: Article;
}

const SingleArticle: React.FC<SingleArticleProps> = ({
  article
}: SingleArticleProps) => {
  return (
    <>
      <Link className="d-link" to={`/article_editor/${article.id}`}>
        <div
          className="card m-2 p-3 pr-5"
          style={{ direction: "rtl", textAlign: "right" }}
        >
          <h3 className="">{article.title}</h3>
          <p>
            <span className="post-time">{readableTime(article.createdAt)}</span>
            <span className="post-time text-gray-500">
              {" "}
              Updated:
              {readableTime(article.updatedAt)}
            </span>
          </p>
        </div>
      </Link>
    </>
  );
};

export default function Articles() {
  const context = React.useContext(AppCtxt);

  const { loading, error, data, refetch } = useQuery(GET_ARTICLES, {
    variables: QUERY_INITS.getArticles
  });

  useEffect(() => {
    refetch();
  });

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error :(</p>;

  return (
    <>
      <h3 className="text-gray-900 h-bborder">Articles </h3>
      {data.articles &&
        data.articles.map((article: any) => (
          <SingleArticle article={article} key={article.id} />
        ))}
    </>
  );
}
