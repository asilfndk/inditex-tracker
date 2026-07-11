import { existsSync } from "node:fs";
import { join } from "node:path";
import type { BrowserWindow } from "electron";

/** Shared state for the main-window reference and the "products changed" broadcast. */

/**
 * Locates a runtime icon file both in dev (project `resources/`) and inside
 * the packaged .app (`process.resourcesPath`, see electron-builder.yml extraResources).
 */
export function resolveAsset(filename: string): string {
  const candidates = [
    join(process.cwd(), "resources", filename),
    join(process.resourcesPath ?? "", filename),
  ];
  return candidates.find((p) => existsSync(p)) ?? candidates[0];
}

let mainWindow: BrowserWindow | null = null;
let windowCreator: () => void = () => {};
const productListeners: Array<() => void> = [];

export function setMainWindow(w: BrowserWindow | null): void {
  mainWindow = w;
}

export function getMainWindow(): BrowserWindow | null {
  return mainWindow;
}

export function registerWindowCreator(fn: () => void): void {
  windowCreator = fn;
}

/** Show the window; recreate it if it was closed. */
export function showWindow(): void {
  if (mainWindow && !mainWindow.isDestroyed()) {
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.show();
    mainWindow.focus();
  } else {
    windowCreator();
  }
}

/** Send a "refresh the list" signal to the renderer (if present). */
export function pingRenderer(): void {
  mainWindow?.webContents.send("products-changed");
}

/** Bring the window to front and open the settings modal in the renderer (from the tray menu). */
export function openSettings(): void {
  showWindow();
  // Small delay so the renderer is ready if the window was just created.
  setTimeout(() => {
    getMainWindow()?.webContents.send("open-settings");
  }, 300);
}

/** Bring the window to front and open the given product selected in the renderer (notification click). */
export function openProduct(id: number): void {
  showWindow();
  // Small delay so the renderer is ready if the window was just created.
  setTimeout(() => {
    getMainWindow()?.webContents.send("open-product", id);
  }, 300);
}

export function onProductsChanged(fn: () => void): void {
  productListeners.push(fn);
}

export function emitProductsChanged(): void {
  for (const fn of productListeners) fn();
  pingRenderer();
}
