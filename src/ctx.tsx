import React, { useReducer, createContext, useMemo } from "react";
import { Site } from "./common/types";

interface Action {}

class ChangeSite implements Action {
  type: "CHANGE_SITE" = "CHANGE_SITE";
  payload!: Site;
}

class ToggleShowArchived implements Action {
  type: "TOGGLE_SHOW_ARCHIVED" = "TOGGLE_SHOW_ARCHIVED";
  flag!: boolean;
}

const initialState = {
  show_archived: false,
  toggleShowState: (payload: any) => {},
  site: {} as Site,
  setSite: (site: any) => {}
};

const AppCtxt = createContext({ ...initialState });

function appReducer(state: any, action: any) {
  switch (action.type) {
    case "TOGGLE_SHOW_ARCHIVED":
      return {
        ...state,
        show_archived: action.flag
      };
    case "CHANGE_SITE":
      let changeSiteAction = action as ChangeSite;
      let site = {
        name: changeSiteAction.payload.name,
        id: changeSiteAction.payload.id
      };
      localStorage.setItem("CURRENT_SITE", JSON.stringify(site));
      return {
        ...state,
        site
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
    let toggAction = new ToggleShowArchived();
    toggAction.flag = flag;
    dispatch(toggAction);
  }

  function setSite(site: Site) {
    let changeSiteAction = new ChangeSite();
    changeSiteAction.payload = site;
    dispatch(changeSiteAction);
  }

  useMemo(() => {
    if (localStorage.getItem("CURRENT_SITE")) {
      setSite(JSON.parse("" + localStorage.getItem("CURRENT_SITE")));
    }
    console.log("state.show_archived", state.show_archived);
  }, []);

  return (
    <AppCtxt.Provider
      value={{
        show_archived: state.show_archived,
        toggleShowState,
        site: state.site as Site,
        setSite
      }}
      {...props}
    />
  );
}

export { AppCtxt, CtxtProvider };
