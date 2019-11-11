import React from "react";
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
  AtomicBlockUtils
} from "draft-js";
import {
  myKeyBindingFn,
  KEY_COMMANDS,
  moveBlock,
  myBlockRenderer
} from "../common/editor-functions";
// @ts-ignore
import { getSelectionEntity } from "draftjs-utils";
import linkSvg from "../common/svg/link.svg";
import monkeySee from "../common/svg/monkeySee.svg";
import { Popover, OverlayTrigger, Modal, Button } from "react-bootstrap";

interface CustomEditorProps {
  rawContent?: any;
  handleUpdateRaw: (state: any) => void;
}

enum EDIT_MODES {
  DEFAULT = "DEFAULT",
  BLOCK = "BLOCK"
}

const Link = (props: any) => {
  const { url } = props.contentState.getEntity(props.entityKey).getData();
  const [popOver, setPopOver] = React.useState(false);

  const togglePopOver = () => {
    setPopOver(!popOver);
  };

  /* <span onMouseEnter={togglePopOver} onMouseLeave={togglePopOver}></span> */

  const popoverComp = (
    <Popover id="popover-basic">
      <Popover.Content>
        <div>
          And here's some <strong>amazing</strong> content. It's very engaging.
          right?{" "}
          <img
            src={linkSvg}
            alt=""
            style={{ width: "1.6em" }}
            onClick={_ => console.log(url)}
          />
          <img
            src={monkeySee}
            alt=""
            style={{ width: "1.4em" }}
            onClick={_ => console.log(url)}
          />
        </div>
      </Popover.Content>
    </Popover>
  );

  return (
    <>
      {popOver && <></>}
      <OverlayTrigger
        trigger="click"
        placement="top"
        overlay={popoverComp}
        rootClose
      >
        <a href={url}>{props.children}</a>
      </OverlayTrigger>
    </>
  );
};

const InsertImage = (props: any) => {
  let [imageData, setImageData] = React.useState({
    src: "",
    alt: "",
    caption: ""
  });
  return (
    <>
      <label>
        URL:
        <input
          type="text"
          value={imageData.src}
          onChange={e => {
            setImageData({ ...imageData, src: e.target.value });
            props.onValue(imageData);
          }}
        />
      </label>
      <label>
        ALT:
        <input
          type="text"
          value={imageData.alt}
          onChange={e => {
            setImageData({ ...imageData, alt: e.target.value });
            props.onValue(imageData);
          }}
        />
      </label>
      <label>
        Caption:
        <input
          type="text"
          value={imageData.caption}
          onChange={e => {
            setImageData({ ...imageData, caption: e.target.value });
            props.onValue(imageData);
          }}
        />
      </label>
    </>
  );
};

interface EditorModalProps {
  show: boolean;
  onToggle: (flag: boolean) => void;
  onValue: (value: any) => void;
}

