import React from "react";
import ContentEditable from "react-contenteditable";

export default function EdTextArea({ text, onSetText }: any) {
  const [localText, setLocalText] = React.useState(text);
  return (
    <>
      <div className="edtext-area">
        <ContentEditable
          className="editable-line"
          html={localText}
          onChange={e => {
            let textValue = e.target.value;
            setLocalText(textValue);
            onSetText(textValue);
          }}
        />
      </div>
    </>
  );
}
