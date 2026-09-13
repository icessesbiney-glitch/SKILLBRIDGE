let deferredInstallPrompt = null;

if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registered:', registration);
    } catch (error) {
      console.log('Service Worker registration failed:', error);
    }
  });
}

// Handle app installation
window.addEventListener('beforeinstallprompt', (e) => {
  // Store the event for later use
  deferredInstallPrompt = e;
  console.log('Install prompt captured:', Boolean(deferredInstallPrompt));
});

window.addEventListener('appinstalled', () => {
  console.log('SkillBridge app installed!');
  deferredInstallPrompt = null;
  console.log('Install prompt cleared:', Boolean(deferredInstallPrompt));
});
