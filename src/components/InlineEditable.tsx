import React from "react";
import ContentEditable from "react-contenteditable";

interface InlineEditableProps {
  label?: string;
  html: string;
  onChange: (val: string) => void;
}

export default function InlineEditable(props: InlineEditableProps) {
  return (
    <div className="p-2">
      {props.label && <b>{props.label}</b>}

      <ContentEditable
        className="editable-line"
        html={props.html ? props.html : ""}
        onChange={e => {
          let val = e.target.value
            .replace(/&nbsp;/gi, "")
            .replace(/<br>/gi, "");
          props.onChange(val);
        }}
      />
    </div>
  );
}
