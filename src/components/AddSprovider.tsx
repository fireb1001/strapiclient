import React, { useState } from "react";
import { Button, Modal, Form, Col, InputGroup } from "react-bootstrap";
import { useMutation } from "@apollo/react-hooks";
import { QUERY_INITS } from "../graphql";
import { CREATE_SPROVIDER, GET_SPROVIDERS } from "../graphql/sproviders";

export default function AddSprovider() {
  const [show, setShow] = useState(false);
  let titleRef = React.createRef<any>();

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const [createSprovider, { error: mutationError }] = useMutation(
    CREATE_SPROVIDER,
    {
      refetchQueries: [
        { query: GET_SPROVIDERS, variables: QUERY_INITS.getSproviders }
      ]
    }
  );

  let ipcRenderer: any;
  if (window.Electron) {
    ipcRenderer = window.require("electron").ipcRenderer;
  }

  const handleSubmit = (event: any) => {
    const form = event.currentTarget;
    event.preventDefault();
    createSprovider({ variables: { name: titleRef.current!.value } });
    titleRef.current!.value = "";
    handleClose();
  };

  return (
    <>
      <Button variant="primary" onClick={handleShow}>
        Add New Service Provider
      </Button>

      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Modal heading</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Row>
              <Form.Group as={Col} md="6" controlId="validationCustom01">
                <Form.Label>Title</Form.Label>
                <Form.Control
                  required
                  type="input"
                  placeholder="Title"
                  ref={titleRef}
                />
              </Form.Group>
              <Form.Group as={Col} md="6" controlId="validationCustom02">
                <Form.Label>Last name</Form.Label>
                <Form.Control
                  required
                  type="text"
                  placeholder="Last name"
                  defaultValue="Otto"
                />
                <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
              </Form.Group>
            </Form.Row>
            <Button type="submit">Submit form</Button>
          </Form>
        </Modal.Body>
      </Modal>
      {false && (
        <div className="row">
          <div className="col-lg-12 m-3">
            <a
              onClick={e => {
                //ipcRenderer.send("toggle-image");
                if (ipcRenderer) ipcRenderer.send("toggle-browserview");
              }}
              className="btn btn-info btn-icon-split"
            >
              <span className="icon text-white-50">
                <i className="fas fa-info-circle" />
              </span>
              <span className="text">Split Button Info</span>
            </a>
          </div>
        </div>
      )}
    </>
  );
}
