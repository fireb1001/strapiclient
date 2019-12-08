import React from "react";
import ContentEditable from "react-contenteditable";

export default function CoverArea({ src, onSetImage }: any) {
  const [localSrc, setLocalSrc] = React.useState(src);
  return (
    <>
      <div className="cover-area">
        {localSrc && <img src={localSrc} alt="" style={{ maxWidth: "100%" }} />}
        <h5 style={{ padding: ".5rem", fontWeight: "bold" }}>Cover :</h5>
        <ContentEditable
          html={localSrc}
          className="editable-in"
          onChange={e => {
            setLocalSrc(e.target.value);
            onSetImage(e.target.value);
          }}
        />
      </div>
    </>
  );
}
