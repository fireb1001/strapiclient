import React from "react";
import { Dropdown } from "react-bootstrap";

export default function DropdownSider({ actionClicked, dropItems }: any) {
  return (
    <>
      <Dropdown as="span" className="col-1">
        <Dropdown.Toggle
          variant="success"
          id="dropdown-basic"
        ></Dropdown.Toggle>

        <Dropdown.Menu>
          <Dropdown.Item onClick={actionClicked}>
            {dropItems[0].label}
            {/*article.published && "Un Publish"}
            {!article.published && "Delete"*/}
          </Dropdown.Item>
          <Dropdown.Item href="#/action-2">Another action</Dropdown.Item>
          <Dropdown.Item href="#/action-3">Something else</Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>
    </>
  );
}
