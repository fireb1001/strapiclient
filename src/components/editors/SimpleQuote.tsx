import React from 'react';
import {
  EditorBlock,
  EditorState,
  SelectionState,
  Modifier,
  ContentState,
} from 'draft-js';
import { CustomRenderProps } from '../../common/types';
import { Map } from 'immutable';

export default function SimpleQuote(props: CustomRenderProps) {
  const { block, contentState, blockProps } = props;
  //console.log(block.getData().toJS());
  // i think enter create new atomin entity without required data
  let quote = '';
  const entityMapKey = block.getEntityAt(0);
  const entity = contentState.getEntity(entityMapKey);
  if (block.getEntityAt(0)) {
    quote = entity.getData().quote;
  }
  return (
    <>
      <div contentEditable={false} style={{ direction: 'rtl' }}>
        <span
          style={{ border: '1px solid #f00 ' }}
          onClick={() => blockProps.toggModal(true, block.getData())}
        >
          {' '}
          {block.getData().get('text')}
        </span>
        <hr />
        <span
          onClick={() => {
            // how to set blcok text
            let editorState = blockProps.getEditorState();
            // modify entity
            /*
            const contentState = editorState.getCurrentContent();
            let newContentState = contentState.mergeEntityData(entityMapKey, {
              quote: 'new quote',
            });
            editorState = EditorState.set(editorState, {
              currentContent: newContentState,
            });
            blockProps.changeState(editorState);
            */
            let selection = SelectionState.createEmpty(block.getKey());
            /*
            const nextContentState = Modifier.setBlockData(
              editorState.getCurrentContent(),
              selection,
              Map({ short: 'quote', textAs: 'by' })
            );
            const nextContentState = Modifier.setBlockData(
              editorState.getCurrentContent(),
              selection,
              Map({
                short: 'quote',
                textAs: 'by',
                text: block.getData().get('text')
                  ? 'ادخل المحتوي'
                  : 'جديد' + Date.now(),
              })
            );
            // Set Changes
            blockProps.changeState(
              EditorState.push(
                editorState,
                nextContentState,
                'insert-characters'
              )
            );
            */
            blockProps.toggModal(true, block.getData());
          }}
        >
          {'🌜'}
        </span>
        <span
          onClick={() => {
            // remove block
            let editorState = blockProps.getEditorState();
            let newBlockMap = editorState
              .getCurrentContent()
              .getBlockMap()
              .filter(
                (everyblock: any) => everyblock!.getKey() != block.getKey()
              );
            blockProps.changeState(
              EditorState.push(
                editorState,
                // @ts-ignore
                ContentState.createFromBlockArray(newBlockMap.toArray()),
                'remove-range'
              )
            );
          }}
        >
          {'🗑️'}
        </span>
      </div>
    </>
  );
}
