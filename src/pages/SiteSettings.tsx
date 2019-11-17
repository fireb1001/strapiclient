import React from "react";
import { History } from "history";
import { useQuery, useMutation } from "@apollo/react-hooks";
import { GET_SITE, UPDATE_SITE } from "../graphql/sites";
import { Site } from "../common/types";
import ContentEditable from "react-contenteditable";

interface RouterProps {
  match: any;
  history: History;
}

type Props = RouterProps;

export default function SiteSettings({ match, history }: Props) {
  const { loading, error, data } = useQuery(GET_SITE, {
    variables: { id: match.params.site_id }
  });
  const [updateSite] = useMutation(UPDATE_SITE);
  const [siteSettings, setSiteSettings] = React.useState({} as any);
  const [siteData, setSiteData] = React.useState({} as Site);

  React.useMemo(() => {
    if (data) {
      let { site }: { site: Site } = data;
      setSiteSettings(site.settings);
      setSiteData(site);
    }
  }, [data]);

  const goBack = () => {
    history.push("/sites");
  };

  const setSetting = (key: string, value: any) => {
    setSiteSettings({ ...siteSettings, [key]: value });
  };

  const settingsArr = [
    "type",
    "baseUrl",
    "DefaultContentLanguage",
    "googleAnalytics",
    "paginate",
    "theme",
    "local_path"
  ];

  React.useEffect(() => {
    window.addEventListener("goBackPressed", goBack);
    return () => {
      window.removeEventListener("goBackPressed", goBack);
    };
  });

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error :(</p>;
  if (data) {
    let { site }: { site: Site } = data;

    return (
      <>
        <h1>Site id : {match.params.site_id}</h1>
        <h3>Site handle : {siteData.handle}</h3>

        <ContentEditable
          html={siteData.name}
          onChange={e => {
            setSiteData({ ...siteData, name: e.target.value });
          }}
        />

        {settingsArr &&
          settingsArr.map(keyName => (
            <div className="p-2" key={keyName}>
              <b>{keyName}</b>
              <ContentEditable
                className="editable-line"
                html={siteSettings![keyName] ? siteSettings![keyName] : ""}
                onChange={e => setSetting(keyName, e.target.value)}
              />
            </div>
          ))}

        <button
          className="btn btn-primary m-2"
          onClick={_ => {
            console.log(siteSettings);
            updateSite({
              variables: {
                id: match.params.site_id,
                data: {
                  name: siteData.name,
                  settings: siteSettings
                }
              }
            });
          }}
        >
          {"✅ Save"}
        </button>
      </>
    );
  }

  // important Don't Remove
  return <></>;
}
