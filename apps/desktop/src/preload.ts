import { contextBridge } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  getVersion: () => process.versions.electron,
  getAppVersion: () => process.env.npm_package_version,
});
