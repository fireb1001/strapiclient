import React from 'react';
import {
  Editor,
  EditorState,
  convertToRaw,
  convertFromRaw,
  RichUtils,
  Entity,
  CompositeDecorator,
  SelectionState,
  ContentBlock,
  genKey,
  ContentState,
  AtomicBlockUtils,
  Modifier,
} from 'draft-js';
import {
  myKeyBindingFn,
  KEY_COMMANDS,
  moveBlock,
  myBlockRenderer,
} from '../common/editor-functions';
// @ts-ignore
import { getSelectionEntity } from 'draftjs-utils';
import linkSvg from '../common/svg/link.svg';
import { Modal, Button } from 'react-bootstrap';
import { AppCtxt } from '../ctx';
import LinkComponent from './editors/LinkComponent';
import MediaModal from './editors/MediaModal';
import { Map } from 'immutable';
import DataModal from './editors/DataModal';
interface CustomEditorProps {
  rawContent?: any;
  handleUpdateRaw: (state: any) => void;
  className?: any;
}

enum EDIT_MODES {
  DEFAULT = 'DEFAULT',
  BLOCK = 'BLOCK',
}

export function CustomEditor(props: CustomEditorProps) {
  const {
    suggest_kw,
    show_media_modal,
    toggleShowMediaModal,
  } = React.useContext(AppCtxt);

  const [editorRef, setEditorRef] = React.useState(React.createRef<any>());
  const [showEditorModal, setShowEditorModal] = React.useState(false);
  const [showDataModal, setShowDataModal] = React.useState(false);
  const [modalPayload, setModalPayload] = React.useState(Map({}));
  const [imageData, setImageData] = React.useState({
    src: '',
    alt: '',
    caption: '',
  });

  React.useEffect(() => {
    setShowEditorModal(show_media_modal);
  });

  const setDomEditorRef = (ref: any) => {
    setEditorRef(ref);
  };

  function findLinkEntities(
    contentBlock: any,
    callback: any,
    contentState: any
  ) {
    contentBlock.findEntityRanges((character: any) => {
      const entityKey = character.getEntity();
      return (
        entityKey !== null &&
        contentState.getEntity(entityKey).getType() === 'LINK'
      );
    }, callback);
  }

  const decorator = new CompositeDecorator([
    {
      strategy: findLinkEntities,
      component: LinkComponent,
    },
  ]);

  let initState: any = null;

  if (props.rawContent) {
    try {
      initState = EditorState.createWithContent(
        convertFromRaw(props.rawContent),
        decorator
      );
      //props.handleUpdateRaw(initState);
    } catch (error) {
      initState = EditorState.createEmpty(decorator);
    }
  } else {
    initState = EditorState.createEmpty(decorator);
  }

  const [editorState, setEditorState] = React.useState(initState);

  const [editMode, setEditMode] = React.useState<EDIT_MODES>(
    EDIT_MODES.DEFAULT
  );

  const changeState = (editorState: EditorState) => {
    props.handleUpdateRaw(convertToRaw(editorState.getCurrentContent()));
    setEditorState(editorState);
  };

  const replaceText = async (newString: string) => {
    let newState = Modifier.replaceText(
      editorState.getCurrentContent(),
      editorState.getSelection(),
      newString
    );

    changeState(EditorState.push(editorState, newState, 'insert-characters'));
    await setTimeout(() => {}, 100);

    // @ts-ignore
    if (editorRef && editorRef.refs) editorRef.focus();
  };

  const editorFocus = async (blockKey: string, newEditorState: any) => {
    console.log(blockKey);

    await setTimeout(() => {}, 500);
    changeState(
      EditorState.forceSelection(
        newEditorState,
        new SelectionState({
          anchorKey: blockKey,
          anchorOffset: 0,
          focusKey: blockKey,
          focusOffset: 0,
        })
      )
    );
  };

  // and now it's only working when value change ! so string not changed
  React.useEffect(() => {
    console.log('suggest_kw become', suggest_kw);
    if (suggest_kw) {
      replaceText(suggest_kw.keyword);
    }
  }, [suggest_kw]);

  React.useEffect(() => {
    //do nothing for now
  }, [editorState]);

  const handleKey = (command: any) => {
    let selection = editorState.getSelection();
    console.log(command);
    if (command === 'bold') {
      changeState(RichUtils.toggleInlineStyle(editorState, 'BOLD'));
      return 'handled';
    }

    if (command === 'code') {
      changeState(RichUtils.toggleBlockType(editorState, 'code'));
      return 'handled';
    }

    if (command === 'header-one') {
      changeState(RichUtils.toggleBlockType(editorState, 'header-one'));
      return 'handled';
    }

    if (command === 'header-two') {
      changeState(RichUtils.toggleBlockType(editorState, 'header-two'));
      return 'handled';
    }

    if (command === KEY_COMMANDS.CTRL_L) {
      changeState(
        RichUtils.toggleBlockType(editorState, 'unordered-list-item')
      );
      return 'handled';
    }

    if (
      command === KEY_COMMANDS.CTRL_PAGEUP ||
      command === KEY_COMMANDS.CTRL_PAGEDOWN
    ) {
      const blockKey = editorState.getSelection().getAnchorKey();
      let newBlocksArr = moveBlock(
        editorState.getCurrentContent().getBlockMap(),
        blockKey,
        command === KEY_COMMANDS.CTRL_PAGEUP ? 'UP' : 'DOWN'
      );
      const newEditorState = EditorState.push(
        editorState,
        ContentState.createFromBlockArray(newBlocksArr),
        'change-block-data'
      );

      editorFocus(blockKey, newEditorState);
      return 'handled';
    }

    // Delete current Block
    if (editMode === EDIT_MODES.BLOCK && command === KEY_COMMANDS.CTRL_D) {
      const blockKey = editorState.getSelection().getAnchorKey();
      let newBlockMap = editorState
        .getCurrentContent()
        .getBlockMap()
        .filter((block: any) => block!.getKey() != blockKey);
      changeState(
        EditorState.push(
          editorState,
          // @ts-ignore
          ContentState.createFromBlockArray(newBlockMap.toArray()),
          'insert-fragment'
        )
      );
      return 'handled';
    }

    if (command === 'reset-style') {
      const newContentState = RichUtils.tryToRemoveBlockStyle(editorState);

      if (newContentState) {
        // @ts-ignore
        let newEditorState = EditorState.push(
          editorState,
          newContentState,
          'change-block-type'
        );

        changeState(newEditorState);
      }
      return 'handled';
    }

    if (command === KEY_COMMANDS.CTRL_N) {
      // if in blocks edit mode then remove block style
      if (editMode === EDIT_MODES.BLOCK) {
        //Modifier.removeInlineStyle()
        const blockKey = editorState.getSelection().getAnchorKey();
        console.log('old blockKey', blockKey);
        const currentBlock = editorState
          .getCurrentContent()
          .getBlockForKey(blockKey);

        let blockText = currentBlock.getText();
        let newkey = genKey();
        const newBlockMap = editorState
          .getCurrentContent()
          .getBlockMap()
          .map((block: any, key: any) => {
            if (key === blockKey) {
              return new ContentBlock({
                key: newkey,
                type: 'unstyled',
                text: blockText,
              });
            }
            return block;
          });
        console.log('newkey blockKey', newkey);
        //console.log("newBlockMap.toArray()", newBlockMap.toArray());
        let newEditorState = EditorState.push(
          editorState,
          // @ts-ignore
          ContentState.createFromBlockArray(newBlockMap.toArray()),
          'insert-fragment'
        );
        // set new state and force selection to new key block
        changeState(
          EditorState.forceSelection(
            newEditorState,
            new SelectionState({
              anchorKey: newkey,
              anchorOffset: 0,
              focusKey: newkey,
              focusOffset: 0,
            })
          )
        );
        /*
        // remove entities
        let newState = Modifier.removeRange(
          editorState.getCurrentContent(),
          new SelectionState({
            anchorKey: blockKey,
            anchorOffset: 0,
            focusKey: blockKey,
            focusOffset: currentBlock.getText().length
          }),
          "backward"
        );

        // remove block itself
        const blockMap = newState.getBlockMap().delete(blockKey);
        console.log("blockMap.toArray()", blockMap.toArray());
        changeState(
          EditorState.push(
            editorState,
            ContentState.createFromBlockArray(blockMap.toArray()),
            "remove-range"
          )
        );
        let newKey = genKey();
        const newBlockMap = blockMap.set(
          newKey,
          new ContentBlock({
            key: newKey,
            type: "unstyled",
            text: blockText
          })
        );

        changeState(
          EditorState.push(
            editorState,
            ContentState.createFromBlockArray(newBlockMap.toArray()),
            "insert-fragment"
          )
        );

        /*
        const newBlock = new ContentBlock({
          key: genKey(),
          type: "unstyled",
          text: blockText
        });

        changeState(
          EditorState.push(editorState, newState, "insert-characters")
        );
        */
      }
      return 'handled';
    }

    if (command === KEY_COMMANDS.ALT_B) {
      if (editMode === EDIT_MODES.BLOCK) setEditMode(EDIT_MODES.DEFAULT);
      else setEditMode(EDIT_MODES.BLOCK);
      return 'handled';
    }

    if (command === 'ctrl+s') {
      navigator.clipboard.readText().then(clipText => {
        const contentState = editorState.getCurrentContent();
        const contentStateWithEntity = contentState.createEntity(
          'LINK',
          'MUTABLE',
          { url: clipText }
        );

        console.log('getSelectionEntity', getSelectionEntity(editorState));

        if (getSelectionEntity(editorState)) {
          console.log(Entity.get(getSelectionEntity(editorState)));
        }

        const entityKey = contentStateWithEntity.getLastCreatedEntityKey();
        const newEditorState = EditorState.push(
          editorState,
          contentStateWithEntity,
          'apply-entity'
        );
        changeState(RichUtils.toggleLink(newEditorState, selection, entityKey));

        console.log('selection', selection);
        console.log('! selection isCollapsed', !selection.isCollapsed());
      });
      return 'handled';
    }
    console.log(`${command} not-handled`);
    return 'not-handled';
  };
  const getEditorState = () => {
    return editorState;
  };

  const toggDataModal = (flag: boolean, payload: any) => {
    setShowDataModal(flag);
    setModalPayload(payload);
  };

  const customBlockRenderer = myBlockRenderer(
    getEditorState,
    changeState,
    toggDataModal
  );

  function myBlockStyleFn(contentBlock: ContentBlock) {
    const blockKey = editorState.getSelection().getAnchorKey();
    if (contentBlock.getType() === 'atomic') return 'atomic-block';

    if (blockKey === contentBlock.getKey()) return 'every-block current-block';
    else return 'every-block';
  }

  return (
    <div className={props.className}>
      {/* implementing media modal */}
      <MediaModal
        show={showEditorModal}
        onValue={value => setImageData(value)}
        onToggle={(flag: boolean) => toggleShowMediaModal({ show: flag })}
        onSave={(imageData: any) => {
          if (imageData && imageData.src) {
            const contentState = editorState.getCurrentContent();
            if (imageData.entity_key) {
              // modify image block
              let newContentState = contentState.mergeEntityData(
                imageData.entity_key,
                {
                  src: imageData.src,
                  alt: imageData.alt,
                  caption: imageData.caption,
                }
              );
              const newEditorState = EditorState.set(editorState, {
                currentContent: newContentState,
              });
              changeState(newEditorState);
            } else {
              // adding image block
              const contentStateWithEntity = contentState.createEntity(
                'IMAGE',
                'IMMUTABLE',
                {
                  src: imageData.src,
                  alt: imageData.alt ? imageData.alt : '',
                  caption: imageData.caption ? imageData.caption : '',
                }
              );
              const entityKey = contentStateWithEntity.getLastCreatedEntityKey();
              const newEditorState = EditorState.set(editorState, {
                currentContent: contentStateWithEntity,
              });
              changeState(
                // its important to use whitespace
                AtomicBlockUtils.insertAtomicBlock(
                  newEditorState,
                  entityKey,
                  ' '
                )
              );
            }
          }
        }}
      />
      <DataModal
        show={showDataModal}
        payload={modalPayload as Map<any, any>}
        onSave={(data: Map<any, any>) => {
          // now modify block data
          let dataObj = data.toJS();
          let selection = SelectionState.createEmpty(dataObj.key);

          const nextContentState = Modifier.setBlockData(
            editorState.getCurrentContent(),
            selection,
            data
          );

          // Set Changes
          changeState(
            EditorState.push(editorState, nextContentState, 'change-block-data')
          );
        }}
        onToggle={(flag: boolean) => setShowDataModal(flag)}
      />
      <Editor
        editorState={editorState}
        ref={setDomEditorRef}
        onChange={changeState}
        handleKeyCommand={handleKey}
        keyBindingFn={e => {
          // check if binding need editor state
          const blockKey = editorState.getSelection().getAnchorKey();

          const currentBlock = editorState
            .getCurrentContent()
            .getBlockForKey(blockKey);
          if (
            e.keyCode === 8 &&
            currentBlock.getType() !== 'unstyled' &&
            currentBlock.getText().length === 0
          ) {
            return 'reset-style';
          }
          return myKeyBindingFn(e);
        }}
        blockRendererFn={customBlockRenderer}
        blockStyleFn={myBlockStyleFn}
      />
      {editMode == EDIT_MODES.BLOCK && <span> -- BLOCK MODE --</span>}
      <img
        src={linkSvg}
        alt=""
        style={{ width: '2em' }}
        onClick={() => {
          toggleShowMediaModal({ show: true });
        }}
      />
      <span
        className="bold text-dark"
        onClick={() => {
          // console.log(convertToRaw(editorState.getCurrentContent()))
          //editorFocus('4q6vg', editorState);
        }}
      >
        {' '}
        Do somthing{' '}
      </span>
      <span
        onClick={async () => {
          const contentState = editorState.getCurrentContent();
          const contentStateWithEntity = contentState.createEntity(
            'Quote',
            'IMMUTABLE',
            { by: '' }
          );

          const entityKey = contentStateWithEntity.getLastCreatedEntityKey();
          const newEditorState = EditorState.set(editorState, {
            currentContent: contentStateWithEntity,
          });

          const newNewState = AtomicBlockUtils.insertAtomicBlock(
            newEditorState,
            entityKey,
            ' '
          );
          // Now Add Data to block
          // get da fuken block key but take care of reactive bullshit
          const newAtomicBlockKey = newNewState
            .getCurrentContent()
            .getBlockMap()
            .find((b: any) => b.getEntityAt(0) === entityKey)
            .getKey();

          let selection = SelectionState.createEmpty(newAtomicBlockKey);

          const nextContentState = Modifier.setBlockData(
            newNewState.getCurrentContent(),
            selection,
            Map({ short: 'quote', textAs: 'quote', key: newAtomicBlockKey })
          );
          // final editor state
          changeState(
            EditorState.push(newNewState, nextContentState, 'change-block-data')
          );
        }}
      >
        *Quote Block*
      </span>
      <Button
        onClick={async () => {
          const contentState = editorState.getCurrentContent();
          const blockMap = contentState.getBlockMap();
          let newkey = genKey();
          const newBlock = new ContentBlock({
            key: newkey,
            text: '',
            type: 'unstyled',
            data: Map({ typed: 'wirdo' }),
          });
          const newBlockMap = blockMap
            .toSeq()
            .concat([[newBlock.getKey(), newBlock]])
            .toOrderedMap();

          let newEditorState = EditorState.push(
            editorState,
            // @ts-ignore
            ContentState.createFromBlockArray(newBlockMap.toArray()),
            'insert-fragment'
          );
          changeState(newEditorState);
          // set new state and force selection to new key block
          /*
          changeState(
            EditorState.forceSelection(
              newEditorState,
              new SelectionState({
                anchorKey: newkey,
                anchorOffset: 0,
                focusKey: newkey,
                focusOffset: 0,
              })
            )
          );
          */
        }}
      >
        *Typed Block*
      </Button>
    </div>
  );
}
