import React, { useEffect, useState } from "react";
import { useQuery, useMutation } from "@apollo/react-hooks";
import { NEILPATEL_URL, MAP_CONTEXT_ACTIONS } from "../AppConstants";
import { CREATE_KEYWORD, DELETE_KEYWORD } from "../graphql/keywords";
import { Site, keyword } from "../common/types";
import { CustomEditor } from "../components/CustomEditor";
import { GET_SITES, UPDATE_SITE } from "../graphql/sites";

interface SingleSiteProps {
  site: Site;
}

const SingleSite: React.FC<SingleSiteProps> = ({ site }: SingleSiteProps) => {
  let ipcRenderer: any;
  if (window.process && window.process.versions.electron) {
    ipcRenderer = window.require("electron").ipcRenderer;
  }

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
          site: "5db15d27a787021bb86f7b48",
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
              className="btn btn-primary"
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

  useEffect(() => {
    refetch();
  });

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error :(</p>;

  return (
    <>
      {data.sites &&
        data.sites.map((site: any) => <SingleSite site={site} key={site.id} />)}
    </>
  );
}
