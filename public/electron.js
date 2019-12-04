const electron = require("electron");
const ipcMain = electron.ipcMain;
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const BrowserView = electron.BrowserView;
const Tray = electron.Tray;
const path = require("path");
const isDev = require("electron-is-dev");
const fse = require("fs-extra");

/**@type {electron.BrowserWindow} */
let mainWindow;
/**@type {electron.BrowserWindow} */
let imageWindow;
/**@type {electron.BrowserWindow} */
let kwSearchWindow;
let tray;
/**@type {electron.BrowserView} */
let view;

global.sharedElectronObj = {
  params: {}
};
function createWindow() {
  mainWindow = new BrowserWindow({
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
  mainWindow.maximize();

  if (isDev) mainWindow.webContents.openDevTools();

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
  const kwSearch = new BrowserWindow({
    width: 600,
    height: 800,
    parent: mainWindow,
    show: false
  });
  kwSearch.on("close", e => {
    e.preventDefault();
    kwSearch.hide();
  });

  const menu = require("./contextmenu")(mainWindow);

  image.webContents.on("context-menu", function(event, params) {
    menu.popup(image, params.x, params.y);
    image.webContents.executeJavaScript(
      `console.log(${JSON.stringify(params)})`
    );
    console.log("event", event);
    console.log("params", params);
    global.sharedElectronObj = { ...global.sharedElectronObj, params };
  });

  kwSearch.webContents.on("context-menu", function(event, params) {
    menu.popup(kwSearch, params.x, params.y);
    kwSearch.webContents.executeJavaScript(
      `console.log(${JSON.stringify(params)})`
    );
    console.log("params", params);
    global.sharedElectronObj = { ...global.sharedElectronObj, params };
  });

  imageWindow = image;
  kwSearchWindow = kwSearch;

  view = new BrowserView();
  view.setBounds({ x: 30, y: 30, width: 400, height: 500 });
  view.webContents.loadURL("https://m.facebook.com");
  mainWindow.setBrowserView(view);

  view.webContents.on("context-menu", function(event, params) {
    menu.popup(view, params.x, params.y);
    mainWindow.webContents.send("CLOG", params);
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

ipcMain.on("open-kw-search", (event, data) => {
  let keyword = data.keyword ? data.keyword.replace(" ", "+") : "";
  kwSearchWindow.loadURL(`${data.url}${keyword}`);
  kwSearchWindow.show();
});

ipcMain.handle("write-files", async (event, data) => {
  console.log("write-files", data.path);
  delete data.settings.devUse;

  if (fse.existsSync(`${data.path}\\content\\post`)) {
    let done = await fse.emptyDir(`${data.path}\\content\\post`);
    console.log("remove content done " + done);
  } else {
    await fse.mkdir(`${data.path}\\content\\post`);
  }

  // Write site config file if config changed
  await fse.writeFileSync(
    `${data.path}\\config.json`,
    JSON.stringify(data.settings, null, 2)
  );

  await Promise.all(
    data.articles.map(async article => {
      fse.writeFileSync(
        `${data.path}\\content\\post\\${article.title}.md`,
        article.body
      );
    })
  );

  return true;
});
