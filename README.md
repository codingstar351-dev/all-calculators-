# Calculator collection

A dependency-free responsive website that opens as a standard calculator and reveals an interactive collection after the unlock sequence is entered.

The standard screen also provides a password-protected scientific calculator. Its access-code dashboard keeps a 15-code set and activation statuses in the current browser's local storage. Because the site is static, these statuses do not synchronize between browsers or devices.

## Run locally

Serve this folder with any static HTTP server, then open `index.html` through that server. No build step or package installation is required.

## Project structure

- `index.html` — accessible page structure and activity panels
- `styles.css` — responsive calculator, collection, and activity styling
- `js/app.js` — calculator, unlock, navigation, and locking behavior
- `js/activities/` — one self-contained module per activity

Returning to the Calculator tab locks the collection and stops any active activity.
