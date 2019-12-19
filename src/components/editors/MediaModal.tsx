import React from 'react'
import { Modal, Button } from 'react-bootstrap';
import { AppCtxt } from '../../ctx';

interface EditorModalProps {
  show: boolean;
  onToggle: (flag: boolean) => void;
  onValue: (value: any) => void;
  onSave: (imageData: any) => void;
}

const InsertImage = (props: any) => {
  let [imageData, setImageData] = React.useState(props.imageData);
  // to solve Setting React Hooks states in a sync-like manner
  React.useEffect(() => {
    props.onValue(imageData);
  }, [imageData]);

  return (
    <>
      <div className="form-group">
        <label>Source</label>
        <input
          type="text"
          className="form-control"
          value={imageData.src}
          onChange={e => setImageData({ ...imageData, src: e.target.value })}
        />
      </div>
      <div className="form-group">
        <label>ALT</label>
        <input
          type="text"
          className="form-control"
          value={imageData.alt}
          onChange={e => setImageData({ ...imageData, alt: e.target.value })}
        />
      </div>

      <div className="form-group">
        <label>Caption</label>
        <input
          type="text"
          className="form-control"
          value={imageData.caption}
          onChange={e =>
            setImageData({ ...imageData, caption: e.target.value })
          }
        />
      </div>
    </>
  );
};

export default function MediaModal(props: EditorModalProps) {
  const { image_data } = React.useContext(AppCtxt);
  let [internalImageData, setInternalImageData] = React.useState({});

  return (
    <Modal show={props.show} onHide={() => props.onToggle(false)}>
      <Modal.Header closeButton>
        <Modal.Title>Modal heading</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {JSON.stringify(image_data)}
        <InsertImage
          imageData={
            image_data ? image_data : { src: "", alt: "", caption: "" }
          }
          onValue={(value: any) => {
            props.onValue(value);
            setInternalImageData(value);
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
            console.log("internalImageData", internalImageData);
            props.onSave(internalImageData);
          }}
        >
          Save Changes
        </Button>
      </Modal.Footer>
    </Modal>
  );
}