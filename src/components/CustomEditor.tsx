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

  const onChange = (editorState: EditorState) => {
    props.handleUpdateRaw(convertToRaw(editorState.getCurrentContent()));
    setEditorState(editorState);
  };

  const replaceText = async (newString: string) => {
    let newState = Modifier.replaceText(
      editorState.getCurrentContent(),
      editorState.getSelection(),
      newString
    );

    setEditorState(
      EditorState.push(editorState, newState, 'insert-characters')
    );
    await setTimeout(() => {}, 100);

    // @ts-ignore
    if (editorRef && editorRef.refs) editorRef.focus();
  };

  const editorFocus = async (blockKey: string, newEditorState: any) => {
    console.log(blockKey);

    await setTimeout(() => {}, 500);
    setEditorState(
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

  const handleKey = (command: any) => {
    let selection = editorState.getSelection();
    console.log(command);
    if (command === 'bold') {
      setEditorState(RichUtils.toggleInlineStyle(editorState, 'BOLD'));
      return 'handled';
    }

    if (command === 'code') {
      setEditorState(RichUtils.toggleBlockType(editorState, 'code'));
      return 'handled';
    }

    if (command === 'header-one') {
      setEditorState(RichUtils.toggleBlockType(editorState, 'header-one'));
      return 'handled';
    }

    if (command === 'header-two') {
      setEditorState(RichUtils.toggleBlockType(editorState, 'header-two'));
      return 'handled';
    }

    if (command === KEY_COMMANDS.CTRL_L) {
      setEditorState(
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
      setEditorState(
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

        setEditorState(newEditorState);
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
        setEditorState(
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
        setEditorState(
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

        setEditorState(
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

        setEditorState(
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
        setEditorState(
          RichUtils.toggleLink(newEditorState, selection, entityKey)
        );

        console.log('selection', selection);
        console.log('! selection isCollapsed', !selection.isCollapsed());
      });
      return 'handled';
    }
    console.log(`${command} not-handled`);
    return 'not-handled';
  };

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
              setEditorState(newEditorState);
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
              setEditorState(
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

      <Editor
        editorState={editorState}
        ref={setDomEditorRef}
        onChange={onChange}
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
        blockRendererFn={myBlockRenderer}
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
        onClick={_ =>
          console.log(convertToRaw(editorState.getCurrentContent()))
        }
      >
        STATE
      </span>
      <span
        className="bold text-dark"
        onClick={() => {
          editorFocus('ftqfh', editorState);
        }}
      >
        Focus
      </span>
      <span
        onClick={() => {
          const contentState = editorState.getCurrentContent();
          const contentStateWithEntity = contentState.createEntity(
            'Quote',
            'IMMUTABLE',
            { quote: 'تجربة مبدئية' }
          );

          const entityKey = contentStateWithEntity.getLastCreatedEntityKey();
          const newEditorState = EditorState.set(editorState, {
            currentContent: contentStateWithEntity,
          });
          //
          setEditorState(
            // its important to use whitespace
            AtomicBlockUtils.insertAtomicBlock(newEditorState, entityKey, ' ')
          );
        }}
      >
        *Quote Block*
      </span>
    </div>
  );
}
