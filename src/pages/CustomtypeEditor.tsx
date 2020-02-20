import React from 'react';
import { RouterProps, Customtype } from '../common/types';
import CoverArea from '../components/CoverArea';
import EdTextArea from '../components/EdTextArea';
import { CustomEditor } from '../components/CustomEditor';
// @ts-ignore
import draftToMarkdown from 'draftjs-to-markdown';
import { customConvertMd } from '../common/editor-functions';
import { InputGroup, FormControl } from 'react-bootstrap';

import { useQuery, useMutation } from '@apollo/react-hooks';
import ContentEditable from 'react-contenteditable';
import { readableTime } from '../common/functions';
import { GET_CUSTOMTYPE, UPDATE_CUSTOMTYPE } from '../graphql/customtype';

type Props = RouterProps;

export default function CustomtypeEditor({ match, history }: Props) {
  const { loading, data, error } = useQuery(GET_CUSTOMTYPE, {
    variables: { id: match.params.id },
  });

  const [updateCustomtype] = useMutation(UPDATE_CUSTOMTYPE);
  const goBack = () => history.push('/customtypes');
  React.useEffect(() => {
    window.addEventListener('goBackPressed', goBack);
    return () => {
      window.removeEventListener('goBackPressed', goBack);
    };
  });
  const [customtype, setCustomtype] = React.useState<Customtype | undefined>(
    undefined
  );
  const [rawEditorState, setRawEditorState] = React.useState({});

  const setCustomtypeExtra = (input: any) => {
    if (customtype)
      setCustomtype({
        ...customtype,
        extras: Object.assign(customtype.extras, input),
      });
  };

  React.useEffect(() => {
    if (data && data.customtype) {
      let { extras, rawcontent } = data.customtype;
      data.customtype.extras = extras ? extras : {};
      if (rawcontent) setRawEditorState(rawcontent);
      setCustomtype(data.customtype);
    }
  }, [data]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error :(</p>;

  return (
    <>
      {customtype && (
        <>
          <div className="rtl-area">
            <h2 className="text-gray-900">
              <ContentEditable
                html={customtype.title}
                onChange={e => {
                  setCustomtype({ ...customtype, title: e.target.value });
                }}
              />
            </h2>
            <span className="post-time">
              {readableTime(customtype.createdAt)}
            </span>
            <hr />
            <div className="row">
              <div className="col-6">
                <CoverArea
                  src={
                    customtype.extras && customtype.extras.cover
                      ? customtype.extras.cover
                      : ''
                  }
                  onSetImage={(image: string) => {
                    setCustomtypeExtra({ cover: image });
                  }}
                />
              </div>
              <div className="col-6">
                <EdTextArea
                  text={customtype.description ? customtype.description : ''}
                  onSetText={(newText: string) => {
                    let trimmed = newText
                      .replace(/&nbsp;/gi, '')
                      .replace(/<br>/gi, '');
                    setCustomtype({ ...customtype, description: trimmed });
                  }}
                />
              </div>
            </div>

            <hr />
            <div className=" editor-container ">
              <CustomEditor
                rawContent={customtype.rawcontent}
                className="white-editor"
                handleUpdateRaw={rawContent => {
                  setRawEditorState(rawContent);
                }}
              />
            </div>
          </div>
          <button
            className="btn btn-primary"
            onClick={async () => {
              console.log(customtype);
              updateCustomtype({
                variables: {
                  id: customtype.id,
                  data: {
                    title: customtype.title,
                    extras: customtype.extras,
                    description: customtype.description,
                    rawcontent: rawEditorState,
                    content: draftToMarkdown(
                      rawEditorState,
                      {},
                      customConvertMd,
                      {}
                    ),
                  },
                },
              });
              history.goBack();
            }}
          >
            Save Service
          </button>
        </>
      )}
    </>
  );
}
