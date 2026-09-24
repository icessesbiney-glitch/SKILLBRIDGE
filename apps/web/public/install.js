// Clean browser-isolated script block to register the SkillBridge PWA architecture
(function () {
  if (typeof window === 'undefined') return;

  // Initialize secure custom storage onto the local window object array instance
  window.deferredInstallPrompt = null;

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', async () => {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('SkillBridge core service worker registered:', registration.scope);
      } catch (error) {
        console.warn('SkillBridge service worker registration skipped in non-secure or development environment.', error);
      }
    });
  }

  // Handle systemic app installation capture events cleanly
  window.addEventListener('beforeinstallprompt', (e) => {
    // Stop the default browser popup banner loop from showing randomly
    e.preventDefault();
    
    // Cache the event payload securely onto the window workspace object
    window.deferredInstallPrompt = e;
    
    console.log('SkillBridge PWA install trigger event captured successfully.');
    
    // Dispatch a global custom event so your React components know the install button is ready to show
    window.dispatchEvent(new CustomEvent('skillbridge-can-install'));
  });

  window.addEventListener('appinstalled', () => {
    console.log('SkillBridge deployment application successfully installed onto the native system frame.');
    window.deferredInstallPrompt = null;
  });
})();
