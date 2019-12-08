import React from "react";
import { RouterProps } from "../common/types";
import { GET_SPROVIDER } from "./../graphql/sproviders";
import { useQuery } from "@apollo/react-hooks";

type Props = RouterProps;

export default function SProviderEditor({ match, history }: Props) {
  const { loading, data } = useQuery(GET_SPROVIDER, {
    variables: { id: match.params.id }
  });

  return (
    <>{loading ? <p>Loading ...</p> : <>{JSON.stringify(data.sprovider)}</>}</>
  );
}
