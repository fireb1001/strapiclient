import React from "react";
import { useQuery, useMutation } from "@apollo/react-hooks";
import { Article, RouterProps } from "../common/types";
import { readableTime } from "../common/functions";
import ContentEditable from "react-contenteditable";
import { GET_ARTICLE, UPDATE_ARTICLE } from "../graphql/articles";
import { FormCheck } from "react-bootstrap";
import { CustomEditor } from "../components/CustomEditor";
import SuggestKeywords from "../components/SuggestKeywords";
import { AppCtxt } from "../ctx";
// @ts-ignore
import draftToMarkdown from "draftjs-to-markdown";
import CoverArea from "../components/CoverArea";
import EdTextArea from "../components/EdTextArea";
import { customConvertMd } from "../common/editor-functions";

type Props = RouterProps;

export default function ArticleEditor({ match, history }: Props) {
  const { loading, error, data } = useQuery(GET_ARTICLE, {
    variables: { id: match.params.id }
  });

  const { suggestFn } = React.useContext(AppCtxt);

  const [updateArticle] = useMutation(UPDATE_ARTICLE);
  const [title, setTitle] = React.useState("");
  const [articleData, setArticleData] = React.useState({
    published: false,
    extras: {},
    description: ""
  });
  const [suggestions, setSuggets] = React.useState("");
  const [rawEditorState, setRawEditorState] = React.useState({});

  const saveArticle = async () => {
    await updateArticle({
      variables: {
        id: match.params.id,
        data: {
          title: title.trim(),
          rawcontent: rawEditorState,
          content: draftToMarkdown(rawEditorState, {}, customConvertMd, {}),
          published: articleData.published,
          extras: articleData.extras,
          description: articleData.description
        }
      }
    });

    history.goBack();
  };

  const goBack = () => history.push("/");

  React.useMemo(() => {
    if (data && data.article) {
      let { article }: { article: Article } = data;
      setTitle("" + article.title);

      if (article.rawcontent) {
        setRawEditorState(data.article.rawcontent);
      }
      setArticleData({
        extras: article.extras,
        description: article.description,
        published: article.published
      });
    }
  }, [data]);

  React.useEffect(() => {
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
    let cover =
      article.extras && article.extras.cover ? article.extras.cover : "";
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
        <div className="row">
          <div className="col-6">
            <CoverArea
              src={cover}
              onSetImage={(image: string) => {
                setArticleData({
                  ...articleData,
                  extras: { ...article.extras, cover: image }
                });
              }}
            />
          </div>
          <div className="col-6">
            <EdTextArea
              text={article.description ? article.description : ""}
              onSetText={(newText: string) => {
                let trimmed = newText
                  .replace(/&nbsp;/gi, "")
                  .replace(/<br>/gi, "");
                setArticleData({ ...articleData, description: trimmed });
              }}
            />
          </div>
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
              rawContent={article.rawcontent}
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
