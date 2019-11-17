import React, { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation } from "@apollo/react-hooks";
import { Article } from "../common/types";
import { readableTime } from "../common/functions";
import ContentEditable from "react-contenteditable";
import { GET_ARTICLE, UPDATE_ARTICLE } from "../graphql/articles";
import { FormCheck } from "react-bootstrap";
import { CustomEditor } from "../components/CustomEditor";
import SuggestKeywords from "../components/SuggestKeywords";
import { AppCtxt } from "../ctx";
// @ts-ignore
import draftToMarkdown from "draftjs-to-markdown";
import { History } from "history";

interface RouterProps {
  match: any;
  history: History;
}

type Props = RouterProps;

export default function ArticleEditor({ match, history }: Props) {
  const { loading, error, data } = useQuery(GET_ARTICLE, {
    variables: { id: match.params.id }
  });

  const { suggestFn } = React.useContext(AppCtxt);

  const [updateArticle] = useMutation(UPDATE_ARTICLE);
  const [title, setTitle] = useState("");
  const [articleData, setArticleData] = useState({ published: null });
  const [suggestions, setSuggets] = useState("");
  const [rawEditorState, setRawEditorState] = useState({});

  const saveArticle = async () => {
    await updateArticle({
      variables: {
        id: match.params.id,
        data: {
          title: title.trim(),
          rawcontent: rawEditorState,
          content: draftToMarkdown(
            rawEditorState,
            {},
            (entity: any, text: string) => {
              if (text) console.log(entity, text);
              if (entity.type === "IMAGE") {
                return `![${entity.data.alt || ""}](${entity.data.src})*${entity
                  .data.caption || ""}*`;
              }
              if (entity.type === "LINK") {
                return ` [${text}](${entity.data.url})`;
              }
            },
            {}
          ),
          published: articleData.published
        }
      }
    });

    history.goBack();
  };

  const goBack = () => {
    console.log("goBack Pressed");
    history.push("/");
  };

  useMemo(() => {
    if (data && data.article) {
      setTitle("" + data.article.title);

      if (data.article.rawcontent) {
        setRawEditorState(data.article.rawcontent);
        setArticleData({ ...articleData, published: data.article.published });
        //setEditorState(EditorState.createWithContent(rawContent));
      }
    }
  }, [data]);

  useEffect(() => {
    window.addEventListener("goBackPressed", goBack);
    return () => {
      window.removeEventListener("goBackPressed", goBack);
    };
  });

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error :(</p>;
  if (data) {
    // Types with object destructuring
    let { article }: { article: Article } = data;
    return (
      <>
        <div className="rtl-area">
          <h2 className="text-gray-900">
            <ContentEditable
              html={title}
              onChange={e => setTitle(e.target.value)}
            />
          </h2>
          <span className="post-time">{readableTime(article.createdAt)}</span>
        </div>
        <hr />
        <FormCheck
          type="switch"
          label="Published"
          onChange={(e: any) => {
            setArticleData({ ...articleData, published: e.target.checked });
          }}
          id="custom-switch"
          checked={
            articleData.published != null && articleData.published == true
          }
        />
        <hr />

        <div className="row m-2">
          <div className="col-8 editor-container ">
            <CustomEditor
              rawContent={data.article.rawcontent}
              handleUpdateRaw={rawContent => {
                setRawEditorState(rawContent);
              }}
            />
          </div>
          <div className="col-4">
            <div className="m-2">
              <SuggestKeywords
                suggestions={["يا كاكا", "يا ماما"]}
                kwContext=""
                handleSelect={(kw: string) => {
                  suggestFn({ keyword: kw });
                }}
              />
              <span onClick={async () => {}}>{suggestions}</span>
            </div>
          </div>
        </div>
        <p>
          <button className="btn btn-primary" onClick={saveArticle}>
            save
          </button>
        </p>
      </>
    );
  }
  // important Don't Remove
  return <></>;
}
