import React, { useState, useMemo, useEffect, createRef } from "react";
import { useQuery, useMutation } from "@apollo/react-hooks";
import { Article } from "../common/types";
import { readableTime } from "../common/functions";
import ContentEditable from "react-contenteditable";
import { History } from "history";
import { GET_ARTICLE, UPDATE_ARTICLE } from "../graphql/articles";
import {
  EditorState,
  convertToRaw,
  convertFromRaw,
  ContentState,
  RichUtils,
  Entity,
  Modifier
} from "draft-js";
// @ts-ignore
import { Editor } from "react-draft-wysiwyg";
// @ts-ignore
import draftToMarkdown from "draftjs-to-markdown";
// @ts-ignore
import { getSelectionEntity, getSelectionText } from "draftjs-utils";
import {
  myKeyBindingFn,
  KEY_COMMANDS,
  moveBlock
} from "../common/editor-functions";
import { FormCheck } from "react-bootstrap";
//import { markdownToDraft } from 'markdown-draft-js';

interface MyRouterProps {
  match: any;
  history: History;
}

type Props = MyRouterProps;

export default function ArticleWysiwygEditor({ match, history }: Props) {
  const { loading, error, data } = useQuery(GET_ARTICLE, {
    variables: { id: match.params.id }
  });

  const [updateArticle] = useMutation(UPDATE_ARTICLE);
  const [title, setTitle] = useState("");
  const [articleData, setArticleData] = useState({ published: null });
  const [suggestions, setSuggets] = useState("");

  const [editorState, setEditorState] = useState(EditorState.createEmpty());

  const [editorRef, setEditorRef] = useState(createRef<any>());
  const setEditorReference = (ref: any) => {
    setEditorRef(ref);
  };

  const saveArticle = async () => {
    await updateArticle({
      variables: {
        id: match.params.id,
        data: {
          title: title,
          rawcontent: JSON.stringify([
            convertToRaw(editorState.getCurrentContent())
          ]),
          content: draftToMarkdown(
            convertToRaw(editorState.getCurrentContent())
          ),
          published: articleData.published
        }
      }
    });
    history.goBack();
  };

  const handleKey = (command: any) => {
    let selection = editorState.getSelection();

    if (command === "bold") {
      setEditorState(RichUtils.toggleInlineStyle(editorState, "BOLD"));
      return "handled";
    }

    if (command === "code") {
      setEditorState(RichUtils.toggleBlockType(editorState, "code"));
      return "handled";
    }

    if (command === "header-one") {
      setEditorState(RichUtils.toggleBlockType(editorState, "header-one"));
      return "handled";
    }

    if (command === "header-two") {
      setEditorState(RichUtils.toggleBlockType(editorState, "header-two"));
      return "handled";
    }

    if (command === "ctrl+s") {
      navigator.clipboard.readText().then(clipText => {
        const contentState = editorState.getCurrentContent();
        const contentStateWithEntity = contentState.createEntity(
          "LINK",
          "MUTABLE",
          { url: clipText }
        );

        console.log("getSelectionEntity", getSelectionEntity(editorState));

        if (getSelectionEntity(editorState)) {
          console.log(Entity.get(getSelectionEntity(editorState)));
        }

        const entityKey = contentStateWithEntity.getLastCreatedEntityKey();
        const newEditorState = EditorState.push(
          editorState,
          contentStateWithEntity,
          "apply-entity"
        );
        setEditorState(
          RichUtils.toggleLink(newEditorState, selection, entityKey)
        );

        console.log("selection", selection);
        console.log("! selection isCollapsed", !selection.isCollapsed());
      });
      return "handled";
    }

    if (
      command === KEY_COMMANDS.CTRL_PAGEUP ||
      command === KEY_COMMANDS.CTRL_PAGEDOWN
    ) {
      const blockKey = editorState.getSelection().getAnchorKey();
      let newBlocksArr = moveBlock(
        editorState.getCurrentContent().getBlockMap(),
        blockKey,
        command === KEY_COMMANDS.CTRL_PAGEUP ? "UP" : "DOWN"
      );
      setEditorState(
        EditorState.push(
          editorState,
          // @ts-ignore
          ContentState.createFromBlockArray(newBlocksArr),
          "change-block-data"
        )
      );
      return "handled";
    }
    console.log(`${command} not-handled`);
    return "not-handled";
  };

  const goBack = () => {
    console.log("goBack Pressed");
    history.push("/");
  };

  useMemo(() => {
    if (data && data.article) {
      setTitle("" + data.article.title);
      if (JSON.parse("" + data.article.rawcontent)) {
        let rawContent = convertFromRaw(
          JSON.parse("" + data.article.rawcontent)[0]
        );
        setEditorState(EditorState.createWithContent(rawContent));
        setArticleData({ ...articleData, published: data.article.published });
      }
    }
  }, [data]);

  useEffect(() => {
    return () => {
      window.removeEventListener("goBackPressed", goBack);
    };
  });

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error :(</p>;
  if (data) {
    window.addEventListener("goBackPressed", goBack);

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

        {/* 
          <ContentEditable
            html={content}
            onChange={e => setContent(e.target.value)}
          />
          */}
        <div className="row m-2">
          <div className="col-8 editor-container ">
            <Editor
              editorRef={setEditorReference}
              editorState={editorState}
              wrapperClassName="demo-wrapper"
              editorClassName="demo-editor"
              toolbar={{
                image: {
                  alt: { present: true, mandatory: true }
                }
              }}
              onEditorStateChange={(val: any) => {
                setEditorState(val);
              }}
              onChange={() => {
                setSuggets(
                  ("" + getSelectionText(editorState)).trim() + " يا وله"
                );
                if (getSelectionEntity(editorState)) {
                  console.log(Entity.get(getSelectionEntity(editorState)));
                }
              }}
              handleKeyCommand={handleKey}
              keyBindingFn={myKeyBindingFn}
            />
          </div>
          <div className="col-4">
            <div className="m-2">
              <span
                onClick={async () => {
                  let newState = Modifier.replaceText(
                    editorState.getCurrentContent(),
                    editorState.getSelection(),
                    suggestions
                  );

                  console.log(newState.getPlainText());

                  setEditorState(
                    EditorState.push(editorState, newState, "apply-entity")
                  );
                  await setTimeout(() => {}, 100);
                  // @ts-ignore

                  editorRef.focus();
                }}
              >
                {suggestions}
              </span>
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

  return <></>;
}
