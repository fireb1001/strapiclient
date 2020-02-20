import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import { Map } from 'immutable';
import InlineEditable from '../InlineEditable';

interface DataModalProps {
  show: boolean;
  payload: Map<any, any>;
  onToggle: (flag: boolean) => void;
  onSave: (imageData: any) => void;
}

export default function DataModal(props: DataModalProps) {
  let [inData, setInData] = React.useState(props.payload);
  let { payload } = props;

  React.useEffect(() => {
    if (payload) {
      setInData(payload);
    }
  }, [payload]);

  return (
    <Modal show={props.show} onHide={() => props.onToggle(false)}>
      <Modal.Header closeButton>
        <Modal.Title>Modal heading</Modal.Title>
      </Modal.Header>
      <Modal.Body style={{ direction: 'rtl' }}>
        <InlineEditable
          html={inData.get('text')}
          onChange={newVal => setInData(inData.set('text', newVal))}
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
            props.onSave(inData);
          }}
        >
          Save Changes
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
