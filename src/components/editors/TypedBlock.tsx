import React from 'react';
import { EditorBlock } from 'draft-js';

export default function TypedBlock(props: any) {
  return (
    <div style={{ border: '1px solid #f00', direction: 'rtl' }}>
      <EditorBlock {...props} />
    </div>
  );
}
