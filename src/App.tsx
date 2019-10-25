import React, { useContext, useState, useEffect } from "react";
//import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";
import { BrowserRouter as Router, Route } from "react-router-dom";
import { CtxtProvider, AppCtxt } from "./ctx";
import { useQuery, useMutation } from "@apollo/react-hooks";
import { GET_SPROVIDERS, UPDATE_MEDIAITEMS, QUERY_INITS } from "./graphql";
import { FormCheck, Image } from "react-bootstrap";
import AddSprovider from "./components/AddSprovider";
import { WebviewTag } from "electron";

const NavBar: React.FC = () => {
  return (
    <>
      {/* Sidebar */}
      <ul
        className="navbar-nav bg-gradient-primary sidebar sidebar-dark accordion"
        id="accordionSidebar"
      >
        {/* Sidebar - Brand */}
        <a
          className="sidebar-brand d-flex align-items-center justify-content-center"
          href="index.html"
        >
          <div className="sidebar-brand-icon rotate-n-15">
            <i className="fas fa-laugh-wink" />
          </div>
          <div className="sidebar-brand-text mx-3">
            SB Admin <sup>2</sup>
          </div>
        </a>
        {/* Divider */}
        <hr className="sidebar-divider my-0" />
        {/* Nav Item - Dashboard */}
        <li className="nav-item active">
          <a className="nav-link" href="index.html">
            <i className="fas fa-fw fa-tachometer-alt" />
            <span>Dashboard</span>
          </a>
        </li>
        {/* Divider */}
        <hr className="sidebar-divider" />
        {/* Heading */}
        <div className="sidebar-heading">Interface</div>
        {/* Nav Item - Pages Collapse Menu */}
        <li className="nav-item">
          <a
            className="nav-link collapsed"
            href="#"
            data-toggle="collapse"
            data-target="#collapseTwo"
            aria-expanded="true"
            aria-controls="collapseTwo"
          >
            <i className="fas fa-fw fa-cog" />
            <span>Components</span>
          </a>
          <div
            id="collapseTwo"
            className="collapse"
            aria-labelledby="headingTwo"
            data-parent="#accordionSidebar"
          >
            <div className="bg-white py-2 collapse-inner rounded">
              <h6 className="collapse-header">Custom Components:</h6>
              <a className="collapse-item" href="buttons.html">
                Buttons
              </a>
              <a className="collapse-item" href="cards.html">
                Cards
              </a>
            </div>
          </div>
        </li>
        {/* Nav Item - Utilities Collapse Menu */}
        <li className="nav-item">
          <a
            className="nav-link collapsed"
            href="#"
            data-toggle="collapse"
            data-target="#collapseUtilities"
            aria-expanded="true"
            aria-controls="collapseUtilities"
          >
            <i className="fas fa-fw fa-wrench" />
            <span>Utilities</span>
          </a>
          <div
            id="collapseUtilities"
            className="collapse"
            aria-labelledby="headingUtilities"
            data-parent="#accordionSidebar"
          >
            <div className="bg-white py-2 collapse-inner rounded">
              <h6 className="collapse-header">Custom Utilities:</h6>
              <a className="collapse-item" href="utilities-color.html">
                Colors
              </a>
              <a className="collapse-item" href="utilities-border.html">
                Borders
              </a>
              <a className="collapse-item" href="utilities-animation.html">
                Animations
              </a>
              <a className="collapse-item" href="utilities-other.html">
                Other
              </a>
            </div>
          </div>
        </li>
        {/* Divider */}
        <hr className="sidebar-divider" />
        {/* Heading */}
        <div className="sidebar-heading">Addons</div>
        {/* Nav Item - Pages Collapse Menu */}
        <li className="nav-item">
          <a
            className="nav-link collapsed"
            href="#"
            data-toggle="collapse"
            data-target="#collapsePages"
            aria-expanded="true"
            aria-controls="collapsePages"
          >
            <i className="fas fa-fw fa-folder" />
            <span>Pages</span>
          </a>
          <div
            id="collapsePages"
            className="collapse"
            aria-labelledby="headingPages"
            data-parent="#accordionSidebar"
          >
            <div className="bg-white py-2 collapse-inner rounded">
              <h6 className="collapse-header">Login Screens:</h6>
              <a className="collapse-item" href="login.html">
                Login
              </a>
              <a className="collapse-item" href="register.html">
                Register
              </a>
              <a className="collapse-item" href="forgot-password.html">
                Forgot Password
              </a>
              <div className="collapse-divider" />
              <h6 className="collapse-header">Other Pages:</h6>
              <a className="collapse-item" href="404.html">
                404 Page
              </a>
              <a className="collapse-item" href="blank.html">
                Blank Page
              </a>
            </div>
          </div>
        </li>
        {/* Nav Item - Charts */}
        <li className="nav-item">
          <a className="nav-link" href="charts.html">
            <i className="fas fa-fw fa-chart-area" />
            <span>Charts</span>
          </a>
        </li>
        {/* Nav Item - Tables */}
        <li className="nav-item">
          <a className="nav-link" href="tables.html">
            <i className="fas fa-fw fa-table" />
            <span>Tables</span>
          </a>
        </li>
        {/* Divider */}
        <hr className="sidebar-divider d-none d-md-block" />
        {/* Sidebar Toggler (Sidebar) */}
        <div className="text-center d-none d-md-inline">
          <button className="rounded-circle border-0" id="sidebarToggle" />
        </div>
      </ul>
      {/* End of Sidebar */}
    </>
  );
};

