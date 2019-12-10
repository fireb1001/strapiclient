import React from "react";
import { FormCheck } from "react-bootstrap";
import { useQuery, useMutation } from "@apollo/react-hooks";
import {
  GET_CUSTOMTYPES,
  DELETE_CUSTOMTYPE,
  UPDATE_CUSTOMTYPE
} from "../graphql/customtype";
import { AppCtxt } from "../ctx";
import { Customtype } from "../common/types";
import { QUERY_INITS } from "./../graphql";
import { CREATE_CUSTOMTYPE } from "./../graphql/customtype";
import { useHistory, Link } from "react-router-dom";
import { readableTime } from "../common/functions";
import DropdownSider from "../components/DropdownSider";

interface SingleProps {
  customtype: Customtype;
}

const SingleCustom: React.FC<SingleProps> = ({ customtype }: SingleProps) => {
  const [deleteCustomtype] = useMutation(DELETE_CUSTOMTYPE, {
    refetchQueries: [
      { query: GET_CUSTOMTYPES, variables: QUERY_INITS.getCustomtypes }
    ]
  });

  const [updateCustomtype] = useMutation(UPDATE_CUSTOMTYPE, {
    refetchQueries: [
      { query: GET_CUSTOMTYPES, variables: QUERY_INITS.getCustomtypes }
    ]
  });

  return (
    <>
      <div className="card m-2 p-3 pr-5">
        <div className="row" style={{ direction: "rtl", textAlign: "right" }}>
          <div className="col-2">
            {customtype.extras && customtype.extras.cover && (
              <img
                className="card-img3"
                src={customtype.extras.cover}
                alt="Card image cap"
                style={{ maxWidth: "100%" }}
              />
            )}
          </div>
          <div className="col-9">
            <Link className="d-link" to={`/customtype_editor/${customtype.id}`}>
              <h3 className="">{customtype.title}</h3>{" "}
              {" " + customtype.published}
            </Link>
            <p>{customtype.description}</p>
            <div>
              <span className="post-time">
                {readableTime(customtype.createdAt)}
              </span>
              <span className="post-time text-gray-500">
                Updated:{readableTime(customtype.updatedAt)}
              </span>
            </div>
          </div>
          <DropdownSider
            actionClicked={async (action: string) => {
              if (action === "toggArchive") {
                if (customtype.published) {
                  updateCustomtype({
                    variables: { id: customtype.id, data: { published: false } }
                  });
                } else if (!customtype.published) {
                  deleteCustomtype({ variables: { id: customtype.id } });
                }
              } else if (action === "publish") {
                updateCustomtype({
                  variables: { id: customtype.id, data: { published: true } }
                });
              }
            }}
            dropItems={[
              {
                action: "toggArchive",
                label: customtype.published ? "Un Publish " : " Delete "
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

export default function Customtypes() {
  const context = React.useContext(AppCtxt);

  const { loading, error, data, refetch } = useQuery(GET_CUSTOMTYPES, {
    variables: QUERY_INITS.getCustomtypes
  });

  const [createCustomtype] = useMutation(CREATE_CUSTOMTYPE);

  React.useEffect(() => {
    refetch();
  });

  const [localState, setLocalState] = React.useState({
    show_archived: false
  });
  const { site } = React.useContext(AppCtxt);
  let history = useHistory();

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
      {data.customtypes &&
        data.customtypes.map((customPost: Customtype) => (
          <React.Fragment key={customPost.id}>
            {localState.show_archived && customPost.published === false && (
              <SingleCustom customtype={customPost} />
            )}
            {!localState.show_archived &&
              (customPost.published || customPost.published === null) && (
                <SingleCustom customtype={customPost} />
              )}
          </React.Fragment>
        ))}
      <button
        className="btn btn-primary"
        onClick={async () => {
          let newPost = await createCustomtype({
            variables: { site: site.id, title: "New", type: "product" }
          });
          let post_id = newPost.data.createCustomtype.customtype.id;
          history.push(`/customtype_editor/${post_id}`);
        }}
      >
        Add New Post
      </button>
      <br />
      <br />
    </>
  );
}
