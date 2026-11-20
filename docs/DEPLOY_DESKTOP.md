# Desktop Distribution Status

The desktop wrapper is not part of the currently validated web/mobile launch scope. Do not create a desktop production tag or manually dispatch the desktop workflows.

The current desktop workflow files still reference the obsolete nested `SKILLBRIDGE/` directory, while the active source is at the repository root. The installed desktop toolchain also has unresolved high and critical audit findings, including Electron 27.3.11, electron-builder 24.13.3, and tar 6.2.1. Resolving these requires major dependency upgrades and verified Windows, macOS, and Linux builds.

The macOS signing and notarization steps in the existing workflows are placeholders. Do not describe desktop artifacts as signed or notarized. Re-enable desktop distribution only after correcting the workflow paths, upgrading and auditing the toolchain, and completing platform-specific packaging, signing, and installation tests.
