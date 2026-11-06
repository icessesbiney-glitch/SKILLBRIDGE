// Handle Electron-specific APIs if running in Electron
if ((window as any).electronAPI) {
  console.log('Running in Electron Desktop App');
  console.log('Electron Version:', (window as any).electronAPI.getVersion());
}

// Load install.js for PWA installation prompts
const script = document.createElement('script');
script.src = '/install.js';
script.async = true;
document.head.appendChild(script);