function EditorModal(props: EditorModalProps) {
  return (
    <Modal show={props.show} onHide={() => props.onToggle(false)}>
      <Modal.Header closeButton>
        <Modal.Title>Modal heading</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <InsertImage
          onValue={(value: any) => {
            props.onValue(value);
          }}
        />
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={() => props.onToggle(false)}>
          Close
        </Button>
        <Button
          variant="primary"
          onClick={() => {
            props.onToggle(false);
          }}
        >
          Save Changes
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export function CustomEditor(props: CustomEditorProps) {
  const decorator = new CompositeDecorator([
    {
      strategy: findLinkEntities,
      component: Link
    }
  ]);

  let initState;

  if (props.rawContent) {
    try {
      console.log(props.rawContent);
      initState = EditorState.createWithContent(
        convertFromRaw(props.rawContent),
        decorator
      );
    } catch (error) {
      initState = EditorState.createEmpty(decorator);
    }
  } else {
    initState = EditorState.createEmpty(decorator);
  }

  const [editorState, setEditorState] = React.useState(initState);
  const [showEditorModal, setShowEditorModal] = React.useState(false);
  const [imageData, setImageData] = React.useState({
    src: "",
    alt: "",
    caption: ""
  });

  const [editMode, setEditMode] = React.useState<EDIT_MODES>(
    EDIT_MODES.DEFAULT
  );

  const onChange = (editorState: EditorState) => {
    props.handleUpdateRaw(convertToRaw(editorState.getCurrentContent()));
    setEditorState(editorState);
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
        contentState.getEntity(entityKey).getType() === "LINK"
      );
    }, callback);
  }

  const handleKey = (command: any) => {
    let selection = editorState.getSelection();
    console.log(command);
    if (command === "bold") {
      setEditorState(RichUtils.toggleInlineStyle(editorState, "BOLD"));
      return "handled";
    }

    if (command === "code") {
      setEditorState(RichUtils.toggleBlockType(editorState, "code"));
      return "handled";
    }

    if (command === "header-one") {
      setEditorState(RichUtils.toggleBlockType(editorState, "header-one"));
      return "handled";
    }

    if (command === "header-two") {
      setEditorState(RichUtils.toggleBlockType(editorState, "header-two"));
      return "handled";
    }

    if (
      command === KEY_COMMANDS.CTRL_PAGEUP ||
      command === KEY_COMMANDS.CTRL_PAGEDOWN
    ) {
      const blockKey = editorState.getSelection().getAnchorKey();
      let newBlocksArr = moveBlock(
        editorState.getCurrentContent().getBlockMap(),
        blockKey,
        command === KEY_COMMANDS.CTRL_PAGEUP ? "UP" : "DOWN"
      );

      let newEditorState = EditorState.push(
        editorState,
        // @ts-ignore
        ContentState.createFromBlockArray(newBlocksArr),
        "change-block-data"
      );
      newEditorState = EditorState.forceSelection(
        newEditorState,
        new SelectionState({
          anchorKey: blockKey,
          anchorOffset: 0,
          focusKey: blockKey,
          focusOffset: 0
        })
      );
      setEditorState(newEditorState);
      return "handled";
    }

    // Delete current Block
    if (editMode === EDIT_MODES.BLOCK && command === KEY_COMMANDS.CTRL_D) {
      const blockKey = editorState.getSelection().getAnchorKey();
      let newBlockMap = editorState
        .getCurrentContent()
        .getBlockMap()
        .filter(block => block!.getKey() != blockKey);
      setEditorState(
        EditorState.push(
          editorState,
          // @ts-ignore
          ContentState.createFromBlockArray(newBlockMap.toArray()),
          "insert-fragment"
        )
      );
      return "handled";
    }

    if (command === "reset-style") {
      const newContentState = RichUtils.tryToRemoveBlockStyle(editorState);

      if (newContentState) {
        // @ts-ignore
        let newEditorState = EditorState.push(
          editorState,
          newContentState,
          "change-block-type"
        );

        setEditorState(newEditorState);
      }
      return "handled";
    }

    if (command === KEY_COMMANDS.CTRL_N) {
      // if in blocks edit mode then remove block style
      if (editMode === EDIT_MODES.BLOCK) {
        //Modifier.removeInlineStyle()
        const blockKey = editorState.getSelection().getAnchorKey();

        const currentBlock = editorState
          .getCurrentContent()
          .getBlockForKey(blockKey);

        let blockText = currentBlock.getText();
        let newkey = genKey();
        const newBlockMap = editorState
          .getCurrentContent()
          .getBlockMap()
          .map((block, key) => {
            if (key === blockKey) {
              return new ContentBlock({
                key: newkey,
                type: "unstyled",
                text: blockText
              });
            }
            return block;
          });

        //console.log("newBlockMap.toArray()", newBlockMap.toArray());

        setEditorState(
          EditorState.push(
            editorState,
            // @ts-ignore
            ContentState.createFromBlockArray(newBlockMap.toArray()),
            "insert-fragment"
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
      return "handled";
    }

    if (command === KEY_COMMANDS.ALT_B) {
      if (editMode === EDIT_MODES.BLOCK) setEditMode(EDIT_MODES.DEFAULT);
      else setEditMode(EDIT_MODES.BLOCK);
      return "handled";
    }

    if (command === "ctrl+s") {
      navigator.clipboard.readText().then(clipText => {
        const contentState = editorState.getCurrentContent();
        const contentStateWithEntity = contentState.createEntity(
          "LINK",
          "MUTABLE",
          { url: clipText }
        );

        console.log("getSelectionEntity", getSelectionEntity(editorState));

        if (getSelectionEntity(editorState)) {
          console.log(Entity.get(getSelectionEntity(editorState)));
        }

        const entityKey = contentStateWithEntity.getLastCreatedEntityKey();
        const newEditorState = EditorState.push(
          editorState,
          contentStateWithEntity,
          "apply-entity"
        );
        setEditorState(
          RichUtils.toggleLink(newEditorState, selection, entityKey)
        );

        console.log("selection", selection);
        console.log("! selection isCollapsed", !selection.isCollapsed());
      });
      return "handled";
    }
    console.log(`${command} not-handled`);
    return "not-handled";
  };

  function myBlockStyleFn(contentBlock: ContentBlock) {
    const blockKey = editorState.getSelection().getAnchorKey();
    if (blockKey === contentBlock.getKey()) return "every-block current-block";
    else return "every-block";
  }

  return (
    <>
      <EditorModal
        show={showEditorModal}
        onValue={value => setImageData(value)}
        onToggle={(flag: boolean) => {
          if (imageData && imageData.src) {
            // adding image block
            const contentState = editorState.getCurrentContent();
            const contentStateWithEntity = contentState.createEntity(
              "IMAGE",
              "IMMUTABLE",
              {
                src: imageData.src,
                alt: imageData.alt ? imageData.alt : "",
                caption: imageData.caption ? imageData.caption : ""
              }
            );
            const entityKey = contentStateWithEntity.getLastCreatedEntityKey();
            const newEditorState = EditorState.set(editorState, {
              currentContent: contentStateWithEntity
            });
            setEditorState(
              // its important to use whitespace
              AtomicBlockUtils.insertAtomicBlock(newEditorState, entityKey, " ")
            );
          }
          setShowEditorModal(flag);
        }}
      />
      <Editor
        editorState={editorState}
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
            currentBlock.getType() !== "unstyled" &&
            currentBlock.getText().length === 0
          ) {
            return "reset-style";
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
        style={{ width: "3em" }}
        onClick={() => {
          setShowEditorModal(true);
        }}
      />
      <span
        onClick={_ =>
          console.log(convertToRaw(editorState.getCurrentContent()))
        }
      >
        STATE
      </span>
    </>
  );
}
