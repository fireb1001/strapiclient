import React from "react";
import { History } from "history";
import { useQuery, useMutation } from "@apollo/react-hooks";
import { GET_SITE, UPDATE_SITE } from "../graphql/sites";
import { Site } from "../common/types";
import ContentEditable from "react-contenteditable";
import InlineEditable from "../components/InlineEditable";

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

  const setSetting = (key: string, value: any, level?: string) => {
    if (level) {
      let newVal = { ...siteSettings[level], [key]: value };
      console.log(newVal, { ...siteSettings, [level]: newVal });
      setSiteSettings({ ...siteSettings, [level]: newVal });
    } else setSiteSettings({ ...siteSettings, [key]: value });
  };

  const setParam = (key: string, in_key: any, value: any) => {
    let params = siteSettings && siteSettings.params ? siteSettings.params : {};
    let newInVal = null;
    if (!in_key) {
      // array
      newInVal = params[key] && params[key].length ? [...params[key]] : [];
      // Add only to 0 index
      newInVal[0] = value;
    } else {
      newInVal = { ...params[key], [in_key]: value };
    }
    setSiteSettings({
      ...siteSettings,
      params: { ...params, [key]: newInVal }
    });
  };

  const reqsettings = {
    devUse: ["type", "local_path"],
    settingsArr: [
      "baseUrl",
      "DefaultContentLanguage",
      "googleAnalytics",
      "paginate",
      "theme"
    ],
    params: [
      { index: "defaultTheme", type: "string" },
      { index: "subtitle", type: "string" },
      { index: "custom_css", type: "array", of: "strings" },
      {
        index: "logo",
        type: "object",
        childs: [
          {
            index: "logoText",
            type: "string"
          }
        ]
      }
    ],
    menu: { main: ["identifier", "name", "url"] }
  };

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
        {siteData.name && (
          <div>
            <b>Name</b>
            <ContentEditable
              className="editable-line"
              html={siteData.name}
              onChange={e => {
                setSiteData({ ...siteData, name: e.target.value });
              }}
            />
          </div>
        )}

        {reqsettings && reqsettings.settingsArr && (
          <>
            <hr />
            {reqsettings.settingsArr.map(keyName => (
              <InlineEditable
                key={keyName}
                label={keyName}
                html={siteSettings![keyName]}
                onChange={val => setSetting(keyName, val)}
              />
            ))}
          </>
        )}

        {reqsettings && reqsettings.devUse && (
          <>
            <hr />
            {reqsettings.devUse.map(keyName => (
              <InlineEditable
                key={keyName}
                label={keyName}
                html={
                  siteSettings.devUse && siteSettings.devUse[keyName]
                    ? siteSettings.devUse[keyName]
                    : ""
                }
                onChange={val => setSetting(keyName, val, "devUse")}
              />
            ))}
          </>
        )}

        {/*
        {reqsettings && reqsettings.params && (
          <>
            <hr />
            {reqsettings.params.map(param => {
              if (siteSettings && siteSettings.params)
                return (
                  <React.Fragment key={param.index}>
                    {param.type === "string" && (
                      <InlineEditable
                        label={param.index}
                        html={siteSettings!.params![param.index]}
                        onChange={val => setSetting(param.index, val, "params")}
                      />
                    )}

                    {param.type === "array" && (
                      <div className="bg-gray-300 m-2 p-2 border-left-primary">
                        <h3>{param.index}</h3>
                        <InlineEditable
                          html={
                            siteSettings.params[param.index] &&
                            siteSettings.params[param.index][0]
                              ? siteSettings.params[param.index][0]
                              : ""
                          }
                          onChange={val => setParam(param.index, null, val)}
                        />
                      </div>
                    )}
                    {param.type === "object" && (
                      <div className="bg-gray-300 m-2 p-2 border-left-primary">
                        <h3>{param.index}</h3>
                        {param.childs &&
                          param.childs.map(child => (
                            <React.Fragment key={child.index}>
                              {child.type === "string" && (
                                <InlineEditable
                                  label={child.index}
                                  html={
                                    siteSettings.params[param.index] &&
                                    siteSettings.params[param.index][
                                      child.index
                                    ]
                                      ? siteSettings.params[param.index][
                                          child.index
                                        ]
                                      : ""
                                  }
                                  onChange={val =>
                                    setParam(param.index, child.index, val)
                                  }
                                />
                              )}
                            </React.Fragment>
                          ))}
                      </div>
                    )}
                  </React.Fragment>
                );
            })}
          </>
        )}
          */}

        <button
          className="btn btn-primary m-2"
          onClick={_ => {
            console.log(siteSettings);
            siteSettings.title = siteData.name;
            // set hugo custom data manually
            siteSettings.disableKinds = ["taxonomy", "taxonomyTerm"];
            siteSettings.params = {
              custom_css: ["css/custom.css"],
              defaultTheme: "dark",
              logo: {
                logoText: siteData.name
              },
              subtitle: ""
            };
            // todo manage links dynamicly
            /*
"menu": {
    "main": [
      {
        "identifier": "about",
        "name": "من نحن",
        "url": "/about"
      },
      {
        "identifier": "image",
        "name": "الصور",
        "url": "/image"
      },
      {
        "identifier": "wholesaleplaces",
        "name": "اماكن بيع الجملة",
        "url": "https://wholesaleplaces.online/"
      }
    ]
  }
            */
            /*
              siteSettings.params = siteSettings.params
                ? siteSettings.params
              : { logo: "" };
            */
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
