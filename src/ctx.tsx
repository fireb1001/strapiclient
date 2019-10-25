import React, { useReducer, createContext } from "react";

const initialState = { show_archived: false, toggleShowState: {} };

const AppCtxt = createContext({ ...initialState });

function appReducer(state: any, action: any) {
  switch (action.type) {
    case "TOGGLE_SHOW_ARCHIVED":
      return {
        ...state,
        show_archived: action.payload
      };
    case "LOGOUT":
      return {
        ...state,
        user: null
      };
    default:
      return state;
  }
}

function CtxtProvider(props: any) {
  const [state, dispatch] = useReducer(appReducer, { ...initialState });

  function toggleShowState(flag: boolean) {
    dispatch({ type: "TOGGLE_SHOW_ARCHIVED", payload: flag });
  }

  return (
    <AppCtxt.Provider
      value={{ show_archived: state.show_archived, toggleShowState }}
      {...props}
    />
  );
}

export { AppCtxt, CtxtProvider };
