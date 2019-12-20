import React from 'react';
import { EditorBlock } from 'draft-js';

export default function SimpleQuote(props: any) {
  const { block } = props;
  console.log(props);
  return (
    <div style={{ border: '1px solid #f00' }} contentEditable={false}>
      <span> {block.getText()}</span>
    </div>
  );
}
