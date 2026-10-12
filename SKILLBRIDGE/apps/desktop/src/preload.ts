import { contextBridge } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  getVersion: (): string => process.versions.electron || 'Unknown',
  getAppVersion: (): string => process.env.npm_package_version || '1.0.0',
  isDesktop: true, // Let's your frontend web components know they are running natively
});
