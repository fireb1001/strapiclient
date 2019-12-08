import React from "react";
import { Dropdown } from "react-bootstrap";
import { DropItem } from "../common/types";

export default function DropdownSider({ actionClicked, dropItems }: any) {
  return (
    <>
      <Dropdown as="span" className="col-1">
        <Dropdown.Toggle
          variant="success"
          id="dropdown-basic"
        ></Dropdown.Toggle>

        <Dropdown.Menu>
          {dropItems &&
            dropItems.map((item: DropItem) => (
              <Dropdown.Item
                key={item.action}
                onClick={(e: any) => actionClicked(item.action)}
              >
                {item.label}
              </Dropdown.Item>
            ))}
        </Dropdown.Menu>
      </Dropdown>
    </>
  );
}

{
  /*article.published && "Un Publish"}
<Dropdown.Item href="#/action-2">Another action</Dropdown.Item>
{!article.published && "Delete"*/
}
