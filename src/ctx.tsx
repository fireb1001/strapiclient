import React, { useReducer, createContext, useMemo } from "react";
import { Site } from "./common/types";
import { any } from "prop-types";

interface Action {}

class ChangeSite implements Action {
  type: "CHANGE_SITE" = "CHANGE_SITE";
  payload!: Site;
}

class ToggleShowArchived implements Action {
  type: "TOGGLE_SHOW_ARCHIVED" = "TOGGLE_SHOW_ARCHIVED";
  flag!: boolean;
}

class ToggleShowMediaModal implements Action {
  type: "TOGGLE_SHOW_MEDIA_MODAL" = "TOGGLE_SHOW_MEDIA_MODAL";
  payload!: any;
}

class SuggestAction implements Action {
  type: "SUGGEST_ACTION" = "SUGGEST_ACTION";
  payload!: any;
}

const initialState = {
  show_archived: false,
  show_media_modal: false,
  toggleShowState: (flag: boolean) => {},
  toggleShowMediaModal: (payload: any) => {},
  site: {} as Site,
  image_data: { src: "", alt: "", caption: "" },
  setSite: (site: any) => {},
  suggest_kw: { keyword: "" },
  suggestFn: (payload: any) => {}
};

const AppCtxt = createContext({ ...initialState });

function appReducer(state: any, action: any) {
  switch (action.type) {
    case "TOGGLE_SHOW_ARCHIVED":
      return {
        ...state,
        show_archived: action.flag
      };
    case "TOGGLE_SHOW_MEDIA_MODAL":
      return {
        ...state,
        show_media_modal: action.payload.show,
        image_data: action.payload.image_data
      };
    case "SUGGEST_ACTION":
      return {
        ...state,
        suggest_kw: action.payload
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

  function toggleShowMediaModal(payload: any) {
    let toggAction = new ToggleShowMediaModal();
    toggAction.payload = payload;
    dispatch(toggAction);
  }

  function setSite(site: Site) {
    let changeSiteAction = new ChangeSite();
    changeSiteAction.payload = site;
    dispatch(changeSiteAction);
  }

  function suggestFn(payload: any) {
    let suggestAction = new SuggestAction();
    suggestAction.payload = payload;
    dispatch(suggestAction);
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
        show_media_modal: state.show_media_modal,
        image_data: state.image_data,
        toggleShowMediaModal,
        toggleShowState,
        site: state.site as Site,
        setSite,
        suggest_kw: state.suggest_kw,
        suggestFn
      }}
      {...props}
    />
  );
}

export { AppCtxt, CtxtProvider };
