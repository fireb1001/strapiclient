import React, { useContext, useState } from "react";
import { useQuery, useMutation } from "@apollo/react-hooks";
import { GET_SPROVIDERS, UPDATE_MEDIAITEMS, QUERY_INITS } from "../graphql";
import { FormCheck, Image } from "react-bootstrap";
import AddSprovider from "../components/AddSprovider";
import { AppCtxt } from "../ctx";

interface SingleProps {
  provider: any;
}

const SingleProvider: React.FC<SingleProps> = ({ provider }: SingleProps) => {
  let { name, body, mediaitems, description } = provider;
  const Markdown = require("react-markdown");
  return (
    <>
      <div>
        {mediaitems.length > 0 &&
          mediaitems.map((item: any) => (
            <div className="item" key={item.id}>
              <Image
                src={`http://localhost:1337${item.media.url}`}
                width="200"
                roundedCircle
                alt={item.alt}
              />
            </div>
          ))}
        <h1>{name}</h1>
        <p>{description}</p>

        <Markdown source={body} />
      </div>
      <hr />
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
    </>
  );
}
