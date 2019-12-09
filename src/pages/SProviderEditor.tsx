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
import { InputGroup, FormControl } from "react-bootstrap";

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

  const setSproviderExtra = (input: any) => {
    if (sprovider)
      setSprovider({
        ...sprovider,
        extras: Object.assign(sprovider.extras, input)
      });
  };

  React.useEffect(() => {
    if (data && data.sprovider) {
      data.sprovider.extras = data.sprovider.extras
        ? data.sprovider.extras
        : {};
      setSprovider(data.sprovider);
    }
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
                    setSproviderExtra({ cover: image });
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
            <label htmlFor="basic-url">Your vanity URL</label>
            <InputGroup className="mb-3" style={{ direction: "ltr" }}>
              <InputGroup.Prepend>
                <InputGroup.Text id="basic-addon3">
                  https://facebook.com/
                </InputGroup.Text>
              </InputGroup.Prepend>
              <FormControl
                id="basic-url"
                value={sprovider.extras.facebookPage || ""}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setSproviderExtra({
                    facebookPage: e.target.value
                  });
                }}
              />
            </InputGroup>
            <hr />
            <div className=" editor-container ">
              <CustomEditor
                rawContent={sprovider.rawcontent}
                className="white-editor"
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
