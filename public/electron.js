const electron = require("electron");
const ipcMain = electron.ipcMain;
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const BrowserView = electron.BrowserView;
const Tray = electron.Tray;
const path = require("path");
const isDev = require("electron-is-dev");
/**@type {electron.BrowserWindow} */
let mainWindow;
let imageWindow;
let tray;
/**@type {electron.BrowserView} */
let view;

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
    parent: mainWindow,
    show: false
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
  view = new BrowserView();
  view.setBounds({ x: 30, y: 30, width: 400, height: 500 });
  view.webContents.loadURL("https://electronjs.org");
  mainWindow.setBrowserView(view);

  view.webContents.on("context-menu", function(event, params) {
    menu.popup(view, params.x, params.y);
    mainWindow.webContents.send("OPT_CLICKED", params);
  });
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

ipcMain.on("toggle-image", (event, arg) => {
  imageWindow.show();
});

ipcMain.on("toggle-browserview", (event, arg) => {
  let hasBrowserView = mainWindow.getBrowserView();
  if (hasBrowserView) {
    mainWindow.removeBrowserView(hasBrowserView);
  } else {
    mainWindow.setBrowserView(view);
  }
});
