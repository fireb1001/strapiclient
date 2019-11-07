const electron = require("electron");
const Menu = electron.Menu;
const MenuItem = electron.MenuItem;
const menu = new Menu();

/**@param {electron.BrowserWindow} mainWindow*/
module.exports = function(mainWindow) {
  menu.append(
    new MenuItem({
      label: "Opt",
      /**@param {electron.BrowserWindow} activeWindow*/
      click(item, activeWindow) {
        console.log("OPT clicked");
        mainWindow.webContents.send(
          "OPT_ACTION",
          global.sharedElectronObj.params
        );
      }
    })
  );
  menu.append(new MenuItem({ type: "separator" }));
  menu.append(
    new MenuItem({ label: "Electron", type: "checkbox", checked: true })
  );
  return menu;
};
