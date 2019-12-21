import React from 'react';
import { EditorBlock } from 'draft-js';

export default function SimpleQuote(props: any) {
  const { block, contentState } = props;
  const entityMapKey = block.getEntityAt(0);
  const entity = contentState.getEntity(entityMapKey);
  const { quote } = entity.getData();
  return (
    <div>
      <span style={{ border: '1px solid #f00' }} contentEditable={false}>
        {' '}
        {quote}
      </span>
    </div>
  );
}
