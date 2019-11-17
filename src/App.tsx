import React, { useEffect } from "react";
//import "bootstrap/dist/css/bootstrap.min.css";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import "./App.css";
import { HashRouter as Router, Route } from "react-router-dom";
import { CtxtProvider } from "./ctx";
import { WebviewTag } from "electron";
import SideBar from "./components/SideBar";
import SitesDashboard from "./pages/SitesDashboard";
import Sproviders from "./pages/ServiceProviders";
import Articles from "./pages/Articles";
import { TopNavbar } from "./components/TopNavbar";

import ArticleEditor from "./pages/ArticleEditor";
import SiteSettings from "./pages/SiteSettings";

const App: React.FC = () => {
  useEffect(() => {
    // Update the document title using the browser API
    const webview: WebviewTag | null = document.querySelector("webview");

    if (window.process && window.process.versions.electron) {
      const { remote, ipcRenderer } = window.require("electron");
      ipcRenderer.on("CLOG", (event, message) => {
        console.log(message);
      });
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
              // console.log(html);
              //extractLinks(html)
            });
        });

        webview.addEventListener("contextmenu", event => {
          event.preventDefault();
          console.log(event);
          menu.popup({ window: remote.getCurrentWindow() });
        });
      }
    }
  });
  const trueAsStr = "true" as any;
  const goBackPressed = () => {
    console.log("goBackPressed App file");
    window.dispatchEvent(new Event("goBackPressed"));
  };

  return (
    <CtxtProvider>
      <Router>
        <div id="wrapper" style={{ width: "100%" }}>
          <SideBar />
          <div id="content-wrapper" className="d-flex flex-column">
            <div className="content">
              <TopNavbar goBackPressed={goBackPressed} />
              {false && (
                <div className="row">
                  <webview
                    src="https://www.youtube.com"
                    style={{
                      display: "flex",
                      width: "80%",
                      minHeight: "200px"
                    }}
                    nodeintegration={trueAsStr}
                  />
                </div>
              )}
              <div className="container-fluid">
                <Route path="/" exact component={Articles} />
                <Route path="/sproviders" exact component={Sproviders} />
                <Route path="/sites" component={SitesDashboard} />
                <Route path="/article_editor/:id" component={ArticleEditor} />
                <Route
                  path="/site_settings/:site_id"
                  component={SiteSettings}
                />
              </div>
            </div>
          </div>
        </div>
      </Router>
    </CtxtProvider>
  );
};

export default App;
