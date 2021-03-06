import React from 'react';
import { Entity } from 'draft-js';
import { AppCtxt } from '../ctx';
import { CustomRenderProps } from '../common/types';

export default function MediaComponent(props: CustomRenderProps) {
  const { toggleShowMediaModal } = React.useContext(AppCtxt);
  const { block, contentState } = props;
  // console.log(block.getData().toJS());
  const entityMapKey = block.getEntityAt(0);
  const entity = contentState.getEntity(entityMapKey);
  const { src, alt, caption } = entity.getData();

  return (
    <>
      <div id={`custom-media-${block.getKey()}`} className="text-center">
        <img
          src={src}
          className="draftblock-image"
          onClick={_ => {
            toggleShowMediaModal({
              show: true,
              image_data: {
                src: src,
                alt: alt,
                caption: caption,
                entity_key: entityMapKey,
              },
            });
          }}
        />
      </div>
    </>
  );
}
