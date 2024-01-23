const { ipcRenderer } = require('electron');

document.addEventListener('DOMContentLoaded', () => {
  const viewTab = document.getElementById('viewTab');
  const enterTab = document.getElementById('enterTab');

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

  // Initial Tab
  switchTab('viewTab');

  // send message to main ipc

  window.sendMessageToMain = () => {
    const message = 'Hello from the renderer process';
    ipcRenderer.send('renderer-message', message);
  };
});
