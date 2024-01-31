const { ipcRenderer } = require('electron');

document.addEventListener('DOMContentLoaded', () => {
  console.log('Renderer process loaded.');
  const viewTab = document.getElementById('viewTab');
  const enterTab = document.getElementById('enterTab');

  // Add an event listener for a button click in renderer.js

  // Switching between tabs
  window.switchTab = (tabname) => {
    if (tabname === 'viewTab') {
      console.log('vt');
      viewTab.style.display = 'block';
      enterTab.style.display = 'none';
    } else if (tabname === 'enterTab') {
      console.log('et');
      enterTab.style.display = 'block';
      viewTab.style.display = 'none';
    }
  };

  window.openFile = () => {
    ipcRenderer.send('file-request');
  };

  // Handle the reply from the main process
  ipcRenderer.on('file', (e, filepath) => {
    console.log('Selected File:', filepath);
  });

  // Form Submission
  window.submitFormData = () => {
    const formData = {};

    // Fetch column names dynamically
    const columnInputs = document.querySelectorAll('.data-entry-input');

    columnInputs.forEach((input) => {
      const columnName = input.getAttribute('data-column');
      formData[columnName] = input.value;
    });

    ipcRenderer.send('submit-form-data', formData);
  };

  const createDataEntryForm = (columns) => {
    console.log('Creating data entry form with columns:', columns);
    enterTab.innerHTML = '';

    const form = document.createElement('form');

    // Create input fields for each column
    columns.forEach((column) => {
      const input = document.createElement('input');
      input.setAttribute('type', 'text');
      input.setAttribute('placeholder', column);
      input.setAttribute('data-column', column);
      input.classList.add('data-entry-input');
      form.appendChild(input);
    });

    // Submit Button
    const submitButton = document.createElement('button');
    submitButton.textContent = 'Submit';
    submitButton.setAttribute('type', 'button');
    submitButton.addEventListener('click', window.submitFormData);
    form.appendChild(submitButton);

    enterTab.appendChild(form);
  };

  let columnsFetched = false;

  // Fetching data & populate table
  window.fetchDataAndPopulateTable = async () => {
    try {
      if (!columnsFetched) {
        await ipcRenderer.invoke('fetch-data-request');
        columnsFetched = true;
      }
    } catch (error) {
      console.error('Error fetching data:', error.message);
    }
  };

  // Populate the data table
  const populateDataTable = (columns, data) => {
    const dataTable = document.getElementById('data-table');

    // Create table headers
    const headerRow = dataTable.querySelector('thead tr');
    columns.forEach((column) => {
      const headerCell = document.createElement('th');
      headerCell.textContent = column;
      headerRow.appendChild(headerCell);
    });

    // Create Table Row
    const tbody = dataTable.querySelector('tbody');
    console.log('Data:', data);
    Object.keys(data).forEach((row) => {
      // this line is showing the error
      const rowElement = document.createElement('tr');

      columns.forEach((column) => {
        const cell = document.createElement('td');
        cell.textContent = row[column];
        rowElement.appendChild(cell);
      });

      tbody.appendChild(rowElement);
    });
  };

  // Handle reply for fetching columns and creating form
  ipcRenderer.on('fetch-column', (e, columns) => {
    console.log('Received columns:', columns);
    
    if (!columnsFetched) {
      fetchDataAndPopulateTable();
    }
  });
  
  ipcRenderer.on('fetch-data-response', (e, { columns, data }) => {
    console.log('Received columns and data:', columns, data);
    
    createDataEntryForm(columns);
    populateDataTable(columns, data);
  });

  // Initial Tab
  switchTab('viewTab');
  // send message to main ipc

  window.sendMessageToMain = () => {
    const message = 'Hello from the renderer process';
    ipcRenderer.send('renderer-message', message);
  };
});
