const electron = require("electron");
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const Tray = electron.Tray;
const path = require("path");
const isDev = require("electron-is-dev");
let mainWindow;
let imageWindow;
let tray;

global.sharedElectronObj = {
  params: {}
};
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 900,
    height: 680,
    //frame: true,
    webPreferences: {
      webviewTag: true,
      nodeIntegration: true
    }
  });
  mainWindow.loadURL(
    isDev
      ? "http://localhost:3000"
      : `file://${path.join(__dirname, "../build/index.html")}`
  );

  mainWindow.on("closed", () => (mainWindow = null));
  tray = new Tray(path.join(__dirname, "./logo192.png"));
  tray.on("click", () => {
    if (mainWindow.isVisible()) {
      mainWindow.hide();
    } else {
      mainWindow.show();
    }
  });
  const image = new BrowserWindow({
    width: 400,
    height: 400,
    parent: mainWindow
  });
  image.loadURL("https://www.facebook.com/Ahmedtx22/");
  image.on("close", e => {
    e.preventDefault();
    image.hide();
  });
  const Menu = electron.Menu;
  const MenuItem = electron.MenuItem;
  const menu = new Menu();
  menu.append(
    new MenuItem({
      label: "Opt",
      click() {
        console.log("Hello clicked params > ", global.sharedElectronObj.params);
      }
    })
  );
  menu.append(new MenuItem({ type: "separator" }));
  menu.append(
    new MenuItem({ label: "Electron", type: "checkbox", checked: true })
  );
  image.webContents.on("context-menu", function(event, params) {
    menu.popup(image, params.x, params.y);
    image.webContents.executeJavaScript(
      `console.log(${JSON.stringify(params)})`
    );
    console.log("event", event);
    console.log("params", params);
    global.sharedElectronObj = { ...global.sharedElectronObj, params };
  });

  imageWindow = image;
}
app.on("ready", createWindow);
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
app.on("activate", () => {
  if (mainWindow === null) {
    createWindow();
  }
});
