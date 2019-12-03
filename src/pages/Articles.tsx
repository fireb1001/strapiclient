import React, { useEffect, useContext, useMemo } from "react";
import { AppCtxt } from "../ctx";
import { QUERY_INITS } from "../graphql";
import { useQuery, useMutation } from "@apollo/react-hooks";
import { Article } from "../common/types";
import { Link, useHistory } from "react-router-dom";
import { readableTime } from "../common/functions";
import {
  GET_ARTICLES,
  CREATE_ARTICLE,
  UPDATE_ARTICLE,
  DELETE_ARTICLE
} from "../graphql/articles";
import { Dropdown, FormCheck } from "react-bootstrap";

interface SingleArticleProps {
  article: Article;
}

const SingleArticle: React.FC<SingleArticleProps> = ({
  article
}: SingleArticleProps) => {
  const { site } = useContext(AppCtxt);
  const [updateArticle] = useMutation(UPDATE_ARTICLE, {
    refetchQueries: [
      { query: GET_ARTICLES, variables: { where: { site: site.id } } }
    ]
  });

  const [deleteArticle] = useMutation(DELETE_ARTICLE, {
    refetchQueries: [
      { query: GET_ARTICLES, variables: { where: { site: site.id } } }
    ]
  });
  return (
    <>
      <div className="card m-2 p-3 pr-5">
        <div className="row" style={{ direction: "rtl", textAlign: "right" }}>
          <div className="col-2">
            {article.extras && article.extras.cover && (
              <img
                className="card-img3"
                src={article.extras.cover}
                alt="Card image cap"
                style={{ maxWidth: "100%" }}
              />
            )}
          </div>
          <div className="col-9">
            <Link className="d-link" to={`/article_editor/${article.id}`}>
              <h3 className="">{article.title}</h3> {" " + article.published}
            </Link>
            <p>
              <span className="post-time">
                {readableTime(article.createdAt)}
              </span>
              <span className="post-time text-gray-500">
                {" "}
                Updated:
                {readableTime(article.updatedAt)}
              </span>
            </p>
          </div>

          <Dropdown as="span" className="col-1">
            <Dropdown.Toggle
              variant="success"
              id="dropdown-basic"
            ></Dropdown.Toggle>

            <Dropdown.Menu>
              <Dropdown.Item
                onClick={async () => {
                  if (article.published)
                    updateArticle({
                      variables: { id: article.id, data: { published: false } }
                    });
                  else if (!article.published)
                    deleteArticle({
                      variables: {
                        id: article.id
                      }
                    });
                }}
              >
                {article.published && "Un Publish"}
                {!article.published && "Delete"}
              </Dropdown.Item>
              <Dropdown.Item href="#/action-2">Another action</Dropdown.Item>
              <Dropdown.Item href="#/action-3">Something else</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </div>
      </div>
    </>
  );
};

export default function Articles() {
  const { site, show_archived, toggleShowState } = useContext(AppCtxt);
  const [showArchived, setShowArchived] = React.useState(false);

  let history = useHistory();

  const { loading, error, data, refetch } = useQuery(GET_ARTICLES, {
    variables: { where: { site: site.id } }
  });

  const [createArticle] = useMutation(CREATE_ARTICLE, {
    refetchQueries: [
      { query: GET_ARTICLES, variables: { where: { site: site.id } } }
    ]
  });

  useEffect(() => {
    setShowArchived(show_archived);
    refetch();
  });

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error :(</p>;

  return (
    <div id="articles">
      <h3 className="text-gray-900 h-bborder">Articles </h3>
      <FormCheck
        type="switch"
        label="Show Only Archived"
        onChange={(e: any) => {
          setShowArchived(e.target.checked);
          toggleShowState(e.target.checked);
        }}
        id="custom-switch"
        checked={showArchived}
      />
      {data.articles &&
        data.articles.map((article: Article) => (
          <React.Fragment key={article.id}>
            {(article.published || article.published == undefined) &&
              !showArchived && <SingleArticle article={article} />}
            {article.published === false && showArchived && (
              <SingleArticle article={article} />
            )}
          </React.Fragment>
        ))}
      <button
        className="btn btn-primary"
        onClick={async () => {
          let newArticle = await createArticle({
            variables: { ...QUERY_INITS.createArticle, site: site.id }
          });
          let article_id = newArticle.data.createArticle.article.id;
          history.push(`/article_editor/${article_id}`);
        }}
      >
        Add New Article
      </button>
    </div>
  );
}
