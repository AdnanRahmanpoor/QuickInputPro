const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const {
  getTargetTableName,
  fetchColumnNames,
  connectToDatabase,
  getColumns,
  fetchData,
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

// Handle data fetch
ipcMain.handle('fetch-data-request', async (e) => {
  console.log('Data fetch requested.');
  const targetTableName = getTargetTableName();

  try {
    await fetchColumnNames(targetTableName);

    const data = await fetchData(targetTableName);
    // Emit 'fetch-column' event with the columns
    const columns = getColumns();
    mainWindow.webContents.send('fetch-data-response', { columns, data });
    console.log('Fetched Columns:', columns);
  } catch (error) {
    console.error('Error fetching data:', error.message);
  }
});

ipcMain.on('file-request', async (event) => {
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

  try {
    const file = await dialog.showOpenDialog(dialogOptions);
    console.log(file.canceled);

    if (!file.canceled) {
      const filepath = file.filePaths[0].toString();
      console.log(filepath);
      event.reply('file', filepath);

      try {
        await connectToDatabase(filepath);

        // Set the targetTableName based on the selected file
        const filename = path.basename(filepath, path.extname(filepath));
        const targetTableName = filename.toLowerCase();
        console.log('Target Table Name:', targetTableName);
        // fetch column names
        const fetchedColumns = await fetchColumnNames(targetTableName);
        event.reply('fetch-column', fetchedColumns);
      } catch (error) {
        console.error('Error handling file request:', error.message);
      
      } }
  } catch (error) {
    console.log(error);
  }

  mainWindow.webContents.openDevTools();
  // Handle data submission from renderer process
  ipcMain.on('submit-form-data', (e, formData) => {
    console.log('Form data submitted:', formData);
  });

  mainWindow.webContents.send('test-message', 'Hello from Main process!');
});
