import { app, BrowserWindow } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    webPreferences: {
      contextIsolation: true,
    },
  });

  // Load the static file for warehouse-app
mainWindow.loadURL(`file://${__dirname}/out/warehouse-app/index.html`);

  // Optional: open dev tools for debugging
  // win.webContents.openDevTools();
}

app.whenReady().then(createWindow);
