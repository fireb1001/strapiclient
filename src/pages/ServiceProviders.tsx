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
import { Sprovider } from "../common/types";

interface SingleProps {
  provider: Sprovider;
}

const SingleProvider: React.FC<SingleProps> = ({ provider }: SingleProps) => {
  //const Markdown = require("react-markdown");

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
            {/* provider.mediaitems.length > 0 &&
              provider.mediaitems.map((item: any) => (
                <div className="item" key={item.id}>
                  <Image
                    src={`http://localhost:1337${item.media.url}`}
                    width="200"
                    className="max100"
                    roundedCircle
                    alt={item.alt}
                  />
                </div>
              )) */}
            {provider.extras && provider.extras.cover && (
              <img
                className="card-img3"
                src={provider.extras.cover}
                alt="Card image cap"
                style={{ maxWidth: "100%" }}
              />
            )}
          </div>
          <div className="col-9">
            <Link className="d-link" to={`/sprovider_editor/${provider.id}`}>
              <h3 className="">{provider.name}</h3> {" " + provider.archived}
            </Link>
            <p>{provider.description}</p>
            <p>{JSON.stringify(provider.sites)}</p>
            <div>
              <span className="post-time">
                {readableTime(provider.createdAt)}
              </span>
              <span className="post-time text-gray-500">
                Updated:{readableTime(provider.updatedAt)}
              </span>
            </div>
            {/*  <Markdown source={body} /> */}
          </div>
          <DropdownSider
            actionClicked={async (action: string) => {
              if (action === "toggArchive") {
                if (provider.archived !== true) {
                  updateSprovider({
                    variables: { id: provider.id, data: { archived: true } }
                  });
                } else if (provider.archived === true) {
                  deleteSprovider({ variables: { id: provider.id } });
                }
              } else if (action === "publish") {
                updateSprovider({
                  variables: { id: provider.id, data: { archived: false } }
                });
              }
            }}
            dropItems={[
              {
                action: "toggArchive",
                label: provider.archived === true ? " Delete " : "Archive "
              },
              {
                action: "publish",
                label: "Publish "
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
  /*
  const [updateMedia, { error: mutationError }] = useMutation(
    UPDATE_MEDIAITEMS,
    {
      variables: { where: { id: 3 }, data: { media: 1 } },
      refetchQueries: [
        { query: GET_SPROVIDERS, variables: QUERY_INITS.getSproviders }
      ]
    }
  );
  */

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
        data.sproviders.map((provider: Sprovider) => (
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
