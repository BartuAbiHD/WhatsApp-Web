const { app, BrowserWindow, Tray, Menu } = require('electron');
const fs = require('fs');
const path = require('path');

// Güncel Chrome User-Agent - WhatsApp'ın tarayıcı kontrolünü geçmek için
const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

let win = null;
let tray = null;
let isQuitting = false;

function createWindow() {
  win = new BrowserWindow({
    width: 1200,
    height: 800,
    icon: __dirname + '/icon.ico',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      javascript: true,
    }
  });
  win.setMenuBarVisibility(false);
  win.loadURL('https://web.whatsapp.com', { userAgent: USER_AGENT });

  // WhatsApp Web için gerekli izinleri otomatik kabul et
  const allowedPermissions = ['notifications', 'media', 'mediaKeySystem', 'clipboard-read', 'clipboard-sanitized-write'];

  win.webContents.session.setPermissionRequestHandler((webContents, permission, callback) => {
    const url = webContents.getURL();
    // Sadece WhatsApp'tan gelen izin isteklerini kabul et
    if (url.startsWith('https://web.whatsapp.com') && allowedPermissions.includes(permission)) {
      callback(true);
    } else {
      callback(false);
    }
  });

  // Pencere kapatılınca gizle, uygulamayı kapatma
  win.on('close', (event) => {
    if (!isQuitting) {
      event.preventDefault();
      win.hide();
    }
  });
}

function createTray() {
  tray = new Tray(__dirname + '/icon.ico');

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'WhatsApp Web',
      enabled: false
    },
    { type: 'separator' },
    {
      label: 'Göster',
      click: () => {
        win.show();
        win.focus();
      }
    },
    {
      label: 'Çıkış',
      click: () => {
        isQuitting = true;
        app.quit();
      }
    }
  ]);

  tray.setToolTip('WhatsApp Web');
  tray.setContextMenu(contextMenu);

  // Tray ikonuna çift tıklayınca pencereyi göster
  tray.on('double-click', () => {
    win.show();
    win.focus();
  });
}

app.whenReady().then(() => {
  createWindow();
  createTray();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// Uygulamayı tamamen kapatmadan önce
app.on('before-quit', () => {
  isQuitting = true;
});
