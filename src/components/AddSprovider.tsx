import React, { useState } from "react";
import { Button, Modal, Form, Col, InputGroup } from "react-bootstrap";
import { useMutation } from "@apollo/react-hooks";
import { GET_SPROVIDERS, CREATE_SPROVIDER, QUERY_INITS } from "../graphql";

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

  const handleSubmit = (event: any) => {
    const form = event.currentTarget;
    console.log(titleRef.current!.value);
    event.preventDefault();

    createSprovider({ variables: { name: titleRef.current!.value } });
    titleRef.current!.value = "";
    handleClose();
  };
  let ipcRenderer: any;
  if (window.Electron) {
    ipcRenderer = window.require("electron").ipcRenderer;
  }
  return (
    <>
      <Button variant="primary" onClick={handleShow}>
        Launch demo modal
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
      {true && (
        <div className="row">
          <div className="col-lg-12 m-3">
            <a
              onClick={e => {
                console.log(e);

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

          <div className="col-lg-6 mb-4">
            <div className="card bg-primary text-white shadow">
              <div className="card-body">
                Primary
                <div className="text-white-50 small">#4e73df</div>
              </div>
            </div>
          </div>
          <div className="col-lg-6 mb-4">
            <div className="card bg-success text-white shadow">
              <div className="card-body">
                Success
                <div className="text-white-50 small">#1cc88a</div>
              </div>
            </div>
          </div>
          <div className="col-lg-6 mb-4">
            <div className="card bg-info text-white shadow">
              <div className="card-body">
                Info
                <div className="text-white-50 small">#36b9cc</div>
              </div>
            </div>
          </div>
          <div className="col-lg-6 mb-4">
            <div className="card bg-warning text-white shadow">
              <div className="card-body">
                Warning
                <div className="text-white-50 small">#f6c23e</div>
              </div>
            </div>
          </div>
          <div className="col-lg-6 mb-4">
            <div className="card bg-danger text-white shadow">
              <div className="card-body">
                Danger
                <div className="text-white-50 small">#e74a3b</div>
              </div>
            </div>
          </div>
          <div className="col-lg-6 mb-4">
            <div className="card bg-secondary text-white shadow">
              <div className="card-body">
                Secondary
                <div className="text-white-50 small">#858796</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
