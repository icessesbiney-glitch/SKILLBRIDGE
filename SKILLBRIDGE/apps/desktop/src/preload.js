// Production fallback preload configuration for electron-is-dev wrapper
import { contextBridge } from 'electron';

try {
  contextBridge.exposeInMainWorld('electronIsDev', {
    isDev: false, // Explicitly forces production mode flag inside CI servers
  });
} catch (e) {
  console.warn('Dev environment indicator proxy initialization skipped in headless container context.');
}

export {};
