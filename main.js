'use strict';

const electron = require('electron');
const app = electron.app;  // Module to control application life.
const BrowserWindow = electron.BrowserWindow;  // Module to create native browser window.

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
var mainWindow = null;

// Quit when all windows are closed.
app.on('window-all-closed', function() {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform != 'darwin') {
    app.quit();
  }
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.on('ready', function() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
  width: 1080,
  height: 750,
  autoHideMenuBar: true,
  useContentSize: true,
  icon: __dirname + '/assets/icon.png',
  //resizable: false,
  //maximizable: false,
  });
  mainWindow.webContents.session.on('will-download', function(event, item, webContents) {
    // Set the save path, making Electron not to prompt a save dialog.
    console.log(item.getMimeType());
    console.log(item.getFilename());
    console.log(item.getTotalBytes());
    mainWindow.webContents.executeJavaScript("showProgress();");
    item.on('updated', function() {
      console.log('Received bytes: ' + item.getReceivedBytes());
      mainWindow.webContents.executeJavaScript("updateProgress("+(parseInt(item.getReceivedBytes()) / parseInt(item.getTotalBytes()) * 100)+");");
    });
    item.on('done', function(e, state) {
      if (state == "completed") {
        console.log("Download successfully");
        mainWindow.webContents.executeJavaScript("hideProgress();");
        mainWindow.webContents.executeJavaScript("alert('Download successfully');");
      } else {
        mainWindow.webContents.executeJavaScript("hideProgress();");
        console.log("Download is cancelled or interrupted that can't be resumed");
      }
    });
  });

  // and load the index.html of the app.
  mainWindow.loadURL('file://' + __dirname + '/index.html');
  mainWindow.webContents.openDevTools();


  // Open the DevTools.
  //mainWindow.webContents.openDevTools();

  // Emitted when the window is closed.
  mainWindow.on('closed', function() {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });
});