interface SingleProps {
  provider: any;
}

const SingleProvider: React.FC<SingleProps> = ({ provider }: SingleProps) => {
  let { id, name, body, mediaitems } = provider;
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

        <Markdown source={body} />
      </div>
      <hr />
    </>
  );
};

const Sproviders: React.FC = () => {
  const context = useContext(AppCtxt);

  const { loading, error, data } = useQuery(GET_SPROVIDERS, {
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
};

const App: React.FC = () => {
  useEffect(() => {
    // Update the document title using the browser API
    const webview: WebviewTag | null = document.querySelector("webview");
    const { remote } = window.require("electron");

    console.log(remote.app.getVersion());

    const { Menu, MenuItem } = remote;
    const menu = new Menu();
    menu.append(
      new MenuItem({
        label: "MenuItem1",
        click() {
          console.log("item 1 clicked");
        }
      })
    );
    menu.append(new MenuItem({ type: "separator" }));
    menu.append(
      new MenuItem({ label: "MenuItem2", type: "checkbox", checked: true })
    );
    window.addEventListener("contextmenu", event => {
      event.preventDefault();
      console.log(event);
      menu.popup({ window: remote.getCurrentWindow() });
    });

    if (webview) {
      webview.addEventListener("dom-ready", () => {
        let currentURL = webview.getURL();
        console.log("currentURL is : " + currentURL);
        let titlePage = webview!.getTitle();
        console.log("titlePage is : " + titlePage);
        //webview.openDevTools();
        // executing Javascript into the webview to get the full HTML
        webview
          .executeJavaScript(
            `function gethtml () {
    return new Promise((resolve, reject) => { resolve(document.documentElement.innerHTML); });
    }
    gethtml();`
          )
          .then(html => {
            // sending the HTML to the function extractLinks
            console.log(html);
            //extractLinks(html)
          });
      });

      webview.addEventListener("contextmenu", event => {
        event.preventDefault();
        console.log(event);
        menu.popup({ window: remote.getCurrentWindow() });
      });
    }
  });

  return (
    <CtxtProvider>
      <NavBar />
      <div id="content-wrapper" className="d-flex flex-column">
        <div className="content">
          <div className="container-fluid">
            <div className="row">
              <webview
                src="https://www.facebook.com"
                style={{ display: "flex", width: "100%", minHeight: "600px" }}
                nodeintegration={true}
              />
            </div>
            <Sproviders />
          </div>
        </div>
      </div>
    </CtxtProvider>
  );
};

export default App;
