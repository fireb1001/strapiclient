import React from "react";
import { RouterProps, Sprovider } from "../common/types";
import { GET_SPROVIDER, UPDATE_SPROVIDER } from "./../graphql/sproviders";
import { useQuery, useMutation } from "@apollo/react-hooks";
import ContentEditable from "react-contenteditable";
import { readableTime } from "../common/functions";
import CoverArea from "../components/CoverArea";
import EdTextArea from "../components/EdTextArea";
import { CustomEditor } from "../components/CustomEditor";
// @ts-ignore
import draftToMarkdown from "draftjs-to-markdown";
import { customConvertMd } from "../common/editor-functions";

type Props = RouterProps;

export default function SProviderEditor({ match, history }: Props) {
  const { loading, data, error } = useQuery(GET_SPROVIDER, {
    variables: { id: match.params.id }
  });

  const [updateSprovider] = useMutation(UPDATE_SPROVIDER);
  const goBack = () => history.push("/sproviders");
  React.useEffect(() => {
    window.addEventListener("goBackPressed", goBack);
    return () => {
      window.removeEventListener("goBackPressed", goBack);
    };
  });
  const [sprovider, setSprovider] = React.useState<Sprovider | undefined>(
    undefined
  );
  const [rawEditorState, setRawEditorState] = React.useState({});

  React.useEffect(() => {
    if (data && data.sprovider) setSprovider(data.sprovider);
  }, [data]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error :(</p>;

  return (
    <>
      {sprovider && (
        <>
          <div className="rtl-area">
            <h2 className="text-gray-900">
              <ContentEditable
                html={sprovider.name}
                onChange={e => {
                  setSprovider({ ...sprovider, name: e.target.value });
                }}
              />
            </h2>
            <span className="post-time">
              {readableTime(sprovider.createdAt)}
            </span>
            <hr />
            <div className="row">
              <div className="col-6">
                <CoverArea
                  src={
                    sprovider.extras && sprovider.extras.cover
                      ? sprovider.extras.cover
                      : ""
                  }
                  onSetImage={(image: string) => {
                    setSprovider({
                      ...sprovider,
                      extras: { ...sprovider.extras, cover: image }
                    });
                  }}
                />
              </div>
              <div className="col-6">
                <EdTextArea
                  text={sprovider.description ? sprovider.description : ""}
                  onSetText={(newText: string) => {
                    let trimmed = newText
                      .replace(/&nbsp;/gi, "")
                      .replace(/<br>/gi, "");
                    setSprovider({ ...sprovider, description: trimmed });
                  }}
                />
              </div>
            </div>
            <hr />
            <div className=" editor-container ">
              <CustomEditor
                rawContent={sprovider.rawcontent}
                handleUpdateRaw={rawContent => {
                  setRawEditorState(rawContent);
                }}
              />
            </div>
          </div>
          <button
            className="btn btn-primary"
            onClick={() => {
              console.log(sprovider);
              updateSprovider({
                variables: {
                  id: sprovider.id,
                  data: {
                    name: sprovider.name,
                    extras: sprovider.extras,
                    description: sprovider.description,
                    rawcontent: rawEditorState,
                    content: draftToMarkdown(
                      rawEditorState,
                      {},
                      customConvertMd,
                      {}
                    )
                  }
                }
              });
            }}
          >
            Save Service Provider
          </button>
        </>
      )}
    </>
  );
}
