import React, { useContext, useState } from "react";
import { useQuery, useMutation } from "@apollo/react-hooks";
import { UPDATE_MEDIAITEMS, QUERY_INITS } from "../graphql";
import { FormCheck, Image } from "react-bootstrap";
import AddSprovider from "../components/AddSprovider";
import { AppCtxt } from "../ctx";
import { readableTime } from "../common/functions";
import { GET_SPROVIDERS, UPDATE_SPROVIDER } from "../graphql/sproviders";
import { Link } from "react-router-dom";
import DropdownSider from "../components/DropdownSider";
import { DELETE_SPROVIDER } from "./../graphql/sproviders";

interface SingleProps {
  provider: any;
}

const SingleProvider: React.FC<SingleProps> = ({ provider }: SingleProps) => {
  let {
    id,
    name,
    body,
    mediaitems,
    description,
    archived,
    extras,
    createdAt,
    updatedAt
  } = provider;
  const Markdown = require("react-markdown");

  const [deleteSprovider] = useMutation(DELETE_SPROVIDER, {
    refetchQueries: [
      { query: GET_SPROVIDERS, variables: QUERY_INITS.getSproviders }
    ]
  });

  const [updateSprovider] = useMutation(UPDATE_SPROVIDER, {
    refetchQueries: [
      { query: GET_SPROVIDERS, variables: QUERY_INITS.getSproviders }
    ]
  });

  return (
    <>
      <div className="card m-2 p-3 pr-5">
        <div className="row" style={{ direction: "rtl", textAlign: "right" }}>
          <div className="col-2">
            {mediaitems.length > 0 &&
              mediaitems.map((item: any) => (
                <div className="item" key={item.id}>
                  <Image
                    src={`http://localhost:1337${item.media.url}`}
                    width="200"
                    className="max100"
                    roundedCircle
                    alt={item.alt}
                  />
                </div>
              ))}
          </div>
          <div className="col-9">
            <Link className="d-link" to={``}>
              <h3 className="">{name}</h3> {" " + archived}
            </Link>
            <p>{description}</p>
            <div>
              <span className="post-time">{readableTime(createdAt)}</span>
              <span className="post-time text-gray-500">
                Updated:{readableTime(updatedAt)}
              </span>
            </div>
            <Markdown source={body} />
          </div>
          <DropdownSider
            actionClicked={async () => {
              if (archived !== true) {
                updateSprovider({
                  variables: { id: id, data: { archived: true } }
                });
              } else if (archived === true) {
                deleteSprovider({ variables: { id: id } });
              }
            }}
            dropItems={[
              {
                index: 0,
                label: archived === true ? " Delete " : "Archive "
              }
            ]}
          />
        </div>
      </div>
    </>
  );
};

export default function Sproviders() {
  const context = useContext(AppCtxt);

  const { loading, error, data, refetch } = useQuery(GET_SPROVIDERS, {
    variables: QUERY_INITS.getSproviders
  });

  const [updateMedia, { error: mutationError }] = useMutation(
    UPDATE_MEDIAITEMS,
    {
      variables: { where: { id: 3 }, data: { media: 1 } },
      refetchQueries: [
        { query: GET_SPROVIDERS, variables: QUERY_INITS.getSproviders }
      ]
    }
  );

  React.useEffect(() => {
    refetch();
  });

  const [localState, setLocalState] = useState({
    show_archived: false
  });

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error :(</p>;

  return (
    <>
      {mutationError && (
        <p>Error :( Please try again {mutationError.message}</p>
      )}
      <FormCheck
        type="switch"
        label="Show Only Archived"
        onChange={(e: any) => {
          setLocalState({ ...localState, show_archived: e.target.checked });
        }}
        id="custom-switch"
        checked={localState.show_archived}
      />
      {data.sproviders &&
        data.sproviders.map((provider: any) => (
          <React.Fragment key={provider.id}>
            {localState.show_archived && provider.archived && (
              <SingleProvider provider={provider} />
            )}
            {!localState.show_archived && !provider.archived && (
              <SingleProvider provider={provider} />
            )}
          </React.Fragment>
        ))}
      <AddSprovider />
      <br />
      <br />
    </>
  );
}
