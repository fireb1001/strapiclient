import React from 'react'
import { OverlayTrigger, Popover } from 'react-bootstrap';
import monkeySee from "../../common/svg/monkeySee.svg";
import linkSvg from "../../common/svg/link.svg";

const LinkComp = (props: any) => {
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

export default LinkComp;
