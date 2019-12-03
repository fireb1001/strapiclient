import React from "react";
import Articles from "./Articles";

export default function Dashboard() {
  return (
    <div className="row">
      <div className="col-7">
        <Articles />
      </div>
    </div>
  );
}
