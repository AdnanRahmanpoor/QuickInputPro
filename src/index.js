const { app, BrowserWindow, ipcMain, dialog } = require('electron');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  mainWindow.loadFile('index.html');

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  ipcMain.on('renderer-message', (e, message) => {
    console.log('Message from Renderer process: ', message);
  });
}

ipcMain.on('file-request', (event) => {
  const defaultPath = app.getPath('userData'); // Adjust the default path as needed

  const dialogOptions = {
    title: 'Select the File to be uploaded',
    defaultPath: defaultPath,
    buttonLabel: 'Upload',
    filters: [
      {
        name: 'Database Files',
        extensions: ['db', 'xlsx', 'csv'],
      },
    ],
    properties: ['openFile'],
  };

  // Use showOpenDialog method
  dialog
    .showOpenDialog(dialogOptions)
    .then((file) => {
      console.log(file.canceled);
      if (!file.canceled) {
        const filepath = file.filePaths[0].toString();
        console.log(filepath);
        event.reply('file', filepath);
      }
    })
    .catch((err) => {
      console.log(err);
    });
});

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});
