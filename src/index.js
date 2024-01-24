const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const {
  getTargetTableName,
  fetchColumnNames,
  connectToDatabase,
} = require('./database');

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

  ipcMain.on('file-request', (event) => {
    const defaultPath = app.getPath('userData'); // Adjust the default path as needed

    const dialogOptions = {
      title: 'Select the File to be uploaded',
      defaultPath: defaultPath,
      buttonLabel: 'Upload',
      filters: [
        {
          name: 'Database Files',
          extensions: ['db', 'xlsx', 'csv', 'sql'],
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
        
        // Set the targetTableName based on the selected file
        const filename = path.basename(filepath, path.extname(filepath));
        targetTableName = filename.toLowerCase();
        console.log('Target Table Name:', targetTableName);
        
        // Connect to database and fetch column names
        connectToDatabase(filepath);
      }
    })
    .catch((err) => {
      console.log(err);
    });
  });
  
  mainWindow.webContents.openDevTools();
  console.log(mainWindow.webContents);
  // Handle data submission from renderer process
  ipcMain.on('submit-form-data', (e, formData) => {
    console.log('Form data submitted:', formData);
  });
  
  // Handle data fetch
  ipcMain.on('fetch-data-request', (e) => {
    const targetTableName = getTargetTableName();
    fetchColumnNames(targetTableName);
    console.log('Data fetch requested.');
    
    // Emit 'fetch-column' event with the columns
    const columns = columns();
    mainWindow.webContents.send('fetch-column', columns);
  });
  
    mainWindow.webContents.send('test-message', 'Hello from Main process!');
}
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
