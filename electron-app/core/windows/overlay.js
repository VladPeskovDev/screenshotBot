const { BrowserWindow, app, screen } = require("electron");
const path = require("path");
const { registerOverlayWindow, getLastOverlayText } = require("../../utils/overlayMessenger");

let overlayWindow = null;

function createOverlayWindow() {
  if (overlayWindow) return;
  const { width } = screen.getPrimaryDisplay().workAreaSize;
  const offsetX = 75;
  const panelWidth = 650;
  const x = Math.floor((width - panelWidth) / 2) - offsetX;

  overlayWindow = new BrowserWindow({
    width: 900,
    height: 80,
    x,
    y: 65,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    skipTaskbar: true,
    focusable: false,
    hasShadow: false,
    resizable: false,
    fullscreenable: false,
    show: false,
    vibrancy: "ultra-dark",
    webPreferences: {
      contextIsolation: true,
      preload: path.join(__dirname, "..", "..", "overlay-preload.js"),
    },
  });

  overlayWindow.setIgnoreMouseEvents(true, { forward: true });
  overlayWindow.setAlwaysOnTop(true, "screen-saver");
  overlayWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });

  const overlayUrl = app.isPackaged
    ? `file://${path.join(__dirname, "..", "..", "renderer", "dist", "overlay.html")}`
    : "http://localhost:5173/overlay.html";

  overlayWindow.loadURL(overlayUrl);

  overlayWindow.on("closed", () => {
    overlayWindow = null;
  });

  registerOverlayWindow(overlayWindow);
}

function toggleOverlayWindow() {
  if (!overlayWindow) {
    createOverlayWindow();
  } else {
    overlayWindow.isVisible() ? overlayWindow.hide() : overlayWindow.show();

    if (overlayWindow.isVisible()) {
      const text = getLastOverlayText();
      overlayWindow.webContents.send("update-overlay-text", text);
    }
  }
}

function getOverlayWindow() {
  return overlayWindow;
}

module.exports = {
  createOverlayWindow,
  toggleOverlayWindow,
  getOverlayWindow,
};
