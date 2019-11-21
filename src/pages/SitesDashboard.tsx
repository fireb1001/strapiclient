import React, { useEffect, useState, useMemo, useContext } from "react";
import { useQuery, useMutation, useLazyQuery } from "@apollo/react-hooks";
import { NEILPATEL_URL, MAP_CONTEXT_ACTIONS } from "../AppConstants";
import { CREATE_KEYWORD, DELETE_KEYWORD } from "../graphql/keywords";
import { Site, keyword, Article } from "../common/types";
import { CustomEditor } from "../components/CustomEditor";
import { GET_SITES, UPDATE_SITE, GET_SITE } from "../graphql/sites";
import { CREATE_ARTICLE, GET_ARTICLES } from "../graphql/articles";
import { useHistory, Link } from "react-router-dom";
import { AppCtxt } from "../ctx";
import { callClient } from "../ApolloProvider";

interface SingleSiteProps {
  site: Site;
}

const SingleSite: React.FC<SingleSiteProps> = ({ site }: SingleSiteProps) => {
  const { site: contextSite, setSite } = useContext(AppCtxt);
  let ipcRenderer: any;
  if (window.process && window.process.versions.electron) {
    ipcRenderer = window.require("electron").ipcRenderer;
  }

  let history = useHistory();

  const [createArticle] = useMutation(CREATE_ARTICLE);

  const [rawEditorState, setRawEditorState] = useState({});

  const [createKeyword] = useMutation(CREATE_KEYWORD, {
    refetchQueries: [{ query: GET_SITES }]
  });

  const [updateSite] = useMutation(UPDATE_SITE, {
    refetchQueries: [{ query: GET_SITES }]
  });

  const [deleteKeyword] = useMutation(DELETE_KEYWORD, {
    refetchQueries: [{ query: GET_SITES }]
  });

  if (window.process && window.process.versions.electron) {
    const { ipcRenderer } = window.require("electron");
    // important to trigger only once
    ipcRenderer.once("OPT_ACTION", async (event, data) => {
      console.log(MAP_CONTEXT_ACTIONS.OPT_ACTION);

      let volume = data.selectionText.replace(/^\D+/g, "");
      if (volume) {
        data.selectionText = data.selectionText.replace(volume, "");
      }
      console.log(volume);
      await createKeyword({
        variables: {
          keyword: data.selectionText,
          site: contextSite.id,
          volume: volume && parseInt(volume) ? parseInt(volume) : 0
        }
      });
      ipcRenderer.removeAllListeners("OPT_ACTION");
    });
  }

  const googleKeyword = (keyword: String) => {
    if (ipcRenderer) {
      ipcRenderer.send("open-kw-search", {
        keyword: keyword,
        url: NEILPATEL_URL
      });
    }
  };

  return (
    <>
      <div className="row">
        <div className="col-6">
          <CustomEditor
            rawContent={site.draft_description}
            handleUpdateRaw={rawState => {
              setRawEditorState(rawState);
            }}
          />
          <div>
            <button
              className="btn btn-primary m-1"
              onClick={e => {
                e.preventDefault();
                updateSite({
                  variables: {
                    id: site.id,
                    data: { draft_description: rawEditorState }
                  }
                });
              }}
            >
              {"💾 Save"}
            </button>
            <button
              className="btn btn-primary m-1"
              onClick={e => {
                setSite(site);
              }}
            >
              {"📍 Set Current"}
            </button>
            <button
              className="btn btn-primary m-1"
              onClick={async _ => {
                let { articles } = await callClient(GET_ARTICLES, {
                  where: { site: site.id }
                });
                let fs_articles = articles.map((article: Article) => ({
                  title: article.title,
                  body: `+++
title= "${article.title}"
cover= "${article.extras && article.extras.cover ? article.extras.cover : ""}"
date= ${article.createdAt}
description= """
${article.description ? article.description : ""}
"""
+++
${article.content}
                  `
                }));
                console.log(fs_articles);
                if (ipcRenderer) {
                  let res = await ipcRenderer.invoke("write-files", {
                    articles: fs_articles
                  });
                  console.log(res);
                }
              }}
            >
              {"☁️ Sync Content"}
            </button>
            <Link
              className="btn btn-primary m-1"
              to={`/site_settings/${site.id}`}
            >
              {"⚙  Settings"}
            </Link>
          </div>
        </div>
        <div className="rtl-area p-3 col-6">
          <h2>
            {site.name}{" "}
            <i
              className="text-primary fas fa-fw fa-search"
              onClick={() => googleKeyword(site.name)}
            />
          </h2>
          {site.keywords &&
            site.keywords.map((keyword: keyword) => {
              return (
                <div className="sp" key={keyword.id}>
                  <span onClick={() => googleKeyword(keyword.keyword)}>
                    {" "}
                    {keyword.keyword}{" "}
                  </span>{" "}
                  ({keyword.volume}){" "}
                  <i
                    className="text-danger fas fa-trash"
                    onClick={async () =>
                      await deleteKeyword({ variables: { id: keyword.id } })
                    }
                  />{" "}
                  <i
                    className="text-primary fas fa-plus"
                    onClick={async () => {
                      let newArticle = await createArticle({
                        variables: { title: keyword.keyword, site: site.id }
                      });
                      let article_id = newArticle.data.createArticle.article.id;
                      history.push(`/article_editor/${article_id}`);
                    }}
                  />
                </div>
              );
            })}
        </div>
      </div>
    </>
  );
};

export default function SitesDashboard() {
  const { loading, error, data, refetch } = useQuery(GET_SITES);
  const { site, setSite } = useContext(AppCtxt);

  useEffect(() => {
    refetch();
  });

  useMemo(async () => {
    /*
    if (data && data.sites) {
      console.log(data.sites[0]);
      setSite(data.sites[0]);
    }
    */
  }, [data]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error :(</p>;

  return (
    <>
      {data.sites &&
        data.sites.map((site: any) => <SingleSite site={site} key={site.id} />)}
    </>
  );
}
